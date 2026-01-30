/**
 * FUN App - Subscription Screen (Android)
 * Premium subscription plans
 */

package com.fun.app.ui.screens.subscription

import android.app.Activity
import androidx.compose.foundation.border
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
import com.android.billingclient.api.ProductDetails
import com.fun.app.FunApplication
import com.fun.app.ui.theme.*
import com.fun.app.ui.viewmodels.AuthViewModel

@Composable
fun SubscriptionScreen(
    authViewModel: AuthViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    
    val subscriptionProducts by FunApplication.instance.billingManager.subscriptionProducts.collectAsState()
    val isPurchasing by FunApplication.instance.billingManager.isPurchasing.collectAsState()
    
    var selectedProduct by remember { mutableStateOf<ProductDetails?>(null) }
    var showRestoreDialog by remember { mutableStateOf(false) }
    var restoreMessage by remember { mutableStateOf("") }
    
    // Auto-select monthly plan
    LaunchedEffect(subscriptionProducts) {
        if (selectedProduct == null && subscriptionProducts.isNotEmpty()) {
            selectedProduct = subscriptionProducts.firstOrNull { it.productId == "premium_monthly" }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = TextSecondary
                        )
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
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    tint = Color.Yellow,
                    modifier = Modifier.size(80.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Go Premium",
                    style = MaterialTheme.typography.displaySmall,
                    color = TextPrimary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Unlimited access to all episodes",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextSecondary
                )
            }
            
            // Benefits
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Surface)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    BenefitRow(icon = Icons.Default.Lock, text = "Unlock all episodes instantly")
                    BenefitRow(icon = Icons.Default.Face, text = "Ad-free viewing experience")
                    BenefitRow(icon = Icons.Default.DateRange, text = "Early access to new series")
                    BenefitRow(icon = Icons.Default.Star, text = "Exclusive premium content")
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Subscription plans
            if (subscriptionProducts.isEmpty()) {
                repeat(2) {
                    SubscriptionPlaceholder()
                    Spacer(modifier = Modifier.height(12.dp))
                }
            } else {
                subscriptionProducts.forEach { product ->
                    SubscriptionPlanCard(
                        product = product,
                        isSelected = selectedProduct?.productId == product.productId,
                        onSelect = { selectedProduct = product }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Subscribe button
            selectedProduct?.let { product ->
                Button(
                    onClick = {
                        activity?.let { act ->
                            FunApplication.instance.billingManager.purchase(act, product) { success ->
                                if (success) {
                                    onDismiss()
                                }
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .height(56.dp),
                    enabled = !isPurchasing
                ) {
                    if (isPurchasing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White
                        )
                    } else {
                        val price = product.subscriptionOfferDetails?.firstOrNull()
                            ?.pricingPhases?.pricingPhaseList?.firstOrNull()
                            ?.formattedPrice ?: ""
                        Text("Subscribe - $price")
                    }
                }
            }
            
            // Terms
            Text(
                text = "Auto-renewable. Cancel anytime in Play Store. See Terms & Privacy Policy.",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp)
                    .padding(top = 16.dp)
            )
            
            // Restore purchases
            TextButton(
                onClick = {
                    FunApplication.instance.billingManager.restorePurchases { count ->
                        restoreMessage = if (count > 0) {
                            "Restored $count subscriptions"
                        } else {
                            "No subscriptions to restore"
                        }
                        showRestoreDialog = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp)
            ) {
                Text("Restore Purchases", color = Primary)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
    
    if (showRestoreDialog) {
        AlertDialog(
            onDismissRequest = { showRestoreDialog = false },
            title = { Text("Restore Subscriptions") },
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
private fun BenefitRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    text: String
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Primary,
            modifier = Modifier.size(24.dp)
        )
        
        Text(
            text = text,
            style = MaterialTheme.typography.bodyLarge,
            color = TextPrimary
        )
    }
}

@Composable
private fun SubscriptionPlanCard(
    product: ProductDetails,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    val isAnnual = product.productId == "premium_annual"
    val price = product.subscriptionOfferDetails?.firstOrNull()
        ?.pricingPhases?.pricingPhaseList?.firstOrNull()
        ?.formattedPrice ?: ""
    
    Card(
        onClick = onSelect,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .then(
                if (isSelected) {
                    Modifier.border(2.dp, Primary, RoundedCornerShape(16.dp))
                } else {
                    Modifier
                }
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Primary.copy(alpha = 0.1f) else Surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isAnnual) "Annual Plan" else "Monthly Plan",
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary
                    )
                    
                    if (isAnnual) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Success.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "SAVE 17%",
                                style = MaterialTheme.typography.labelSmall,
                                color = Success,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
                
                Text(
                    text = price + if (isAnnual) "/year" else "/month",
                    style = MaterialTheme.typography.titleMedium,
                    color = Primary
                )
                
                if (isAnnual) {
                    Text(
                        text = "2 months free",
                        style = MaterialTheme.typography.labelMedium,
                        color = TextSecondary
                    )
                }
            }
            
            RadioButton(
                selected = isSelected,
                onClick = onSelect,
                colors = RadioButtonDefaults.colors(
                    selectedColor = Primary,
                    unselectedColor = TextSecondary
                )
            )
        }
    }
}

@Composable
private fun SubscriptionPlaceholder() {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        color = Surface
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                modifier = Modifier
                    .width(150.dp)
                    .height(24.dp),
                shape = RoundedCornerShape(4.dp),
                color = CardBackground
            ) {}
            
            Surface(
                modifier = Modifier
                    .width(100.dp)
                    .height(20.dp),
                shape = RoundedCornerShape(4.dp),
                color = CardBackground
            ) {}
        }
    }
}
