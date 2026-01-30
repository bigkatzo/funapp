/**
 * FUN App - Credits Screen (Android)
 * Purchase and manage credits
 */

package com.fun.app.ui.screens.credits

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import com.fun.app.FunApplication
import com.fun.app.ui.theme.*
import com.fun.app.ui.viewmodels.AuthViewModel
import com.fun.app.ui.viewmodels.CreditsViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun CreditsScreen(
    authViewModel: AuthViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val creditsViewModel: CreditsViewModel = viewModel(factory = CreditsViewModel.Factory)
    
    val currentUser by authViewModel.currentUser.collectAsState()
    val creditProducts by FunApplication.instance.billingManager.creditProducts.collectAsState()
    val transactions by creditsViewModel.transactions.collectAsState()
    val isPurchasing by FunApplication.instance.billingManager.isPurchasing.collectAsState()
    
    var showRestoreDialog by remember { mutableStateOf(false) }
    var restoreMessage by remember { mutableStateOf("") }
    
    LaunchedEffect(Unit) {
        creditsViewModel.loadTransactions()
    }
    
    Column(modifier = modifier.fillMaxSize()) {
        // Main content
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(16.dp))
            
            // Balance card
            BalanceCard(credits = currentUser?.credits ?: 0)
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Header with restore button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Buy Credits",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary
                )
                
                TextButton(onClick = {
                    FunApplication.instance.billingManager.restorePurchases { count ->
                        restoreMessage = if (count > 0) {
                            "Restored $count purchases"
                        } else {
                            "No purchases to restore"
                        }
                        showRestoreDialog = true
                    }
                }) {
                    Text("Restore", color = Primary)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Credit products
            if (creditProducts.isEmpty()) {
                repeat(4) {
                    ProductPlaceholder()
                    Spacer(modifier = Modifier.height(12.dp))
                }
            } else {
                creditProducts.forEach { product ->
                    CreditProductCard(
                        product = product,
                        isPurchasing = isPurchasing,
                        onClick = {
                            activity?.let { act ->
                                FunApplication.instance.billingManager.purchase(act, product) { success ->
                                    if (success) {
                                        // Refresh user data
                                        creditsViewModel.refreshUser()
                                    }
                                }
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
            
            // Transaction history
            if (transactions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(32.dp))
                
                Text(
                    text = "Transaction History",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                transactions.take(10).forEach { transaction ->
                    TransactionRow(transaction = transaction)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Banner ad
        AndroidView(
            factory = { context ->
                FunApplication.instance.adManager.createBannerAd()
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        )
    }
    
    if (showRestoreDialog) {
        AlertDialog(
            onDismissRequest = { showRestoreDialog = false },
            title = { Text("Restore Purchases") },
            text = { Text(restoreMessage) },
            confirmButton = {
                TextButton(onClick = { showRestoreDialog = false }) {
                    Text("OK")
                }
            }
        )
    }
}

@Composable
private fun BalanceCard(credits: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Current Balance",
                style = MaterialTheme.typography.labelLarge,
                color = TextSecondary
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    tint = Color.Yellow,
                    modifier = Modifier.size(40.dp)
                )
                
                Text(
                    text = "$credits",
                    style = MaterialTheme.typography.displayLarge,
                    color = TextPrimary
                )
                
                Text(
                    text = "credits",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextSecondary
                )
            }
        }
    }
}

@Composable
private fun CreditProductCard(
    product: com.android.billingclient.api.ProductDetails,
    isPurchasing: Boolean,
    onClick: () -> Unit
) {
    val productId = product.productId
    val credits = when (productId) {
        "credits_100" -> 100
        "credits_500" -> 500
        "credits_1000" -> 1000
        "credits_2500" -> 2500
        else -> 0
    }
    
    val isPopular = credits == 500
    val bonus = when (credits) {
        1000 -> "10%"
        2500 -> "20%"
        else -> null
    }
    
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        enabled = !isPurchasing
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "$credits Credits",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                    
                    if (isPopular) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Primary.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "POPULAR",
                                style = MaterialTheme.typography.labelSmall,
                                color = Primary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                    
                    bonus?.let {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Success.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "+$it BONUS",
                                style = MaterialTheme.typography.labelSmall,
                                color = Success,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
                
                Text(
                    text = product.oneTimePurchaseOfferDetails?.formattedPrice ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
            
            if (isPurchasing) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Primary
                )
            } else {
                Icon(
                    imageVector = Icons.Default.KeyboardArrowRight,
                    contentDescription = null,
                    tint = TextSecondary
                )
            }
        }
    }
}

@Composable
private fun ProductPlaceholder() {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        color = CardBackground
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .width(120.dp)
                        .height(20.dp),
                    shape = RoundedCornerShape(4.dp),
                    color = Surface
                ) {}
                
                Surface(
                    modifier = Modifier
                        .width(60.dp)
                        .height(16.dp),
                    shape = RoundedCornerShape(4.dp),
                    color = Surface
                ) {}
            }
        }
    }
}

@Composable
private fun TransactionRow(transaction: com.fun.app.data.models.Transaction) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = transaction.type.replace("_", " ").capitalize(Locale.ROOT),
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary
                )
                
                Text(
                    text = formatDate(transaction.createdAt),
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
            }
            
            if (transaction.type == "credit_purchase") {
                Text(
                    text = "+${transaction.metadata?.credits ?: 0}",
                    style = MaterialTheme.typography.titleMedium,
                    color = Success
                )
            } else {
                Text(
                    text = "-${transaction.metadata?.credits ?: 0}",
                    style = MaterialTheme.typography.titleMedium,
                    color = Accent
                )
            }
        }
    }
}

private fun formatDate(dateString: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        parser.timeZone = TimeZone.getTimeZone("UTC")
        val date = parser.parse(dateString) ?: return dateString
        
        val formatter = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.US)
        formatter.format(date)
    } catch (e: Exception) {
        dateString
    }
}
