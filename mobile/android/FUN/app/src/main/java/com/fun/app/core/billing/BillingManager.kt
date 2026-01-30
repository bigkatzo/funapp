/**
 * FUN App - Billing Manager (Android)
 * Manages Google Play Billing
 */

package com.fun.app.core.billing

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.*
import com.fun.app.FunApplication
import com.fun.app.core.network.safeApiCall
import com.fun.app.data.models.VerifyGoogleIAPRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class BillingManager(private val context: Context) {
    
    private val _creditProducts = MutableStateFlow<List<ProductDetails>>(emptyList())
    val creditProducts: StateFlow<List<ProductDetails>> = _creditProducts.asStateFlow()
    
    private val _subscriptionProducts = MutableStateFlow<List<ProductDetails>>(emptyList())
    val subscriptionProducts: StateFlow<List<ProductDetails>> = _subscriptionProducts.asStateFlow()
    
    private val _isPurchasing = MutableStateFlow(false)
    val isPurchasing: StateFlow<Boolean> = _isPurchasing.asStateFlow()
    
    private var onPurchaseComplete: ((Boolean) -> Unit)? = null
    
    private val billingClient = BillingClient.newBuilder(context)
        .setListener(purchaseUpdateListener)
        .enablePendingPurchases()
        .build()
    
    // MARK: - Initialization
    
    fun initialize() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingResponseCode.OK) {
                    println("✅ Billing client connected")
                    queryProducts()
                } else {
                    println("❌ Billing setup failed: ${result.debugMessage}")
                }
            }
            
            override fun onBillingServiceDisconnected() {
                println("⚠️ Billing service disconnected, retrying...")
                // Retry connection after delay
            }
        })
    }
    
    // MARK: - Query Products
    
    private fun queryProducts() {
        // Query credit products (one-time purchases)
        val creditProductList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("credits_100")
                .setProductType(BillingClient.ProductType.INAPP)
                .build(),
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("credits_500")
                .setProductType(BillingClient.ProductType.INAPP)
                .build(),
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("credits_1000")
                .setProductType(BillingClient.ProductType.INAPP)
                .build(),
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("credits_2500")
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        )
        
        val creditParams = QueryProductDetailsParams.newBuilder()
            .setProductList(creditProductList)
            .build()
        
        billingClient.queryProductDetailsAsync(creditParams) { result, productDetailsList ->
            if (result.responseCode == BillingResponseCode.OK) {
                _creditProducts.value = productDetailsList.sortedBy { 
                    it.oneTimePurchaseOfferDetails?.priceAmountMicros ?: 0 
                }
                println("✅ Loaded ${productDetailsList.size} credit products")
            }
        }
        
        // Query subscription products
        val subProductList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("premium_monthly")
                .setProductType(BillingClient.ProductType.SUBS)
                .build(),
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("premium_annual")
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )
        
        val subParams = QueryProductDetailsParams.newBuilder()
            .setProductList(subProductList)
            .build()
        
        billingClient.queryProductDetailsAsync(subParams) { result, productDetailsList ->
            if (result.responseCode == BillingResponseCode.OK) {
                _subscriptionProducts.value = productDetailsList.sortedBy { 
                    it.subscriptionOfferDetails?.firstOrNull()?.pricingPhases?.pricingPhaseList?.firstOrNull()?.priceAmountMicros ?: 0
                }
                println("✅ Loaded ${productDetailsList.size} subscription products")
            }
        }
    }
    
    // MARK: - Purchase Flow
    
    fun purchase(activity: Activity, product: ProductDetails, completion: (Boolean) -> Unit = {}) {
        onPurchaseComplete = completion
        _isPurchasing.value = true
        
        val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(product)
            .build()
        
        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParams))
            .build()
        
        val result = billingClient.launchBillingFlow(activity, params)
        
        if (result.responseCode != BillingResponseCode.OK) {
            println("❌ Failed to launch billing flow: ${result.debugMessage}")
            _isPurchasing.value = false
            onPurchaseComplete?.invoke(false)
            onPurchaseComplete = null
        }
    }
    
    private val purchaseUpdateListener = PurchasesUpdatedListener { result, purchases ->
        if (result.responseCode == BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        } else if (result.responseCode == BillingResponseCode.USER_CANCELED) {
            println("⚠️ User cancelled purchase")
            _isPurchasing.value = false
            onPurchaseComplete?.invoke(false)
            onPurchaseComplete = null
        } else {
            println("❌ Purchase failed: ${result.debugMessage}")
            _isPurchasing.value = false
            onPurchaseComplete?.invoke(false)
            onPurchaseComplete = null
        }
    }
    
    private fun handlePurchase(purchase: Purchase) {
        println("🎉 Purchase received: ${purchase.products}")
        
        // Verify with backend
        CoroutineScope(Dispatchers.IO).launch {
            val verified = verifyWithBackend(purchase)
            
            if (verified) {
                // Acknowledge purchase
                if (!purchase.isAcknowledged) {
                    val params = AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(purchase.purchaseToken)
                        .build()
                    
                    billingClient.acknowledgePurchase(params) { result ->
                        if (result.responseCode == BillingResponseCode.OK) {
                            println("✅ Purchase acknowledged")
                            _isPurchasing.value = false
                            onPurchaseComplete?.invoke(true)
                            onPurchaseComplete = null
                        }
                    }
                }
            } else {
                _isPurchasing.value = false
                onPurchaseComplete?.invoke(false)
                onPurchaseComplete = null
            }
        }
    }
    
    private suspend fun verifyWithBackend(purchase: Purchase): Boolean {
        val productId = purchase.products.firstOrNull() ?: return false
        
        val request = VerifyGoogleIAPRequest(
            purchaseToken = purchase.purchaseToken,
            productId = productId
        )
        
        return try {
            val result = safeApiCall {
                FunApplication.instance.apiClient.apiService.verifyGoogleIAP(request)
            }
            
            when (result) {
                is com.fun.app.core.network.NetworkResult.Success -> {
                    println("✅ Purchase verified with backend")
                    true
                }
                else -> {
                    println("❌ Backend verification failed")
                    false
                }
            }
        } catch (e: Exception) {
            println("❌ Backend verification error: ${e.message}")
            false
        }
    }
    
    // MARK: - Restore Purchases
    
    fun restorePurchases(onComplete: (Int) -> Unit) {
        println("🔄 Restoring purchases...")
        
        var restoredCount = 0
        
        // Restore one-time purchases
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        ) { result, purchases ->
            if (result.responseCode == BillingResponseCode.OK) {
                CoroutineScope(Dispatchers.IO).launch {
                    purchases.forEach { purchase ->
                        if (verifyWithBackend(purchase)) {
                            restoredCount++
                        }
                    }
                    
                    // Also restore subscriptions
                    restoreSubscriptions { subCount ->
                        onComplete(restoredCount + subCount)
                    }
                }
            } else {
                onComplete(0)
            }
        }
    }
    
    private fun restoreSubscriptions(onComplete: (Int) -> Unit) {
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        ) { result, purchases ->
            if (result.responseCode == BillingResponseCode.OK) {
                var count = 0
                CoroutineScope(Dispatchers.IO).launch {
                    purchases.forEach { purchase ->
                        if (verifyWithBackend(purchase)) {
                            count++
                        }
                    }
                    onComplete(count)
                }
            } else {
                onComplete(0)
            }
        }
    }
    
    // MARK: - Transaction Listener
    
    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await self.verifyWithBackend(transaction)
                    await transaction.finish()
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw IAPError.failedVerification
        case .verified(let safe):
            return safe
        }
    }
    
    private func getReceiptData() async -> String? {
        guard let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
              FileManager.default.fileExists(atPath: appStoreReceiptURL.path) else {
            return nil
        }
        
        do {
            let receiptData = try Data(contentsOf: appStoreReceiptURL)
            return receiptData.base64EncodedString()
        } catch {
            print("❌ Failed to read receipt: \(error)")
            return nil
        }
    }
    
    // Get product by ID
    func getProduct(id: String) -> Product? {
        return (creditProducts + subscriptionProducts).first { $0.id == id }
    }
}

enum IAPError: Error {
    case failedVerification
    case productNotFound
    case receiptNotAvailable
    case purchaseCancelled
}
