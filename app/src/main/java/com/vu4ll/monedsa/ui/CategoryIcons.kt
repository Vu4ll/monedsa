package com.vu4ll.monedsa.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Celebration
import androidx.compose.material.icons.filled.Checkroom
import androidx.compose.material.icons.filled.ChildCare
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Laptop
import androidx.compose.material.icons.filled.LocalBar
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalGroceryStore
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalTaxi
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.SportsSoccer
import androidx.compose.material.icons.filled.Train
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.Work
import androidx.compose.ui.graphics.vector.ImageVector
import com.vu4ll.monedsa.data.DefaultCategories

/** Stored keys → icons. Keys are what the database and backups hold; never rename one. */
object CategoryIcons {
    val all: List<Pair<String, ImageVector>> = listOf(
        "restaurant" to Icons.Filled.Restaurant,
        "groceries" to Icons.Filled.LocalGroceryStore,
        "cafe" to Icons.Filled.LocalCafe,
        "fastfood" to Icons.Filled.Fastfood,
        "bar" to Icons.Filled.LocalBar,
        "bus" to Icons.Filled.DirectionsBus,
        "car" to Icons.Filled.DirectionsCar,
        "fuel" to Icons.Filled.LocalGasStation,
        "train" to Icons.Filled.Train,
        "taxi" to Icons.Filled.LocalTaxi,
        "flight" to Icons.Filled.Flight,
        "hotel" to Icons.Filled.Hotel,
        "home" to Icons.Filled.Home,
        "receipt" to Icons.Filled.Receipt,
        "energy" to Icons.Filled.Bolt,
        "internet" to Icons.Filled.Wifi,
        "phone" to Icons.Filled.PhoneAndroid,
        "repair" to Icons.Filled.Build,
        "shopping" to Icons.Filled.ShoppingBag,
        "clothes" to Icons.Filled.Checkroom,
        "beauty" to Icons.Filled.ContentCut,
        "health" to Icons.Filled.LocalHospital,
        "medication" to Icons.Filled.Medication,
        "fitness" to Icons.Filled.FitnessCenter,
        "spa" to Icons.Filled.Spa,
        "movie" to Icons.Filled.Movie,
        "games" to Icons.Filled.SportsEsports,
        "music" to Icons.Filled.MusicNote,
        "sports" to Icons.Filled.SportsSoccer,
        "party" to Icons.Filled.Celebration,
        "school" to Icons.Filled.School,
        "book" to Icons.AutoMirrored.Filled.MenuBook,
        "gift" to Icons.Filled.CardGiftcard,
        "donation" to Icons.Filled.VolunteerActivism,
        "pets" to Icons.Filled.Pets,
        "child" to Icons.Filled.ChildCare,
        "work" to Icons.Filled.Work,
        "laptop" to Icons.Filled.Laptop,
        "payments" to Icons.Filled.Payments,
        "trending" to Icons.AutoMirrored.Filled.TrendingUp,
        "bonus" to Icons.Filled.Stars,
        "refund" to Icons.AutoMirrored.Filled.Undo,
        "savings" to Icons.Filled.Savings,
        "bank" to Icons.Filled.AccountBalance,
        DefaultCategories.FALLBACK_ICON to Icons.Filled.Category,
    )

    private val byKey = all.toMap()

    fun get(key: String): ImageVector = byKey[key] ?: Icons.Filled.Category
}
