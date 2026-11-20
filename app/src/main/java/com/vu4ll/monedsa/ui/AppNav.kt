package com.vu4ll.monedsa.ui

import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandHorizontally
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Category
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
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

/** Space the floating nav bar takes at the bottom (incl. system nav inset); lists and FABs pad by it. */
val LocalBottomBarSpace = staticCompositionLocalOf { 0.dp }

private val BarHeight = 64.dp
private val BarMargin = 12.dp

private enum class Tab(
    val route: String,
    @param:StringRes val label: Int,
    val icon: ImageVector,
    val iconSelected: ImageVector,
) {
    HOME("home", R.string.nav_home, Icons.Outlined.Home, Icons.Filled.Home),
    CATEGORIES("categories", R.string.nav_categories, Icons.Outlined.Category, Icons.Filled.Category),
    SETTINGS("settings", R.string.nav_settings, Icons.Outlined.Settings, Icons.Filled.Settings),
}

@Composable
fun AppNav(container: AppContainer, settings: Settings) {
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route
    val showBar = Tab.entries.any { it.route == route }
    val navInset = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()
    val space: Dp = BarHeight + BarMargin * 2 + navInset

    Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        CompositionLocalProvider(LocalBottomBarSpace provides space) {
            NavHost(nav, startDestination = Tab.HOME.route, modifier = Modifier.fillMaxSize()) {
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
        // Content fades into the background under the bar instead of being cut off around it.
        if (showBar) Box(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(space)
                .background(
                    androidx.compose.ui.graphics.Brush.verticalGradient(
                        0f to Color.Transparent,
                        0.55f to MaterialTheme.colorScheme.background.copy(alpha = 0.92f),
                        1f to MaterialTheme.colorScheme.background,
                    ),
                ),
        )
        AnimatedVisibility(
            showBar,
            enter = slideInVertically { it } + fadeIn(),
            exit = slideOutVertically { it } + fadeOut(),
            modifier = Modifier.align(Alignment.BottomCenter),
        ) {
            FloatingNavBar(current = route) { tab ->
                nav.navigate(tab.route) {
                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                    launchSingleTop = true
                    restoreState = true
                }
            }
        }
    }
}

/**
 * A capsule that floats above the content. Only the current tab shows its label,
 * inside a brass pill that grows from the icon.
 */
@Composable
private fun FloatingNavBar(current: String?, onSelect: (Tab) -> Unit) {
    val scheme = MaterialTheme.colorScheme
    val light = scheme.background.luminance() > 0.5f
    Surface(
        shape = CircleShape,
        color = if (light) scheme.surfaceContainerLowest else scheme.surfaceContainerHigh,
        shadowElevation = 10.dp,
        modifier = Modifier.navigationBarsPadding().padding(BarMargin),
    ) {
        Row(
            Modifier.height(BarHeight).padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Tab.entries.forEach { tab ->
                val selected = current == tab.route
                val label = stringResource(tab.label)
                Row(
                    Modifier.clip(CircleShape)
                        .background(if (selected) scheme.primaryContainer else Color.Transparent)
                        .selectable(selected = selected, role = Role.Tab, onClick = { onSelect(tab) })
                        .animateContentSize(spring(stiffness = 600f))
                        .padding(horizontal = if (selected) 18.dp else 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        if (selected) tab.iconSelected else tab.icon,
                        contentDescription = if (selected) null else label,
                        tint = if (selected) scheme.onPrimaryContainer else scheme.onSurfaceVariant,
                    )
                    AnimatedVisibility(selected, enter = expandHorizontally() + fadeIn(), exit = shrinkHorizontally() + fadeOut()) {
                        Row {
                            Spacer(Modifier.width(8.dp))
                            Text(label, style = MaterialTheme.typography.labelLarge, color = scheme.onPrimaryContainer, maxLines = 1)
                        }
                    }
                }
            }
        }
    }
}
