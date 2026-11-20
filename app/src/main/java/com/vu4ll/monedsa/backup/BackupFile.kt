package com.vu4ll.monedsa.backup

import kotlinx.serialization.Serializable

/**
 * Shared by Drive backups and the one-time export from the old (server-based) app.
 * Ids are strings so old MongoDB ObjectIds import as-is; they're remapped on import.
 */
@Serializable
data class BackupFile(
    val schemaVersion: Int = 1,
    val exportedAt: String = "",
    val app: String = "monedsa",
    val categories: List<BackupCategory> = emptyList(),
    val transactions: List<BackupTransaction> = emptyList(),
)

@Serializable
data class BackupCategory(
    val id: String,
    val name: String,
    val color: String = "#39BE56",
    val type: String,
)

@Serializable
data class BackupTransaction(
    /** Major units, e.g. 12.5 */
    val amount: Double,
    val description: String = "",
    val categoryId: String,
    val type: String,
    /** ISO-8601 instant of when the transaction happened. */
    val createdAt: String,
)
