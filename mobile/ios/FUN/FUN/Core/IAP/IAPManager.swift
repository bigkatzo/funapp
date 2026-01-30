/**
 * FUN App - IAP Manager (iOS)
 * Manages StoreKit 2 in-app purchases
 */

import Foundation
import StoreKit

@MainActor
class IAPManager: ObservableObject {
    static let shared = IAPManager()
    
    @Published var creditProducts: [Product] = []
    @Published var subscriptionProducts: [Product] = []
    @Published var isPurchasing = false
    
    private var updateListenerTask: Task<Void, Error>?
    
    private let productIDs = [
        "com.fun.app.credits.100",
        "com.fun.app.credits.500",
        "com.fun.app.credits.1000",
        "com.fun.app.credits.2500",
        "com.fun.app.premium.monthly",
        "com.fun.app.premium.annual",
        "com.fun.app.episode.unlock"
    ]
    
    private init() {
        updateListenerTask = listenForTransactions()
        
        Task {
            await loadProducts()
        }
    }
    
    deinit {
        updateListenerTask?.cancel()
    }
    
    // MARK: - Product Loading
    
    func loadProducts() async {
        do {
            let products = try await Product.products(for: productIDs)
            
            creditProducts = products.filter { $0.id.contains("credits") }
                .sorted { $0.price < $1.price }
            
            subscriptionProducts = products.filter { $0.id.contains("premium") }
                .sorted { $0.price < $1.price }
            
            print("✅ Loaded \(creditProducts.count) credit products, \(subscriptionProducts.count) subscriptions")
        } catch {
            print("❌ Failed to load products: \(error)")
        }
    }
    
    // MARK: - Purchase Flow
    
    func purchase(_ product: Product) async throws -> Transaction? {
        isPurchasing = true
        defer { isPurchasing = false }
        
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            
            // Send receipt to backend for verification
            await verifyWithBackend(transaction)
            
            // Finish transaction
            await transaction.finish()
            
            return transaction
            
        case .userCancelled:
            print("⚠️ User cancelled purchase")
            return nil
            
        case .pending:
            print("⏳ Purchase pending")
            return nil
            
        @unknown default:
            return nil
        }
    }
    
    // MARK: - Backend Verification
    
    private func verifyWithBackend(_ transaction: Transaction) async {
        guard let receiptData = await getReceiptData() else {
            print("❌ No receipt data available")
            return
        }
        
        let parameters: [String: Any] = [
            "receiptData": receiptData,
            "productId": transaction.productID,
            "transactionId": String(transaction.id)
        ]
        
        do {
            struct VerifyResponse: Decodable {
                let success: Bool
                let credits: Int?
            }
            
            let response: VerifyResponse = try await APIClient.shared.request(
                .verifyAppleIAP,
                method: .post,
                parameters: parameters
            )
            
            print("✅ IAP verified with backend: \(response.credits ?? 0) credits")
        } catch {
            print("❌ Backend verification failed: \(error)")
            // Don't throw - transaction already completed with Apple
        }
    }
    
    // MARK: - Restore Purchases
    
    func restorePurchases() async {
        print("🔄 Restoring purchases...")
        
        var restoredCount = 0
        
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                await verifyWithBackend(transaction)
                restoredCount += 1
            }
        }
        
        print("✅ Restored \(restoredCount) purchases")
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
}
