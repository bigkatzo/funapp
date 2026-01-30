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

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.Home, "Feed") },
                    label = { Text("Feed") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 }
                )
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.PlayArrow, "Drama") },
                    label = { Text("Drama") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 }
                )
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.ShoppingBag, "Market") },
                    label = { Text("Market") },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 }
                )
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.Star, "Credits") },
                    label = { Text("Credits") },
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 }
                )
                NavigationBarItem(
                    icon = { Icon(androidx.compose.material.icons.Icons.Default.Person, "Profile") },
                    label = { Text("Profile") },
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 }
                )
            }
        }
    ) { paddingValues ->
        when (selectedTab) {
            0 -> FeedScreen(Modifier.padding(paddingValues))
            1 -> Text("Drama Screen", Modifier.padding(paddingValues))
            2 -> Text("Market Screen", Modifier.padding(paddingValues))
            3 -> Text("Credits Screen", Modifier.padding(paddingValues))
            4 -> Text("Profile Screen", Modifier.padding(paddingValues))
        }
    }
}
