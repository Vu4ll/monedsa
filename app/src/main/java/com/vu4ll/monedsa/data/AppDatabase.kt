package com.vu4ll.monedsa.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import java.util.Locale

@Database(entities = [CategoryEntity::class, TransactionEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun categories(): CategoryDao
    abstract fun transactions(): TransactionDao

    companion object {
        fun create(context: Context): AppDatabase =
            Room.databaseBuilder(context, AppDatabase::class.java, "monedsa.db")
                .addCallback(object : Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        seedDefaults(db, Locale.getDefault().language)
                    }
                })
                .build()

        /** Inserts the default categories in the device language (first launch only). */
        fun seedDefaults(db: SupportSQLiteDatabase, language: String) {
            val now = System.currentTimeMillis()
            DefaultCategories.forLanguage(language).forEach { c ->
                db.insert(
                    "categories",
                    SQLiteDatabase.CONFLICT_IGNORE,
                    ContentValues().apply {
                        put("name", c.name)
                        put("colorHex", c.colorHex)
                        put("type", c.type.name)
                        put("createdAt", now)
                    },
                )
            }
        }
    }
}
