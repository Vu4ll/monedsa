package com.vu4ll.monedsa.ui

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.Settings

private enum class Tab(val route: String, @param:StringRes val label: Int, val icon: ImageVector) {
    HOME("home", R.string.nav_home, Icons.Default.Home),
    CATEGORIES("categories", R.string.nav_categories, Icons.Default.Category),
    SETTINGS("settings", R.string.nav_settings, Icons.Default.Settings),
}

@Composable
fun AppNav(container: AppContainer, settings: Settings) {
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route
    val showBar = Tab.entries.any { it.route == route }

    Scaffold(
        bottomBar = {
            if (showBar) NavigationBar {
                Tab.entries.forEach { tab ->
                    NavigationBarItem(
                        selected = route == tab.route,
                        onClick = {
                            nav.navigate(tab.route) {
                                popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, null) },
                        label = { Text(stringResource(tab.label)) },
                    )
                }
            }
        },
    ) { pad ->
        NavHost(nav, startDestination = Tab.HOME.route, modifier = Modifier.padding(bottom = pad.calculateBottomPadding())) {
            composable(Tab.HOME.route) {
                HomeScreen(container, settings.currency, onOpen = { id -> nav.navigate("edit/$id") })
            }
            composable(Tab.CATEGORIES.route) { CategoriesScreen(container) }
            composable(Tab.SETTINGS.route) { SettingsScreen(container, settings) }
            composable(
                "edit/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType }),
            ) { e ->
                EditTransactionScreen(
                    container,
                    id = e.arguments!!.getLong("id"),
                    currency = settings.currency,
                    onDone = { nav.popBackStack() },
                )
            }
        }
    }
}
