package com.vu4ll.monedsa.data

import com.vu4ll.monedsa.data.TxType.EXPENSE
import com.vu4ll.monedsa.data.TxType.INCOME

/** Same defaults the old server seeded (server/seeds/categorySeed.js). */
object DefaultCategories {
    data class Default(val name: String, val colorHex: String, val type: TxType)

    private val colors = listOf(
        "#FF6B6B" to EXPENSE, "#4ECDC4" to EXPENSE, "#45B7D1" to EXPENSE, "#96CEB4" to EXPENSE,
        "#FFB347" to EXPENSE, "#7D5FFF" to EXPENSE, "#3C6382" to EXPENSE, "#F8A5C2" to EXPENSE,
        "#FECA57" to INCOME, "#FF9FF3" to INCOME, "#54A0FF" to INCOME, "#00B894" to INCOME,
        "#636E72" to INCOME,
    )

    private val names = mapOf(
        "en" to listOf("Food", "Transport", "Entertainment", "Shopping", "Health", "Education", "Bill", "Gift",
            "Salary", "Freelance", "Investment", "Bonus", "Refund"),
        "tr" to listOf("Yemek", "Ulaşım", "Eğlence", "Alışveriş", "Sağlık", "Eğitim", "Fatura", "Hediye",
            "Maaş", "Freelance", "Yatırım", "Prim", "İade"),
        "nl" to listOf("Eten", "Vervoer", "Plezier", "Winkelen", "Gezondheid", "Onderwijs", "Factuur", "Cadeau",
            "Salaris", "Freelance", "Investering", "Premie", "Retourneren"),
    )

    fun forLanguage(language: String): List<Default> =
        (names[language] ?: names.getValue("en")).zip(colors) { n, (c, t) -> Default(n, c, t) }
}
