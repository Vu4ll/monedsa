package com.vu4ll.monedsa.data

import com.vu4ll.monedsa.data.TxType.EXPENSE
import com.vu4ll.monedsa.data.TxType.INCOME
import java.util.Locale

/** Same defaults the old server seeded (server/seeds/categorySeed.js), now with icons. */
object DefaultCategories {
    const val FALLBACK_ICON = "category"

    data class Default(val name: String, val colorHex: String, val type: TxType, val icon: String)

    private data class Slot(val color: String, val type: TxType, val icon: String)

    private val slots = listOf(
        Slot("#FF6B6B", EXPENSE, "restaurant"), Slot("#4ECDC4", EXPENSE, "bus"),
        Slot("#45B7D1", EXPENSE, "movie"), Slot("#96CEB4", EXPENSE, "shopping"),
        Slot("#FFB347", EXPENSE, "health"), Slot("#7D5FFF", EXPENSE, "school"),
        Slot("#3C6382", EXPENSE, "receipt"), Slot("#F8A5C2", EXPENSE, "gift"),
        Slot("#FECA57", INCOME, "work"), Slot("#FF9FF3", INCOME, "laptop"),
        Slot("#54A0FF", INCOME, "trending"), Slot("#00B894", INCOME, "bonus"),
        Slot("#636E72", INCOME, "refund"),
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
        (names[language] ?: names.getValue("en")).zip(slots) { n, s -> Default(n, s.color, s.type, s.icon) }

    /** Lower-cased default names in every language mapped to their icon. */
    fun knownIcons(): Map<String, String> = buildMap {
        names.forEach { (lang, list) ->
            val locale = Locale.forLanguageTag(lang)
            list.zip(slots).forEach { (n, s) -> put(n.lowercase(locale), s.icon) }
        }
    }

    fun guessIcon(name: String): String =
        knownIcons()[name.trim().lowercase(Locale.forLanguageTag("tr"))]
            ?: knownIcons()[name.trim().lowercase(Locale.ROOT)]
            ?: FALLBACK_ICON
}
