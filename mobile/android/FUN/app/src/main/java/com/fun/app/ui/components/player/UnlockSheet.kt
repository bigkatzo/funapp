/**
 * FUN App - Unlock Sheet (Android)
 * Modal bottom sheet with 4 unlock methods
 */

package com.fun.app.ui.components.player

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.fun.app.data.models.Episode
import com.fun.app.ui.theme.*
import com.fun.app.FunApplication

@Composable
fun UnlockSheet(
    episode: Episode,
    seriesId: String,
    onDismiss: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val activity = context as? Activity
    val unlockViewModel = remember { com.fun.app.ui.viewmodels.UnlockViewModel() }
    
    val isUnlocking by unlockViewModel.isUnlocking.collectAsState()
    val errorMessage by unlockViewModel.errorMessage.collectAsState()
    val unlockSuccess by unlockViewModel.unlockSuccess.collectAsState()
    
    // Close sheet on success
    LaunchedEffect(unlockSuccess) {
        if (unlockSuccess) {
            onDismiss()
        }
    }
    
    DisposableEffect(Unit) {
        onDispose {
            unlockViewModel.resetState()
        }
    }
    
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.75f),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Drag handle
                    Surface(
                        modifier = Modifier
                            .width(40.dp)
                            .height(4.dp),
                        shape = RoundedCornerShape(2.dp),
                        color = TextSecondary.copy(alpha = 0.3f)
                    ) {}
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Unlock Episode ${episode.episodeNum}",
                        style = MaterialTheme.typography.headlineSmall,
                        color = TextPrimary
                    )
                    
                    Text(
                        text = episode.title,
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
                
                Divider(color = Divider)
                
                // Unlock methods
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Method 1: Watch Ad
                    if (!episode.premiumOnly) {
                        UnlockMethodCard(
                            icon = Icons.Default.PlayArrow,
                            iconColor = Primary,
                            iconBackground = Primary.copy(alpha = 0.2f),
                            title = "Watch Ad",
                            subtitle = "FREE - 30 second video",
                            onClick = {
                                activity?.let { act ->
                                    FunApplication.instance.adManager.showRewardedAd(act) { success, adProof ->
                                        if (success && adProof != null) {
                                            unlockViewModel.unlockWithAd(seriesId, episode.episodeNum, adProof)
                                        }
                                    }
                                }
                            }
                        )
                    }
                    
                    // Method 2: Use Credits
                    episode.unlockCostCredits?.let { cost ->
                        if (!episode.premiumOnly) {
                            UnlockMethodCard(
                                icon = Icons.Default.Star,
                                iconColor = Color.Yellow,
                                iconBackground = Color.Yellow.copy(alpha = 0.2f),
                                title = "Use $cost Credits",
                                subtitle = "Current balance: 150", // TODO: Get from user state
                                onClick = {
                                    unlockViewModel.unlockWithCredits(seriesId, episode.episodeNum)
                                }
                            )
                        }
                    }
                    
                    // Method 3: Buy Episode
                    episode.unlockCostUSD?.let { cost ->
                        UnlockMethodCard(
                            icon = Icons.Default.ShoppingCart,
                            iconColor = Success,
                            iconBackground = Success.copy(alpha = 0.2f),
                            title = "Buy for $${String.format("%.2f", cost)}",
                            subtitle = "One-time purchase",
                            onClick = {
                                // TODO: IAP episode purchase
                            }
                        )
                    }
                    
                    // Method 4: Premium
                    UnlockMethodCard(
                        icon = Icons.Default.Star,
                        iconColor = Color.Yellow,
                        iconBackground = Color.Yellow.copy(alpha = 0.2f),
                        title = "Premium Unlimited",
                        subtitle = "$9.99/month - All episodes",
                        onClick = {
                            onDismiss()
                            // TODO: Navigate to subscription
                        }
                    )
                    
                    // Error message
                    errorMessage?.let { error ->
                        Text(
                            text = error,
                            style = MaterialTheme.typography.bodySmall,
                            color = Accent,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                
                // Close button
                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text("Cancel")
                }
            }
        }
    }
}

@Composable
private fun UnlockMethodCard(
    icon: ImageVector,
    iconColor: Color,
    iconBackground: Color,
    title: String,
    subtitle: String,
    badge: String? = null,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(50.dp),
                shape = RoundedCornerShape(12.dp),
                color = iconBackground
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(12.dp)
                )
            }
            
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                    
                    badge?.let {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Accent.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = it,
                                style = MaterialTheme.typography.labelSmall,
                                color = Accent,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
                
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
            
            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = null,
                tint = TextSecondary
            )
        }
    }
}
