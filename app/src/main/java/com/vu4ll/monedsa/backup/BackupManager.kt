package com.vu4ll.monedsa.backup

import androidx.room.withTransaction
import com.vu4ll.monedsa.data.AppDatabase
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.data.DefaultCategories
import com.vu4ll.monedsa.data.TransactionEntity
import com.vu4ll.monedsa.data.TxType
import kotlinx.serialization.json.Json
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant

class BackupException(message: String) : Exception(message)

class BackupManager(private val db: AppDatabase) {
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = false; encodeDefaults = true }

    suspend fun exportJson(): String {
        val (cats, txs) = db.withTransaction { db.categories().all() to db.transactions().all() }
        val file = BackupFile(
            exportedAt = Instant.now().toString(),
            categories = cats.map { BackupCategory(it.id.toString(), it.name, it.colorHex, it.type.wire, it.icon) },
            transactions = txs.map {
                BackupTransaction(
                    amount = BigDecimal.valueOf(it.amountMinor, 2).toDouble(),
                    description = it.description,
                    categoryId = it.categoryId.toString(),
                    type = it.type.wire,
                    createdAt = Instant.ofEpochMilli(it.date).toString(),
                )
            },
        )
        return json.encodeToString(BackupFile.serializer(), file)
    }

    /** Parses and validates without touching the database. */
    fun parse(text: String): BackupFile {
        val file = try {
            json.decodeFromString(BackupFile.serializer(), text)
        } catch (e: Exception) {
            throw BackupException("Not a valid Monedsa backup file")
        }
        if (file.app != "monedsa") throw BackupException("Not a Monedsa backup file")
        if (file.schemaVersion > 1) throw BackupException("Backup was made by a newer app version")
        val ids = file.categories.map { it.id }.toSet()
        file.transactions.firstOrNull { it.categoryId !in ids }?.let {
            throw BackupException("Backup references a missing category")
        }
        return file
    }

    /** Replaces all local data with the file's content. All-or-nothing. */
    suspend fun restore(file: BackupFile) {
        val cats = file.categories.map {
            it.id to CategoryEntity(
                name = it.name.trim().take(50),
                colorHex = it.color,
                type = parseType(it.type),
                icon = it.icon ?: DefaultCategories.guessIcon(it.name),
            )
        }
        db.withTransaction {
            db.transactions().deleteAll()
            db.categories().deleteAll()
            val newIds = db.categories().insertAll(cats.map { it.second })
            val idMap = cats.map { it.first }.zip(newIds).toMap()
            db.transactions().insertAll(
                file.transactions.map { t ->
                    TransactionEntity(
                        amountMinor = BigDecimal.valueOf(t.amount).setScale(2, RoundingMode.HALF_UP)
                            .unscaledValue().toLong(),
                        description = t.description.take(500),
                        categoryId = idMap.getValue(t.categoryId),
                        type = parseType(t.type),
                        date = runCatching { Instant.parse(t.createdAt).toEpochMilli() }
                            .getOrElse { throw BackupException("Invalid date: ${t.createdAt}") },
                    )
                },
            )
        }
    }

    private fun parseType(s: String) = when (s.lowercase()) {
        "expense" -> TxType.EXPENSE
        "income" -> TxType.INCOME
        else -> throw BackupException("Unknown type: $s")
    }

    private val TxType.wire get() = name.lowercase()
}
