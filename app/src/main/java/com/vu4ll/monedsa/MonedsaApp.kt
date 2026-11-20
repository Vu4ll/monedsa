package com.vu4ll.monedsa

import android.app.Application
import com.vu4ll.monedsa.backup.BackupManager
import com.vu4ll.monedsa.backup.DriveBackup
import com.vu4ll.monedsa.data.AppDatabase
import com.vu4ll.monedsa.data.Prefs

/** Hand-rolled DI: everything the app needs, created once. */
class AppContainer(app: Application) {
    val db = AppDatabase.create(app)
    val prefs = Prefs(app)
    val backup = BackupManager(db)
    val drive = DriveBackup(app)
}

class MonedsaApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
