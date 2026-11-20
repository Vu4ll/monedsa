package com.vu4ll.monedsa.backup

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.vu4ll.monedsa.MonedsaApp
import com.vu4ll.monedsa.data.AutoBackup
import java.util.concurrent.TimeUnit

class BackupWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val c = (applicationContext as MonedsaApp).container
        if (!c.prefs.current().driveConnected) return Result.success()
        return try {
            when (val auth = c.drive.authorize()) {
                is DriveAuth.NeedsConsent -> {
                    // Can't show UI from the background; Settings will ask the user to reconnect.
                    c.prefs.setDriveNeedsReconnect(true)
                    Result.failure()
                }
                is DriveAuth.Token -> {
                    c.drive.upload(auth.value, c.backup.exportJson())
                    c.prefs.setLastBackupAt(System.currentTimeMillis())
                    Result.success()
                }
            }
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        private const val NAME = "auto-backup"

        fun schedule(context: Context, mode: AutoBackup) {
            val wm = WorkManager.getInstance(context)
            if (mode == AutoBackup.OFF) {
                wm.cancelUniqueWork(NAME)
                return
            }
            val req = PeriodicWorkRequestBuilder<BackupWorker>(mode.days, TimeUnit.DAYS)
                .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED, requiresBatteryNotLow = true))
                .build()
            wm.enqueueUniquePeriodicWork(NAME, ExistingPeriodicWorkPolicy.UPDATE, req)
        }
    }
}
