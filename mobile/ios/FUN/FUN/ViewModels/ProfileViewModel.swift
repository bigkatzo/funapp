/**
 * FUN App - Profile ViewModel
 * Manages user profile and settings
 */

import Foundation
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var currentPage = 1
    private let pageLimit = 20
    private let apiClient = APIClient.shared
    
    // MARK: - Data Loading
    
    func loadTransactions(refresh: Bool = false) async {
        if refresh {
            currentPage = 1
            transactions = []
        }
        
        guard !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response: TransactionsResponse = try await apiClient.request(
                .transactions(page: currentPage)
            )
            
            if refresh {
                transactions = response.transactions
            } else {
                transactions.append(contentsOf: response.transactions)
            }
            
            currentPage += 1
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    // MARK: - Settings
    
    func updateVideoQuality(_ quality: VideoQuality) {
        UserDefaults.standard.videoQuality = quality
    }
    
    func toggleNotifications(_ enabled: Bool) {
        UserDefaults.standard.notificationsEnabled = enabled
    }
    
    func toggleAutoplay(_ enabled: Bool) {
        UserDefaults.standard.autoplayEnabled = enabled
    }
}
