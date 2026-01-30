/**
 * FUN App - Settings Screen (Android)
 * App settings and preferences
 */

package com.fun.app.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.fun.app.ui.theme.*
import com.fun.app.ui.viewmodels.AuthViewModel

@Composable
fun SettingsScreen(
    authViewModel: AuthViewModel,
    onBack: () -> Unit
) {
    var videoQuality by remember { mutableStateOf("Auto") }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var autoplayEnabled by remember { mutableStateOf(true) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showPasswordChange by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            // Video Section
            SettingsSection(title = "Video") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Surface)
                ) {
                    Column {
                        SettingsDropdown(
                            icon = Icons.Default.PlayArrow,
                            title = "Video Quality",
                            value = videoQuality,
                            options = listOf("Auto", "360p", "540p", "720p", "1080p"),
                            onValueChange = { videoQuality = it }
                        )
                        
                        Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
                        
                        SettingsSwitch(
                            icon = Icons.Default.PlayArrow,
                            title = "Autoplay Next Episode",
                            checked = autoplayEnabled,
                            onCheckedChange = { autoplayEnabled = it }
                        )
                    }
                }
            }
            
            // Notifications Section
            SettingsSection(title = "Notifications") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Surface)
                ) {
                    Column {
                        SettingsSwitch(
                            icon = Icons.Default.Notifications,
                            title = "Push Notifications",
                            checked = notificationsEnabled,
                            onCheckedChange = { notificationsEnabled = it }
                        )
                        
                        Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
                        
                        SettingsItem(
                            icon = Icons.Default.Settings,
                            title = "Notification Preferences",
                            onClick = { /* TODO */ }
                        )
                    }
                }
            }
            
            // Account Section
            SettingsSection(title = "Account") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Surface)
                ) {
                    Column {
                        SettingsItem(
                            icon = Icons.Default.Lock,
                            title = "Change Password",
                            onClick = { showPasswordChange = true }
                        )
                        
                        Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
                        
                        SettingsItem(
                            icon = Icons.Default.Refresh,
                            title = "Restore Purchases",
                            onClick = { /* TODO */ }
                        )
                        
                        Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
                        
                        SettingsItem(
                            icon = Icons.Default.Delete,
                            title = "Delete Account",
                            titleColor = Accent,
                            onClick = { showDeleteDialog = true }
                        )
                    }
                }
            }
            
            // About Section
            SettingsSection(title = "About") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Surface)
                ) {
                    Column {
                        SettingsItem(
                            icon = Icons.Default.Info,
                            title = "Privacy Policy",
                            onClick = { /* TODO */ }
                        )
                        
                        Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
                        
                        SettingsItem(
                            icon = Icons.Default.Info,
                            title = "Terms of Service",
                            onClick = { /* TODO */ }
                        )
                        
                        Divider(color = Divider, modifier = Modifier.padding(start = 56.dp))
                        
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = Primary,
                                modifier = Modifier.size(24.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(16.dp))
                            
                            Text(
                                text = "Version",
                                style = MaterialTheme.typography.bodyLarge,
                                color = TextPrimary,
                                modifier = Modifier.weight(1f)
                            )
                            
                            Text(
                                text = "1.0.0",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
    
    // Delete account dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Account") },
            text = { Text("This action cannot be undone. All your data will be permanently deleted.") },
            confirmButton = {
                TextButton(onClick = {
                    // TODO: Delete account
                    showDeleteDialog = false
                    authViewModel.logout()
                }) {
                    Text("Delete", color = Accent)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Change password dialog
    if (showPasswordChange) {
        ChangePasswordDialog(
            onDismiss = { showPasswordChange = false },
            onConfirm = { currentPassword, newPassword ->
                // TODO: Change password
                showPasswordChange = false
            }
        )
    }
}

@Composable
private fun SettingsSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        content()
    }
}

@Composable
private fun SettingsItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    titleColor: androidx.compose.ui.graphics.Color = TextPrimary,
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
                tint = if (titleColor == Accent) Accent else Primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = titleColor,
                modifier = Modifier.weight(1f)
            )
            
            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = null,
                tint = TextSecondary
            )
        }
    }
}

@Composable
private fun SettingsSwitch(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
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
        
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SettingsDropdown(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    value: String,
    options: List<String>,
    onValueChange: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    
    Surface(
        onClick = { expanded = true },
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
            
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
            
            ExposedDropdownMenu Box(
                expanded = expanded,
                onExpandedChange = { expanded = it }
            ) {
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    options.forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option) },
                            onClick = {
                                onValueChange(option)
                                expanded = false
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ChangePasswordDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String) -> Unit
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Change Password") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = currentPassword,
                    onValueChange = { currentPassword = it },
                    label = { Text("Current Password") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    label = { Text("New Password") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = { Text("Confirm Password") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onConfirm(currentPassword, newPassword) },
                enabled = currentPassword.isNotEmpty() &&
                        newPassword.isNotEmpty() &&
                        newPassword == confirmPassword &&
                        newPassword.length >= 8
            ) {
                Text("Change")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
