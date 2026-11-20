package com.vu4ll.monedsa.ui

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material.icons.outlined.BrightnessAuto
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FileOpen
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vu4ll.monedsa.ui.theme.LocalMoneyColors
import com.vu4ll.monedsa.ui.theme.Tabular
import androidx.compose.ui.unit.dp
import androidx.core.os.LocaleListCompat
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.BuildConfig
import com.vu4ll.monedsa.ui.components.ChoiceSheet
import com.vu4ll.monedsa.ui.components.ConfirmDialog
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.backup.BackupException
import com.vu4ll.monedsa.backup.BackupFile
import com.vu4ll.monedsa.backup.BackupWorker
import com.vu4ll.monedsa.backup.DriveAuth
import com.vu4ll.monedsa.data.AutoBackup
import com.vu4ll.monedsa.data.Prefs
import com.vu4ll.monedsa.data.Settings
import com.vu4ll.monedsa.data.ThemeMode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DateFormat
import java.util.Date
import java.util.Locale

private const val PRIVACY_URL = "https://monedsa.vu4ll.nl/privacy-policy"
private const val SOURCE_URL = "https://github.com/Vu4ll/monedsa"
private const val ISSUES_URL = "https://github.com/Vu4ll/monedsa/issues/new"
private const val STORE_URL = "https://play.google.com/store/apps/details?id=com.vu4ll.monedsa"

/** What to do once Drive authorization succeeds. */
private enum class DriveAction { CONNECT, BACKUP, RESTORE }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(c: AppContainer, s: Settings) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    var dialog by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    var pendingAction by remember { mutableStateOf<DriveAction?>(null) }
    var pendingRestore by remember { mutableStateOf<BackupFile?>(null) }
    val allTime by c.db.transactions().observeStats().collectAsStateWithLifecycle(null)

    fun msg(id: Int, vararg args: Any) = scope.launch { snackbar.showSnackbar(ctx.getString(id, *args)) }

    fun errorMsg(e: Exception) = scope.launch {
        snackbar.showSnackbar(if (e is BackupException) e.message.orEmpty() else ctx.getString(R.string.error_drive))
    }

    suspend fun runWithToken(action: DriveAction, token: String) {
        when (action) {
            DriveAction.CONNECT -> {
                c.prefs.setDriveConnected(true)
                msg(R.string.drive_connected)
            }
            DriveAction.BACKUP -> {
                c.drive.upload(token, c.backup.exportJson())
                c.prefs.setDriveConnected(true)
                c.prefs.setLastBackupAt(System.currentTimeMillis())
                msg(R.string.backup_done)
            }
            DriveAction.RESTORE -> {
                val text = c.drive.download(token)
                if (text == null) msg(R.string.no_backup_found)
                else pendingRestore = withContext(Dispatchers.Default) { c.backup.parse(text) }
            }
        }
    }

    val consent = rememberLauncherForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { res ->
        val action = pendingAction ?: return@rememberLauncherForActivityResult
        pendingAction = null
        if (res.resultCode != Activity.RESULT_OK) {
            // A cancel returns no data; a Google-side error (e.g. no OAuth client) carries a status.
            if (res.data != null) runCatching { c.drive.handleConsentResult(res.data) }.onFailure { e ->
                android.util.Log.w("Monedsa", "Drive authorization failed", e)
                msg(R.string.error_drive_auth, e.message.orEmpty())
            }
            return@rememberLauncherForActivityResult
        }
        scope.launch {
            busy = true
            try {
                when (val auth = c.drive.handleConsentResult(res.data)) {
                    is DriveAuth.Token -> runWithToken(action, auth.value)
                    is DriveAuth.NeedsConsent -> msg(R.string.error_drive)
                }
            } catch (e: Exception) {
                errorMsg(e)
            } finally {
                busy = false
            }
        }
    }

    fun drive(action: DriveAction) = scope.launch {
        busy = true
        try {
            when (val auth = c.drive.authorize()) {
                is DriveAuth.Token -> runWithToken(action, auth.value)
                is DriveAuth.NeedsConsent -> {
                    pendingAction = action
                    consent.launch(IntentSenderRequest.Builder(auth.intent.intentSender).build())
                }
            }
        } catch (e: Exception) {
            errorMsg(e)
        } finally {
            busy = false
        }
    }

    val importFile = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        uri ?: return@rememberLauncherForActivityResult
        scope.launch {
            try {
                val text = withContext(Dispatchers.IO) {
                    ctx.contentResolver.openInputStream(uri)!!.bufferedReader().use { it.readText() }
                }
                pendingRestore = withContext(Dispatchers.Default) { c.backup.parse(text) }
            } catch (e: Exception) {
                errorMsg(if (e is BackupException) e else BackupException(ctx.getString(R.string.error_import)))
            }
        }
    }

    fun open(url: String) = ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))

    val space = com.vu4ll.monedsa.ui.LocalBottomBarSpace.current
    Scaffold(
        contentWindowInsets = androidx.compose.foundation.layout.WindowInsets(0, 0, 0, 0),
        topBar = { TopAppBar(title = { Text(stringResource(R.string.nav_settings)) }) },
        snackbarHost = { SnackbarHost(snackbar, modifier = Modifier.padding(bottom = space)) },
    ) { pad ->
        Column(Modifier.fillMaxSize().padding(pad).verticalScroll(rememberScrollState())) {
            allTime?.let { st ->
                Section(R.string.all_time)
                ListItem(
                    headlineContent = {
                        Text(
                            Format.balance(st.balance, s.currency),
                            style = MaterialTheme.typography.headlineSmall.merge(Tabular),
                            color = if (st.balance < 0) LocalMoneyColors.current.negative else MaterialTheme.colorScheme.onSurface,
                        )
                    },
                    supportingContent = {
                        Text(
                            stringResource(R.string.all_time_desc, Format.money(st.totalIncome, s.currency), Format.money(st.totalExpense, s.currency)) +
                                "\n" + pluralStringResource(R.plurals.n_transactions, st.total, st.total),
                        )
                    },
                    leadingContent = { Icon(Icons.Default.AccountBalanceWallet, null) },
                )
                HorizontalDivider(Modifier.padding(vertical = 8.dp))
            }
            Section(R.string.section_display)
            val themeLabel = stringResource(themeLabel(s.theme))
            Row(Icons.Default.Palette, R.string.theme, themeLabel) { dialog = "theme" }
            Row(Icons.Default.Language, R.string.language, currentLanguageName()) { dialog = "language" }
            Row(Icons.Default.Payments, R.string.currency, s.currency) { dialog = "currency" }

            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Section(R.string.section_backup)
            if (!s.driveConnected) {
                Row(Icons.Default.CloudOff, R.string.drive_connect, stringResource(R.string.drive_connect_desc)) {
                    drive(DriveAction.CONNECT)
                }
            } else {
                if (s.driveNeedsReconnect) {
                    Row(Icons.Default.Warning, R.string.drive_reconnect, stringResource(R.string.drive_reconnect_desc)) {
                        drive(DriveAction.CONNECT)
                    }
                }
                val last = s.lastBackupAt?.let {
                    DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(it))
                } ?: stringResource(R.string.never)
                Row(Icons.Default.CloudUpload, R.string.backup_now, stringResource(R.string.last_backup, last)) {
                    drive(DriveAction.BACKUP)
                }
                Row(Icons.Default.CloudDownload, R.string.restore_drive, stringResource(R.string.restore_drive_desc)) {
                    drive(DriveAction.RESTORE)
                }
                Row(Icons.Default.Schedule, R.string.auto_backup, stringResource(autoLabel(s.autoBackup))) {
                    dialog = "auto"
                }
                Row(Icons.Default.CloudDone, R.string.drive_disconnect, null) {
                    scope.launch {
                        c.prefs.setDriveConnected(false)
                        c.prefs.setAutoBackup(AutoBackup.OFF)
                        BackupWorker.schedule(ctx, AutoBackup.OFF)
                    }
                }
            }
            Row(Icons.Default.FileOpen, R.string.import_file, stringResource(R.string.import_file_desc)) {
                importFile.launch(arrayOf("application/json", "text/plain", "application/octet-stream"))
            }

            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Section(R.string.section_about)
            Row(Icons.Default.Info, R.string.version, BuildConfig.VERSION_NAME) {}
            Row(Icons.Default.Code, R.string.source_code, null, trailingLink = true) { open(SOURCE_URL) }
            Row(Icons.Default.Policy, R.string.privacy_policy, null, trailingLink = true) { open(PRIVACY_URL) }
            Row(Icons.Default.BugReport, R.string.report_issue, null, trailingLink = true) { open(ISSUES_URL) }
            Row(Icons.Default.Star, R.string.rate_app, null, trailingLink = true) { open(STORE_URL) }
            androidx.compose.foundation.layout.Spacer(Modifier.padding(bottom = space))
        }
    }

    if (busy) AlertDialog(onDismissRequest = {}, confirmButton = {}, text = { CircularProgressIndicator() })

    when (dialog) {
        "theme" -> ChoiceDialog(R.string.theme, ThemeMode.entries, s.theme, { stringResource(themeLabel(it)) }, { dialog = null }, icon = ::themeIcon) {
            scope.launch { c.prefs.setTheme(it) }
        }
        "currency" -> ChoiceDialog(R.string.currency, Prefs.CURRENCIES, s.currency, { currencyLabel(it) }, { dialog = null }, { currencyName(it) }) {
            scope.launch { c.prefs.setCurrency(it) }
        }
        "language" -> {
            val current = AppCompatDelegate.getApplicationLocales().get(0)?.language ?: ""
            ChoiceDialog(R.string.language, listOf("", "en", "tr", "nl"), current, { languageName(it) }, { dialog = null }) {
                AppCompatDelegate.setApplicationLocales(
                    if (it.isEmpty()) LocaleListCompat.getEmptyLocaleList() else LocaleListCompat.forLanguageTags(it),
                )
            }
        }
        "auto" -> ChoiceDialog(R.string.auto_backup, AutoBackup.entries, s.autoBackup, { stringResource(autoLabel(it)) }, { dialog = null }) {
            scope.launch {
                c.prefs.setAutoBackup(it)
                BackupWorker.schedule(ctx, it)
            }
        }
    }

    pendingRestore?.let { file ->
        ConfirmDialog(
            title = stringResource(R.string.restore_confirm_title),
            text = stringResource(R.string.restore_confirm_text, file.transactions.size, file.categories.size),
            confirmLabel = stringResource(R.string.restore),
            dismissLabel = stringResource(R.string.cancel),
            onDismiss = { pendingRestore = null },
            onConfirm = {
                pendingRestore = null
                scope.launch {
                    try {
                        c.backup.restore(file)
                        msg(R.string.restore_done)
                    } catch (e: Exception) {
                        errorMsg(if (e is BackupException) e else BackupException(ctx.getString(R.string.error_import)))
                    }
                }
            },
        )
    }
}

@Composable
private fun Section(title: Int) {
    Text(
        stringResource(title), style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 4.dp),
    )
}

@Composable
private fun Row(icon: ImageVector, title: Int, subtitle: String?, trailingLink: Boolean = false, onClick: () -> Unit) {
    ListItem(
        headlineContent = { Text(stringResource(title)) },
        supportingContent = subtitle?.let { { Text(it) } },
        leadingContent = { Icon(icon, null) },
        trailingContent = if (trailingLink) {
            { Icon(Icons.AutoMirrored.Filled.OpenInNew, null) }
        } else null,
        modifier = Modifier.clickable(onClick = onClick),
    )
}

@Composable
private fun <T> ChoiceDialog(
    title: Int,
    options: List<T>,
    selected: T,
    label: @Composable (T) -> String,
    onDismiss: () -> Unit,
    subtitle: @Composable (T) -> String? = { null },
    icon: ((T) -> ImageVector)? = null,
    onPick: (T) -> Unit,
) = ChoiceSheet(stringResource(title), options, selected, label, onDismiss, subtitle, icon, onPick)

private fun themeIcon(t: ThemeMode) = when (t) {
    ThemeMode.SYSTEM -> Icons.Outlined.BrightnessAuto
    ThemeMode.LIGHT -> Icons.Outlined.LightMode
    ThemeMode.DARK -> Icons.Outlined.DarkMode
}

private fun themeLabel(t: ThemeMode) = when (t) {
    ThemeMode.SYSTEM -> R.string.theme_system
    ThemeMode.LIGHT -> R.string.theme_light
    ThemeMode.DARK -> R.string.theme_dark
}

private fun autoLabel(a: AutoBackup) = when (a) {
    AutoBackup.OFF -> R.string.auto_off
    AutoBackup.DAILY -> R.string.auto_daily
    AutoBackup.WEEKLY -> R.string.auto_weekly
}

private fun currencyLabel(code: String): String =
    "$code (${java.util.Currency.getInstance(code).getSymbol(Locale.getDefault())})"

private fun currencyName(code: String): String =
    java.util.Currency.getInstance(code).getDisplayName(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) }

@Composable
private fun languageName(tag: String): String =
    if (tag.isEmpty()) stringResource(R.string.language_system)
    else Locale.forLanguageTag(tag).let { it.getDisplayName(it).replaceFirstChar { c -> c.uppercase(it) } }

@Composable
private fun currentLanguageName(): String =
    languageName(AppCompatDelegate.getApplicationLocales().get(0)?.language ?: "")
