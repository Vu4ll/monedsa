package com.vu4ll.monedsa.data

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.util.Locale

enum class ThemeMode { SYSTEM, LIGHT, DARK }
enum class AutoBackup(val days: Long) { OFF(0), DAILY(1), WEEKLY(7) }

data class Settings(
    val theme: ThemeMode,
    val currency: String,
    val driveConnected: Boolean,
    val driveNeedsReconnect: Boolean,
    val autoBackup: AutoBackup,
    val lastBackupAt: Long?,
)

private val Context.store by preferencesDataStore("settings")

class Prefs(private val context: Context) {
    private object K {
        val theme = stringPreferencesKey("theme")
        val currency = stringPreferencesKey("currency")
        val driveConnected = booleanPreferencesKey("drive_connected")
        val driveNeedsReconnect = booleanPreferencesKey("drive_needs_reconnect")
        val autoBackup = stringPreferencesKey("auto_backup")
        val lastBackupAt = longPreferencesKey("last_backup_at")
    }

    val settings: Flow<Settings> = context.store.data.map { it.toSettings() }

    suspend fun current(): Settings = settings.first()

    private fun Preferences.toSettings() = Settings(
        theme = this[K.theme]?.let { runCatching { ThemeMode.valueOf(it) }.getOrNull() } ?: ThemeMode.SYSTEM,
        currency = this[K.currency] ?: defaultCurrency(),
        driveConnected = this[K.driveConnected] ?: false,
        driveNeedsReconnect = this[K.driveNeedsReconnect] ?: false,
        autoBackup = this[K.autoBackup]?.let { runCatching { AutoBackup.valueOf(it) }.getOrNull() } ?: AutoBackup.OFF,
        lastBackupAt = this[K.lastBackupAt],
    )

    suspend fun setTheme(v: ThemeMode) = context.store.edit { it[K.theme] = v.name }
    suspend fun setCurrency(v: String) = context.store.edit { it[K.currency] = v }

    /**
     * Saves the locale-based default once. Without this, changing the phone's
     * language would silently switch the currency every amount is shown in.
     */
    suspend fun pinDefaultCurrency() = context.store.edit {
        if (it[K.currency] == null) it[K.currency] = defaultCurrency()
    }
    suspend fun setAutoBackup(v: AutoBackup) = context.store.edit { it[K.autoBackup] = v.name }
    suspend fun setDriveConnected(v: Boolean) = context.store.edit {
        it[K.driveConnected] = v
        it[K.driveNeedsReconnect] = false
    }
    suspend fun setDriveNeedsReconnect(v: Boolean) = context.store.edit { it[K.driveNeedsReconnect] = v }
    suspend fun setLastBackupAt(v: Long) = context.store.edit { it[K.lastBackupAt] = v }

    companion object {
        val CURRENCIES = listOf("USD", "EUR", "GBP", "TRY")

        // Same mapping the RN app used (src/contexts/CurrencyContext.js).
        fun defaultCurrency(): String = when (Locale.getDefault().language) {
            "tr" -> "TRY"
            "nl" -> "EUR"
            else -> if (Locale.getDefault().country == "GB") "GBP" else "USD"
        }
    }
}
