package com.vu4ll.monedsa.backup

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.AuthorizationResult
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.Scope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response

/** Result of asking Google for a Drive token. */
sealed interface DriveAuth {
    data class Token(val value: String) : DriveAuth
    /** User consent is needed; launch this from an Activity. */
    data class NeedsConsent(val intent: PendingIntent) : DriveAuth
}

class DriveException(message: String) : Exception(message)

/**
 * Stores a single backup file in the app's hidden Drive "appDataFolder".
 * Only the drive.appdata scope is requested: the app can't see the user's other files.
 */
class DriveBackup(private val context: Context) {
    private val http = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true }

    private val request = AuthorizationRequest.builder()
        .setRequestedScopes(listOf(Scope(SCOPE)))
        .build()

    suspend fun authorize(): DriveAuth {
        val result = Identity.getAuthorizationClient(context).authorize(request).await()
        return result.toAuth()
    }

    /** Call with the data Intent from the consent screen. */
    fun handleConsentResult(data: Intent?): DriveAuth =
        Identity.getAuthorizationClient(context).getAuthorizationResultFromIntent(data).toAuth()

    private fun AuthorizationResult.toAuth(): DriveAuth {
        val pi = pendingIntent
        return when {
            hasResolution() && pi != null -> DriveAuth.NeedsConsent(pi)
            accessToken != null -> DriveAuth.Token(accessToken!!)
            else -> throw DriveException("Google authorization failed")
        }
    }

    data class RemoteFile(val id: String, val modifiedTime: String)

    suspend fun find(token: String): RemoteFile? = withContext(Dispatchers.IO) {
        val url = "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder" +
            "&q=name%3D'$FILE_NAME'&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc"
        call(Request.Builder().url(url).auth(token).build()).use { r ->
            val files = json.parseToJsonElement(r.body!!.string()).jsonObject["files"]!!.jsonArray
            files.firstOrNull()?.jsonObject?.let {
                RemoteFile(it["id"]!!.jsonPrimitive.content, it["modifiedTime"]!!.jsonPrimitive.content)
            }
        }
    }

    suspend fun upload(token: String, content: String) = withContext(Dispatchers.IO) {
        val media = content.toRequestBody(JSON)
        val existing = find(token)
        val req = if (existing == null) {
            val meta = """{"name":"$FILE_NAME","parents":["appDataFolder"]}""".toRequestBody(JSON)
            val body = MultipartBody.Builder().setType("multipart/related".toMediaType())
                .addPart(meta).addPart(media).build()
            Request.Builder()
                .url("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart")
                .post(body)
        } else {
            Request.Builder()
                .url("https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media")
                .patch(media)
        }
        call(req.auth(token).build()).close()
    }

    /** Returns null when there's no backup on Drive yet. */
    suspend fun download(token: String): String? = withContext(Dispatchers.IO) {
        val file = find(token) ?: return@withContext null
        val req = Request.Builder()
            .url("https://www.googleapis.com/drive/v3/files/${file.id}?alt=media")
            .auth(token).build()
        call(req).use { it.body!!.string() }
    }

    private fun Request.Builder.auth(token: String) = header("Authorization", "Bearer $token")

    private fun call(req: Request): Response {
        val r = http.newCall(req).execute()
        if (!r.isSuccessful) {
            val code = r.code
            r.close()
            throw DriveException("Google Drive error ($code)")
        }
        return r
    }

    companion object {
        const val SCOPE = "https://www.googleapis.com/auth/drive.appdata"
        const val FILE_NAME = "monedsa-backup.json"
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
