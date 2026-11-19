package com.vu4ll.monedsa

import android.content.Intent
import androidx.core.content.FileProvider
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager
import java.io.File

/**
 * Writes a UTF-8 text file to the app cache and opens the Android share sheet with it.
 * Used by the v1.6 data export (monedsa-export-YYYY-MM-DD.json).
 */
class ExportShareModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  override fun getName() = "ExportShare"

  @ReactMethod
  fun shareFile(fileName: String, content: String, mimeType: String, title: String, promise: Promise) {
    try {
      val dir = File(context.cacheDir, "exports").apply { mkdirs() }
      val file = File(dir, File(fileName).name)
      file.writeText(content, Charsets.UTF_8)

      val uri = FileProvider.getUriForFile(context, "${context.packageName}.exportprovider", file)
      val send = Intent(Intent.ACTION_SEND).apply {
        type = mimeType
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_SUBJECT, file.name)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      val chooser = Intent.createChooser(send, title).apply {
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        if (context.currentActivity == null) addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      (context.currentActivity ?: context).startActivity(chooser)
      promise.resolve(file.absolutePath)
    } catch (e: Exception) {
      promise.reject("EXPORT_SHARE_FAILED", e.message, e)
    }
  }
}

class ExportSharePackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
      listOf(ExportShareModule(context))

  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> =
      emptyList()
}
