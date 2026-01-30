/**
 * FUN App - Credits View
 * Purchase and manage credits
 */

import SwiftUI

struct CreditsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var iapManager = IAPManager.shared
    @StateObject private var profileViewModel = ProfileViewModel()
    @State private var isPurchasing = false
    @State private var showingRestoreAlert = false
    @State private var restoreMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 24) {
                        // Balance display
                        balanceCard
                        
                        // Credit packages
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text("Buy Credits")
                                    .font(.headline)
                                    .foregroundColor(Colors.textPrimary)
                                
                                Spacer()
                                
                                Button(action: {
                                    Task {
                                        await iapManager.restorePurchases()
                                        await authViewModel.fetchProfile()
                                        restoreMessage = "Purchases restored successfully"
                                        showingRestoreAlert = true
                                    }
                                }) {
                                    Text("Restore")
                                        .font(.subheadline)
                                        .foregroundColor(Colors.primary)
                                }
                            }
                            .padding(.horizontal)
                            
                            if iapManager.creditProducts.isEmpty {
                                ForEach(0..<4) { _ in
                                    productPlaceholderCard
                                }
                            } else {
                                ForEach(iapManager.creditProducts) { product in
                                    iapProductCard(product)
                                }
                            }
                        }
                        
                        // Transaction history
                        if !profileViewModel.transactions.isEmpty {
                            transactionHistorySection
                        }
                        
                        Spacer().frame(height: 60)  // Space for banner ad
                    }
                    .padding(.top)
                }
                
                // Banner ad
                BannerAdView()
                    .frame(height: 50)
            }
            .background(Colors.background)
            .navigationTitle("Credits")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await iapManager.loadProducts()
                await profileViewModel.loadTransactions()
            }
            .alert("Restore Purchases", isPresented: $showingRestoreAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(restoreMessage)
            }
        }
    }
    
    private var balanceCard: some View {
        VStack(spacing: 12) {
            Text("Current Balance")
                .font(.subheadline)
                .foregroundColor(Colors.textSecondary)
            
            HStack(spacing: 8) {
                Image(systemName: "star.fill")
                    .font(.title)
                    .foregroundColor(.yellow)
                
                Text("\(authViewModel.currentUser?.credits ?? 0)")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(Colors.textPrimary)
                
                Text("credits")
                    .font(.title3)
                    .foregroundColor(Colors.textSecondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(Colors.surface)
        .cornerRadius(16)
        .padding(.horizontal)
    }
    
    private func iapProductCard(_ product: Product) -> some View {
        Button(action: {
            Task {
                isPurchasing = true
                do {
                    _ = try await iapManager.purchase(product)
                    await authViewModel.fetchProfile()  // Refresh balance
                } catch {
                    print("Purchase error: \(error)")
                }
                isPurchasing = false
            }
        }) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(product.displayName)
                            .font(.headline)
                            .foregroundColor(Colors.textPrimary)
                        
                        if product.id.contains("500") {
                            Text("POPULAR")
                                .font(.caption.bold())
                                .foregroundColor(Colors.primary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Colors.primary.opacity(0.2))
                                .cornerRadius(4)
                        }
                        
                        if product.id.contains("1000") || product.id.contains("2500") {
                            let bonus = product.id.contains("1000") ? "10%" : "20%"
                            Text("+\(bonus) BONUS")
                                .font(.caption.bold())
                                .foregroundColor(Colors.success)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Colors.success.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(product.displayPrice)
                        .font(.subheadline)
                        .foregroundColor(Colors.textSecondary)
                }
                
                Spacer()
                
                if isPurchasing {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Colors.primary))
                } else {
                    Image(systemName: "chevron.right")
                        .foregroundColor(Colors.textSecondary)
                }
            }
            .padding()
            .background(Colors.cardBackground)
            .cornerRadius(12)
            .padding(.horizontal)
        }
        .disabled(isPurchasing)
    }
    
    private var transactionHistorySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Transaction History")
                .font(.headline)
                .foregroundColor(Colors.textPrimary)
                .padding(.horizontal)
            
            ForEach(profileViewModel.transactions.prefix(10)) { transaction in
                transactionRow(transaction)
            }
        }
    }
    
    private func transactionRow(_ transaction: Transaction) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(transaction.type.capitalized.replacingOccurrences(of: "_", with: " "))
                    .font(.subheadline)
                    .foregroundColor(Colors.textPrimary)
                
                Text(formatDate(transaction.createdAt))
                    .font(.caption)
                    .foregroundColor(Colors.textSecondary)
            }
            
            Spacer()
            
            if transaction.type == "credit_purchase" {
                Text("+\(transaction.metadata?.credits ?? 0)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(Colors.success)
            } else {
                Text("-\(transaction.metadata?.credits ?? 0)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(Colors.accent)
            }
        }
        .padding()
        .background(Colors.surface)
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private func formatDate(_ dateString: String) -> String {
        // Simple date formatting
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }
        return dateString
    }
    
    private var productPlaceholderCard: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Colors.surface)
                    .frame(width: 120, height: 20)
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Colors.surface)
                    .frame(width: 60, height: 16)
            }
            
            Spacer()
        }
        .padding()
        .background(Colors.cardBackground)
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

#Preview {
    CreditsView()
        .environmentObject(AuthViewModel())
}
