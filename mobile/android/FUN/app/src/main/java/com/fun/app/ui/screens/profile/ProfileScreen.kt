/**
 * FUN App - Profile Screen (Android)
 * User profile and settings
 */

package com.fun.app.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.fun.app.ui.theme.*
import com.fun.app.ui.viewmodels.AuthViewModel

@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    onNavigateToEditProfile: () -> Unit,
    onNavigateToWatchHistory: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToSubscription: () -> Unit
) {
    val currentUser by authViewModel.currentUser.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(vertical = 16.dp)
    ) {
        // User info section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar
            AsyncImage(
                model = currentUser?.avatarUrl?.ifEmpty { null },
                contentDescription = "Profile avatar",
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop,
                placeholder = {
                    Surface(
                        modifier = Modifier.size(100.dp),
                        shape = CircleShape,
                        color = Surface
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.padding(24.dp),
                            tint = TextSecondary
                        )
                    }
                }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Name and email
            Text(
                text = currentUser?.displayName ?: "User",
                style = MaterialTheme.typography.titleLarge,
                color = TextPrimary
            )
            
            Text(
                text = currentUser?.email ?: "",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Edit button
            Button(
                onClick = onNavigateToEditProfile,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary.copy(alpha = 0.2f),
                    contentColor = Primary
                ),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text("Edit Profile")
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Premium status
        currentUser?.let { user ->
            PremiumStatusCard(
                isPremium = user.isPremium,
                expiresAt = user.premiumExpiresAt,
                onNavigateToSubscription = onNavigateToSubscription
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Settings section
        Text(
            text = "Settings",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            colors = CardDefaults.cardColors(containerColor = Surface)
        ) {
            SettingsItem(
                icon = Icons.Default.DateRange,
                title = "Watch History",
                onClick = onNavigateToWatchHistory
            )
            
            Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
            
            SettingsItem(
                icon = Icons.Default.Settings,
                title = "Settings",
                onClick = onNavigateToSettings
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Account section
        Text(
            text = "Account",
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            colors = CardDefaults.cardColors(containerColor = Surface)
        ) {
            SettingsItem(
                icon = Icons.Default.Info,
                title = "Help & Support",
                onClick = { /* TODO */ }
            )
            
            Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
            
            SettingsItem(
                icon = Icons.Default.Lock,
                title = "Privacy Policy",
                onClick = { /* TODO */ }
            )
            
            Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
            
            SettingsItem(
                icon = Icons.Default.Info,
                title = "Terms of Service",
                onClick = { /* TODO */ }
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Logout button
        Button(
            onClick = { showLogoutDialog = true },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Surface,
                contentColor = Accent
            )
        ) {
            Text("Logout", style = MaterialTheme.typography.titleMedium)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
    }
    
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Logout") },
            text = { Text("Are you sure you want to logout?") },
            confirmButton = {
                TextButton(onClick = {
                    authViewModel.logout()
                    showLogoutDialog = false
                }) {
                    Text("Logout", color = Accent)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun PremiumStatusCard(
    isPremium: Boolean,
    expiresAt: String?,
    onNavigateToSubscription: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            if (isPremium) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = androidx.compose.ui.graphics.Color.Yellow
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Text(
                        text = "Premium Active",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                }
                
                expiresAt?.let {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Expires: $it",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }
            } else {
                Text(
                    text = "Upgrade to Premium",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Unlock all episodes, no ads",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Button(
                    onClick = onNavigateToSubscription,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Get Premium")
                }
            }
        }
    }
}

@Composable
private fun SettingsItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    value: String? = null,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        color = androidx.compose.ui.graphics.Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = TextPrimary,
                modifier = Modifier.weight(1f)
            )
            
            value?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            
            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = null,
                tint = TextSecondary
            )
        }
    }
}
