/**
 * FUN App - Authentication Manager
 * Handles JWT token management and storage
 */

import Foundation
import KeychainAccess

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var accessToken: String?
    @Published var refreshToken: String?
    @Published var isAuthenticated: Bool = false
    
    private let keychain = Keychain(service: "com.fun.app")
    private let accessTokenKey = "accessToken"
    private let refreshTokenKey = "refreshToken"
    
    private init() {
        loadTokens()
    }
    
    // MARK: - Token Management
    
    func saveTokens(accessToken: String, refreshToken: String) {
        self.accessToken = accessToken
        self.refreshToken = refreshToken
        self.isAuthenticated = true
        
        keychain[accessTokenKey] = accessToken
        keychain[refreshTokenKey] = refreshToken
    }
    
    func loadTokens() {
        accessToken = keychain[accessTokenKey]
        refreshToken = keychain[refreshTokenKey]
        isAuthenticated = accessToken != nil
    }
    
    func clearTokens() {
        accessToken = nil
        refreshToken = nil
        isAuthenticated = false
        
        keychain[accessTokenKey] = nil
        keychain[refreshTokenKey] = nil
    }
    
    func refreshAccessToken() async throws {
        guard let refreshToken = refreshToken else {
            clearTokens()
            throw APIError.unauthorized
        }
        
        struct RefreshRequest: Encodable {
            let refreshToken: String
        }
        
        struct RefreshResponse: Decodable {
            let tokens: Tokens
            
            struct Tokens: Decodable {
                let accessToken: String
                let refreshToken: String
            }
        }
        
        let parameters: [String: Any] = ["refreshToken": refreshToken]
        
        do {
            let response: RefreshResponse = try await APIClient.shared.request(
                .refresh,
                method: .post,
                parameters: parameters
            )
            
            saveTokens(
                accessToken: response.tokens.accessToken,
                refreshToken: response.tokens.refreshToken
            )
        } catch {
            clearTokens()
            throw error
        }
    }
}
