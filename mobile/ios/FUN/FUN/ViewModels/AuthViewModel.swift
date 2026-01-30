/**
 * FUN App - Auth ViewModel
 * Handles authentication state and operations
 */

import Foundation
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let authManager = AuthManager.shared
    private let apiClient = APIClient.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        isAuthenticated = authManager.isAuthenticated
        
        if isAuthenticated {
            Task {
                await fetchProfile()
            }
        }
    }
    
    // MARK: - Authentication Methods
    
    func signup(email: String, password: String, displayName: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let parameters: [String: Any] = [
                "email": email,
                "password": password,
                "displayName": displayName
            ]
            
            let response: AuthResponse = try await apiClient.request(
                .signup,
                method: .post,
                parameters: parameters
            )
            
            authManager.saveTokens(
                accessToken: response.tokens.accessToken,
                refreshToken: response.tokens.refreshToken
            )
            
            currentUser = response.user
            isAuthenticated = true
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let parameters: [String: Any] = [
                "email": email,
                "password": password
            ]
            
            let response: AuthResponse = try await apiClient.request(
                .login,
                method: .post,
                parameters: parameters
            )
            
            authManager.saveTokens(
                accessToken: response.tokens.accessToken,
                refreshToken: response.tokens.refreshToken
            )
            
            currentUser = response.user
            isAuthenticated = true
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    func logout() {
        authManager.clearTokens()
        currentUser = nil
        isAuthenticated = false
    }
    
    func fetchProfile() async {
        do {
            let response: ProfileResponse = try await apiClient.request(.profile)
            currentUser = response.user
        } catch {
            // If profile fetch fails, logout
            logout()
        }
    }
    
    func updateProfile(displayName: String?, avatarUrl: String?) async -> Bool {
        isLoading = true
        
        do {
            var parameters: [String: Any] = [:]
            if let displayName = displayName {
                parameters["displayName"] = displayName
            }
            if let avatarUrl = avatarUrl {
                parameters["avatarUrl"] = avatarUrl
            }
            
            let response: ProfileResponse = try await apiClient.request(
                .updateProfile,
                method: .put,
                parameters: parameters
            )
            
            currentUser = response.user
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
    
    func changePassword(oldPassword: String, newPassword: String) async -> Bool {
        isLoading = true
        
        do {
            let parameters: [String: Any] = [
                "oldPassword": oldPassword,
                "newPassword": newPassword
            ]
            
            try await apiClient.requestWithoutResponse(
                .changePassword,
                method: .put,
                parameters: parameters
            )
            
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
    
    func deleteAccount() async -> Bool {
        isLoading = true
        
        do {
            try await apiClient.requestWithoutResponse(
                .deleteAccount,
                method: .delete
            )
            
            logout()
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
}
