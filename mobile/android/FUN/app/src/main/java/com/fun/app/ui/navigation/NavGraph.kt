/**
 * FUN App - Navigation Graph
 */

package com.fun.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.fun.app.ui.screens.auth.LoginScreen
import com.fun.app.ui.screens.feed.FeedScreen
import com.fun.app.ui.viewmodels.AuthViewModel

@Composable
fun NavGraph(authViewModel: AuthViewModel) {
    val navController = rememberNavController()
    val isAuthenticated by authViewModel.isAuthenticated.collectAsState()

    if (isAuthenticated) {
        MainScreen(authViewModel = authViewModel)
    } else {
        LoginScreen(
            authViewModel = authViewModel,
            onNavigateToSignup = {
                // Navigate to signup
            }
        )
    }
}

@Composable
fun MainScreen(authViewModel: AuthViewModel) {
    var selectedTab by remember { mutableStateOf(0) }
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.9f),
                contentColor = androidx.compose.ui.graphics.Color.White
            ) {
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.PlayArrow, "Discover") },
                    label = { Text("Discover") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = androidx.compose.ui.graphics.Color(0xFF9C27B0),
                        selectedTextColor = androidx.compose.ui.graphics.Color(0xFF9C27B0),
                        unselectedIconColor = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.6f),
                        unselectedTextColor = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.6f),
                        indicatorColor = androidx.compose.ui.graphics.Color.Transparent
                    )
                )
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.Search, "Browse") },
                    label = { Text("Browse") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = androidx.compose.ui.graphics.Color(0xFF9C27B0),
                        selectedTextColor = androidx.compose.ui.graphics.Color(0xFF9C27B0),
                        unselectedIconColor = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.6f),
                        unselectedTextColor = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.6f),
                        indicatorColor = androidx.compose.ui.graphics.Color.Transparent
                    )
                )
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.Person, "You") },
                    label = { Text("You") },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = androidx.compose.ui.graphics.Color(0xFF9C27B0),
                        selectedTextColor = androidx.compose.ui.graphics.Color(0xFF9C27B0),
                        unselectedIconColor = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.6f),
                        unselectedTextColor = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.6f),
                        indicatorColor = androidx.compose.ui.graphics.Color.Transparent
                    )
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "discover",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("discover") { 
                FeedScreen(Modifier) // Transformed to Discover
            }
            composable("browse") { 
                Text("Browse Screen", Modifier.padding(paddingValues)) 
            }
            composable("profile") { 
                Text("Profile Screen", Modifier.padding(paddingValues)) 
            }
            composable(
                "watch/{episodeId}?mode={mode}&seriesId={seriesId}"
            ) { backStackEntry ->
                val episodeId = backStackEntry.arguments?.getString("episodeId") ?: ""
                val modeStr = backStackEntry.arguments?.getString("mode") ?: "discover"
                val seriesId = backStackEntry.arguments?.getString("seriesId")
                val mode = when (modeStr) {
                    "binge" -> com.fun.app.data.models.PlaylistMode.BINGE
                    "series" -> com.fun.app.data.models.PlaylistMode.SERIES
                    else -> com.fun.app.data.models.PlaylistMode.DISCOVER
                }
                com.fun.app.ui.screens.watch.WatchScreen(
                    episodeId = episodeId,
                    mode = mode,
                    seriesId = seriesId,
                    navController = navController
                )
            }
            composable("series/{seriesId}") { backStackEntry ->
                val seriesId = backStackEntry.arguments?.getString("seriesId") ?: ""
                // SeriesDetailScreen(seriesId, navController)
                Text("Series Detail: $seriesId", Modifier.padding(paddingValues))
            }
        }
    }
}
