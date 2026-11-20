package com.vu4ll.monedsa.data

import androidx.room.ColumnInfo
import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

enum class TxType { EXPENSE, INCOME }

@Entity(
    tableName = "categories",
    indices = [Index(value = ["name", "type"], unique = true)],
)
data class CategoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val colorHex: String,
    val type: TxType,
    val createdAt: Long = System.currentTimeMillis(),
    /** Key from CategoryIcons; unknown keys fall back to a generic icon. */
    @ColumnInfo(defaultValue = DefaultCategories.FALLBACK_ICON) val icon: String = DefaultCategories.FALLBACK_ICON,
)

/** Money is stored in minor units (cents) to avoid floating point drift. */
@Entity(
    tableName = "transactions",
    foreignKeys = [
        ForeignKey(
            entity = CategoryEntity::class,
            parentColumns = ["id"],
            childColumns = ["categoryId"],
            onDelete = ForeignKey.RESTRICT,
        ),
    ],
    indices = [Index("categoryId"), Index("date")],
)
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val amountMinor: Long,
    val description: String = "",
    val categoryId: Long,
    val type: TxType,
    /** Epoch millis of when the transaction happened. */
    val date: Long,
)

data class TransactionWithCategory(
    @Embedded val tx: TransactionEntity,
    @ColumnInfo(name = "categoryName") val categoryName: String,
    @ColumnInfo(name = "categoryColor") val categoryColor: String,
    @ColumnInfo(name = "categoryIcon") val categoryIcon: String,
)

data class Stats(
    val total: Int,
    val expenseCount: Int,
    val incomeCount: Int,
    val totalExpense: Long,
    val totalIncome: Long,
) {
    val balance: Long get() = totalIncome - totalExpense
}

data class CategoryTotal(
    val categoryId: Long,
    val name: String,
    val colorHex: String,
    val icon: String,
    val total: Long,
)

data class CategoryUsage(val categoryId: Long, val count: Int)

enum class SortBy { DATE, AMOUNT }

data class TxFilter(
    val type: TxType? = null,
    val categoryId: Long? = null,
    val minAmountMinor: Long? = null,
    val maxAmountMinor: Long? = null,
    /** Inclusive start, epoch millis. */
    val from: Long? = null,
    /** Exclusive end, epoch millis. */
    val until: Long? = null,
    val sortBy: SortBy = SortBy.DATE,
    val ascending: Boolean = false,
) {
    val isActive: Boolean
        get() = type != null || categoryId != null || minAmountMinor != null ||
            maxAmountMinor != null || from != null || until != null
}
