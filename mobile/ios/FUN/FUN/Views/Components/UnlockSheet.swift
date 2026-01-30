/**
 * FUN App - Unlock Sheet
 * Bottom sheet with 4 unlock methods
 */

import SwiftUI

struct UnlockSheet: View {
    let episode: Episode
    let seriesId: String
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var isUnlocking = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    Text("Unlock Episode \(episode.episodeNum)")
                        .font(.title2.weight(.bold))
                        .foregroundColor(Colors.textPrimary)
                    
                    Text(episode.title)
                        .font(.subheadline)
                        .foregroundColor(Colors.textSecondary)
                }
                .padding()
                
                Divider()
                
                ScrollView {
                    VStack(spacing: 16) {
                        // Method 1: Watch Ad
                        if !episode.premiumOnly {
                            UnlockMethodCard(
                                icon: "play.rectangle.fill",
                                iconColor: Colors.primary,
                                title: "Watch Ad",
                                subtitle: "FREE - 30 second video",
                                action: {
                                    unlockWithAd()
                                }
                            )
                        }
                        
                        // Method 2: Use Credits
                        if let creditCost = episode.unlockCostCredits, !episode.premiumOnly {
                            UnlockMethodCard(
                                icon: "star.fill",
                                iconColor: .yellow,
                                title: "Use \(creditCost) Credits",
                                subtitle: "Current balance: \(authViewModel.currentUser?.credits ?? 0)",
                                badge: authViewModel.currentUser?.credits ?? 0 < creditCost ? "Insufficient" : nil,
                                action: {
                                    unlockWithCredits()
                                }
                            )
                        }
                        
                        // Method 3: Buy Episode
                        if let iapCost = episode.unlockCostUSD {
                            UnlockMethodCard(
                                icon: "creditcard.fill",
                                iconColor: Colors.success,
                                title: "Buy for $\(String(format: "%.2f", iapCost))",
                                subtitle: "One-time purchase",
                                action: {
                                    unlockWithIAP()
                                }
                            )
                        }
                        
                        // Method 4: Premium
                        if let isPremium = authViewModel.currentUser?.isPremium, !isPremium {
                            UnlockMethodCard(
                                icon: "crown.fill",
                                iconColor: .yellow,
                                title: "Premium Unlimited",
                                subtitle: "$9.99/month - All episodes",
                                action: {
                                    navigateToSubscription()
                                }
                            )
                        }
                        
                        // Error message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(Colors.accent)
                                .multilineTextAlignment(.center)
                                .padding()
                        }
                    }
                    .padding()
                }
            }
            .background(Colors.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Colors.primary)
                }
            }
        }
    }
    
    private func unlockWithAd() {
        isUnlocking = true
        
        AdManager.shared.showRewardedAd { success, adProof in
            if success, let proof = adProof {
                // User watched ad, now call backend to unlock
                Task {
                    await self.callUnlockAPI(method: "ad", adProof: proof)
                }
            } else {
                self.errorMessage = "Ad not available. Try again later."
                self.isUnlocking = false
            }
        }
    }
    
    private func unlockWithCredits() {
        guard let creditCost = episode.unlockCostCredits else { return }
        guard let currentCredits = authViewModel.currentUser?.credits,
              currentCredits >= creditCost else {
            errorMessage = "Insufficient credits. Please top up."
            return
        }
        
        isUnlocking = true
        
        Task {
            await callUnlockAPI(method: "credits")
        }
    }
    
    private func unlockWithIAP() {
        isUnlocking = true
        
        Task {
            do {
                // Get episode unlock product
                let productID = "com.fun.app.episode.unlock"
                guard let product = IAPManager.shared.getProduct(id: productID) else {
                    // If not loaded yet, try to get it directly
                    let products = try await Product.products(for: [productID])
                    guard let product = products.first else {
                        errorMessage = "Product not available"
                        isUnlocking = false
                        return
                    }
                    
                    // Purchase
                    if try await IAPManager.shared.purchase(product) != nil {
                        // Backend verification happens in IAPManager
                        await authViewModel.fetchProfile()
                        dismiss()
                    } else {
                        errorMessage = "Purchase cancelled"
                        isUnlocking = false
                    }
                    return
                }
                
                // Purchase the product
                if try await IAPManager.shared.purchase(product) != nil {
                    // Success - refresh profile and dismiss
                    await authViewModel.fetchProfile()
                    dismiss()
                } else {
                    errorMessage = "Purchase cancelled"
                    isUnlocking = false
                }
            } catch {
                errorMessage = error.localizedDescription
                isUnlocking = false
            }
        }
    }
    
    private func callUnlockAPI(method: String, adProof: String? = nil) async {
        var parameters: [String: Any] = [
            "seriesId": seriesId,
            "episodeNum": episode.episodeNum,
            "method": method
        ]
        
        if let proof = adProof {
            parameters["adProof"] = proof
        }
        
        do {
            let response: UnlockResponse = try await APIClient.shared.request(
                .unlock,
                method: .post,
                parameters: parameters
            )
            
            // Success! Refresh user profile and dismiss
            await authViewModel.fetchProfile()
            isUnlocking = false
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
            isUnlocking = false
        }
    }
    
    private func navigateToSubscription() {
        // Dismiss current sheet and show subscription
        dismiss()
        
        // Post notification to show subscription view
        NotificationCenter.default.post(name: NSNotification.Name("ShowSubscription"), object: nil)
    }
}

struct UnlockMethodCard: View {
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String
    var badge: String? = nil
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(iconColor)
                    .frame(width: 50, height: 50)
                    .background(iconColor.opacity(0.2))
                    .cornerRadius(12)
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(title)
                            .font(.headline)
                            .foregroundColor(Colors.textPrimary)
                        
                        if let badge = badge {
                            Text(badge)
                                .font(.caption.weight(.semibold))
                                .foregroundColor(Colors.accent)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Colors.accent.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(Colors.textSecondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(Colors.textSecondary)
            }
            .padding()
            .background(Colors.surface)
            .cornerRadius(16)
        }
        .disabled(badge != nil)
    }
}
