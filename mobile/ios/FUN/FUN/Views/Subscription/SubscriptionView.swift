/**
 * FUN App - Subscription View
 * Premium subscription plans
 */

import SwiftUI
import StoreKit

struct SubscriptionView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var iapManager = IAPManager.shared
    @Environment(\.dismiss) var dismiss
    
    @State private var selectedProduct: Product?
    @State private var isPurchasing = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 16) {
                            Image(systemName: "crown.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.yellow)
                            
                            Text("Go Premium")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(Colors.textPrimary)
                            
                            Text("Unlimited access to all episodes")
                                .font(.headline)
                                .foregroundColor(Colors.textSecondary)
                        }
                        .padding(.top, 32)
                        
                        // Benefits
                        VStack(alignment: .leading, spacing: 16) {
                            BenefitRow(icon: "lock.open.fill", text: "Unlock all episodes instantly")
                            BenefitRow(icon: "film.stack.fill", text: "Ad-free viewing experience")
                            BenefitRow(icon: "arrow.down.circle.fill", text: "Early access to new series")
                            BenefitRow(icon: "sparkles", text: "Exclusive premium content")
                        }
                        .padding()
                        .background(Colors.surface)
                        .cornerRadius(16)
                        .padding(.horizontal)
                        
                        // Subscription plans
                        VStack(spacing: 16) {
                            ForEach(iapManager.subscriptionProducts) { product in
                                SubscriptionPlanCard(
                                    product: product,
                                    isSelected: selectedProduct?.id == product.id,
                                    onSelect: {
                                        selectedProduct = product
                                    }
                                )
                            }
                            
                            if iapManager.subscriptionProducts.isEmpty {
                                // Loading placeholders
                                ForEach(0..<2) { _ in
                                    SubscriptionPlaceholder()
                                }
                            }
                        }
                        .padding(.horizontal)
                        
                        // Error message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(Colors.accent)
                                .padding()
                        }
                        
                        // Subscribe button
                        if let product = selectedProduct {
                            Button(action: {
                                Task {
                                    await subscribe(product: product)
                                }
                            }) {
                                if isPurchasing {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 56)
                                } else {
                                    Text("Subscribe - \(product.displayPrice)")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 56)
                                }
                            }
                            .background(Colors.primary)
                            .cornerRadius(16)
                            .padding(.horizontal)
                            .disabled(isPurchasing)
                        }
                        
                        // Terms
                        Text("Auto-renewable. Cancel anytime in Settings. See Terms & Privacy Policy.")
                            .font(.caption)
                            .foregroundColor(Colors.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                        
                        // Restore purchases
                        Button(action: {
                            Task {
                                await iapManager.restorePurchases()
                                await authViewModel.fetchProfile()
                            }
                        }) {
                            Text("Restore Purchases")
                                .font(.subheadline)
                                .foregroundColor(Colors.primary)
                        }
                        .padding(.bottom, 32)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark")
                            .foregroundColor(Colors.textSecondary)
                    }
                }
            }
            .task {
                await iapManager.loadProducts()
            }
        }
    }
    
    private func subscribe(product: Product) async {
        isPurchasing = true
        errorMessage = nil
        
        do {
            if try await iapManager.purchase(product) != nil {
                // Success - refresh profile
                await authViewModel.fetchProfile()
                dismiss()
            } else {
                errorMessage = "Purchase cancelled"
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isPurchasing = false
    }
}

struct BenefitRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(Colors.primary)
                .frame(width: 32)
            
            Text(text)
                .font(.body)
                .foregroundColor(Colors.textPrimary)
            
            Spacer()
        }
    }
}

struct SubscriptionPlanCard: View {
    let product: Product
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(product.displayName)
                            .font(.title3.weight(.semibold))
                            .foregroundColor(Colors.textPrimary)
                        
                        if product.id.contains("annual") {
                            Text("SAVE 17%")
                                .font(.caption.bold())
                                .foregroundColor(Colors.success)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Colors.success.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(product.displayPrice + (product.id.contains("monthly") ? "/month" : "/year"))
                        .font(.headline)
                        .foregroundColor(Colors.primary)
                    
                    if product.id.contains("annual") {
                        Text("2 months free")
                            .font(.caption)
                            .foregroundColor(Colors.textSecondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundColor(isSelected ? Colors.primary : Colors.textSecondary)
            }
            .padding()
            .background(isSelected ? Colors.primary.opacity(0.1) : Colors.surface)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Colors.primary : Color.clear, lineWidth: 2)
            )
        }
    }
}

struct SubscriptionPlaceholder: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 4)
                .fill(Colors.surface)
                .frame(width: 150, height: 24)
            
            RoundedRectangle(cornerRadius: 4)
                .fill(Colors.surface)
                .frame(width: 100, height: 20)
        }
        .padding()
        .background(Colors.surface)
        .cornerRadius(16)
    }
}

#Preview {
    SubscriptionView()
        .environmentObject(AuthViewModel())
}
