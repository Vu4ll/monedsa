package com.vu4ll.monedsa

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.vu4ll.monedsa.backup.BackupException
import com.vu4ll.monedsa.backup.BackupManager
import com.vu4ll.monedsa.data.AppDatabase
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.data.SortBy
import com.vu4ll.monedsa.data.TransactionEntity
import com.vu4ll.monedsa.data.TxFilter
import com.vu4ll.monedsa.data.TxType
import com.vu4ll.monedsa.ui.Format
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.ext.junit.runners.AndroidJUnit4

@RunWith(AndroidJUnit4::class)
class DataTest {
    private lateinit var db: AppDatabase
    private var food = 0L
    private var salary = 0L

    @Before
    fun setUp() = runTest {
        db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext(), AppDatabase::class.java)
            .allowMainThreadQueries().build()
        val c = db.categories()
        food = c.insert(CategoryEntity(name = "Food", colorHex = "#FF6B6B", type = TxType.EXPENSE))
        salary = c.insert(CategoryEntity(name = "Salary", colorHex = "#FECA57", type = TxType.INCOME))
        val t = db.transactions()
        t.insert(TransactionEntity(amountMinor = 1250, categoryId = food, type = TxType.EXPENSE, date = 1_000, description = "lunch"))
        t.insert(TransactionEntity(amountMinor = 4000, categoryId = food, type = TxType.EXPENSE, date = 3_000))
        t.insert(TransactionEntity(amountMinor = 250000, categoryId = salary, type = TxType.INCOME, date = 2_000))
    }

    @After
    fun tearDown() = db.close()

    private suspend fun list(f: TxFilter) = db.transactions().observe(f).first().map { it.tx.amountMinor }

    @Test
    fun defaultSortIsNewestFirst() = runTest {
        assertEquals(listOf(4000L, 250000L, 1250L), list(TxFilter()))
    }

    @Test
    fun sortByAmountAscending() = runTest {
        assertEquals(listOf(1250L, 4000L, 250000L), list(TxFilter(sortBy = SortBy.AMOUNT, ascending = true)))
    }

    @Test
    fun filters() = runTest {
        assertEquals(listOf(4000L, 1250L), list(TxFilter(type = TxType.EXPENSE)))
        assertEquals(listOf(250000L), list(TxFilter(categoryId = salary)))
        assertEquals(listOf(4000L), list(TxFilter(minAmountMinor = 2000, maxAmountMinor = 5000)))
        assertEquals(listOf(250000L, 1250L), list(TxFilter(from = 1_000, until = 3_000)))
    }

    @Test
    fun joinsCategory() = runTest {
        val row = db.transactions().observe(TxFilter(categoryId = food)).first().last()
        assertEquals("Food", row.categoryName)
        assertEquals("#FF6B6B", row.categoryColor)
    }

    @Test
    fun stats() = runTest {
        val s = db.transactions().observeStats().first()
        assertEquals(3, s.total)
        assertEquals(2, s.expenseCount)
        assertEquals(1, s.incomeCount)
        assertEquals(5250L, s.totalExpense)
        assertEquals(250000L, s.totalIncome)
        assertEquals(244750L, s.balance)
    }

    @Test
    fun backupRoundTrip() = runTest {
        val mgr = BackupManager(db)
        val before = db.transactions().observe(TxFilter()).first().map { Triple(it.tx.amountMinor, it.categoryName, it.tx.date) }
        val json = mgr.exportJson()
        db.transactions().deleteAll()
        db.categories().deleteAll()
        mgr.restore(mgr.parse(json))
        val after = db.transactions().observe(TxFilter()).first().map { Triple(it.tx.amountMinor, it.categoryName, it.tx.date) }
        assertEquals(before, after)
        assertEquals(2, db.categories().all().size)
    }

    @Test
    fun importsOldServerExport() = runTest {
        val old = """
            {"schemaVersion":1,"exportedAt":"2026-11-01T10:00:00.000Z","app":"monedsa",
             "categories":[{"id":"66a1f0c2e4b0a1b2c3d4e5f6","name":"Yemek","color":"#FF6B6B","type":"expense"}],
             "transactions":[{"amount":19.99,"description":"x","categoryId":"66a1f0c2e4b0a1b2c3d4e5f6","type":"expense","createdAt":"2026-10-30T12:34:56.789Z"}]}
        """.trimIndent()
        val mgr = BackupManager(db)
        mgr.restore(mgr.parse(old))
        val rows = db.transactions().observe(TxFilter()).first()
        assertEquals(1, rows.size)
        assertEquals(1999L, rows[0].tx.amountMinor)
        assertEquals("Yemek", rows[0].categoryName)
    }

    @Test(expected = BackupException::class)
    fun rejectsDanglingCategory() {
        BackupManager(db).parse(
            """{"categories":[],"transactions":[{"amount":1,"categoryId":"x","type":"expense","createdAt":"2026-01-01T00:00:00Z"}]}""",
        )
    }

    @Test
    fun parseAmount() {
        assertEquals(1250L, Format.parseAmount("12,5"))
        assertEquals(1250L, Format.parseAmount("12.50"))
        assertEquals(100L, Format.parseAmount("1"))
        assertEquals(1L, Format.parseAmount("0.005"))
        assertNull(Format.parseAmount("1.2.3"))
        assertNull(Format.parseAmount("abc"))
        assertNull(Format.parseAmount(""))
    }
}
