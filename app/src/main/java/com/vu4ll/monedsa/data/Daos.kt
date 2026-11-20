package com.vu4ll.monedsa.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.RawQuery
import androidx.room.Update
import androidx.sqlite.db.SimpleSQLiteQuery
import androidx.sqlite.db.SupportSQLiteQuery
import kotlinx.coroutines.flow.Flow

@Dao
interface CategoryDao {
    @Query("SELECT * FROM categories ORDER BY type, name COLLATE NOCASE")
    fun observeAll(): Flow<List<CategoryEntity>>

    @Query("SELECT * FROM categories")
    suspend fun all(): List<CategoryEntity>

    @Query("SELECT COUNT(*) FROM transactions WHERE categoryId = :id")
    suspend fun usageCount(id: Long): Int

    @Insert
    suspend fun insert(c: CategoryEntity): Long

    @Insert
    suspend fun insertAll(c: List<CategoryEntity>): List<Long>

    @Update
    suspend fun update(c: CategoryEntity)

    @Delete
    suspend fun delete(c: CategoryEntity)

    @Query("DELETE FROM categories")
    suspend fun deleteAll()
}

@Dao
interface TransactionDao {
    @RawQuery(observedEntities = [TransactionEntity::class, CategoryEntity::class])
    fun observeRaw(q: SupportSQLiteQuery): Flow<List<TransactionWithCategory>>

    fun observe(f: TxFilter): Flow<List<TransactionWithCategory>> = observeRaw(buildQuery(f))

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun get(id: Long): TransactionEntity?

    @Query("SELECT * FROM transactions")
    suspend fun all(): List<TransactionEntity>

    @Query(
        """
        SELECT COUNT(*) AS total,
               COALESCE(SUM(type = 'EXPENSE'), 0) AS expenseCount,
               COALESCE(SUM(type = 'INCOME'), 0) AS incomeCount,
               COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amountMinor END), 0) AS totalExpense,
               COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amountMinor END), 0) AS totalIncome
        FROM transactions
        """,
    )
    fun observeStats(): Flow<Stats>

    @Insert
    suspend fun insert(t: TransactionEntity): Long

    @Insert
    suspend fun insertAll(t: List<TransactionEntity>)

    @Update
    suspend fun update(t: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("DELETE FROM transactions")
    suspend fun deleteAll()

    companion object {
        fun buildQuery(f: TxFilter): SupportSQLiteQuery {
            val where = mutableListOf<String>()
            val args = mutableListOf<Any>()
            f.type?.let { where += "t.type = ?"; args += it.name }
            f.categoryId?.let { where += "t.categoryId = ?"; args += it }
            f.minAmountMinor?.let { where += "t.amountMinor >= ?"; args += it }
            f.maxAmountMinor?.let { where += "t.amountMinor <= ?"; args += it }
            f.from?.let { where += "t.date >= ?"; args += it }
            f.until?.let { where += "t.date < ?"; args += it }
            val order = if (f.ascending) "ASC" else "DESC"
            val sort = when (f.sortBy) {
                SortBy.DATE -> "t.date $order, t.id $order"
                SortBy.AMOUNT -> "t.amountMinor $order, t.date DESC"
            }
            val sql = buildString {
                append("SELECT t.*, c.name AS categoryName, c.colorHex AS categoryColor ")
                append("FROM transactions t JOIN categories c ON c.id = t.categoryId")
                if (where.isNotEmpty()) append(" WHERE ").append(where.joinToString(" AND "))
                append(" ORDER BY ").append(sort)
            }
            return SimpleSQLiteQuery(sql, args.toTypedArray())
        }
    }
}
