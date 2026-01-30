/**
 * FUN App - API Endpoints
 * Centralized endpoint definitions
 */

import Foundation

enum APIEndpoint {
    // MARK: - Auth Endpoints
    case signup
    case login
    case refresh
    case profile
    case updateProfile
    case changePassword
    case deleteAccount
    
    // MARK: - Content Endpoints
    case feed(page: Int, limit: Int)
    case series(page: Int, limit: Int)
    case seriesDetail(id: String)
    case episode(seriesId: String, episodeNum: Int)
    case search(query: String, page: Int)
    case likeSeries(id: String)
    case favoriteSeries(id: String)
    
    // MARK: - Unlock Endpoints
    case unlock
    case unlocks
    
    // MARK: - Comments
    case comments(seriesId: String, page: Int)
    case postComment
    
    // MARK: - Payment Endpoints
    case creditProducts
    case transactions(page: Int)
    case verifyAppleIAP
    case subscriptionProducts
    
    // MARK: - URL Builder
    
    var url: String {
        return Config.baseURL + path
    }
    
    private var path: String {
        switch self {
        // Auth
        case .signup: return "/auth/signup"
        case .login: return "/auth/login"
        case .refresh: return "/auth/refresh"
        case .profile: return "/auth/profile"
        case .updateProfile: return "/auth/profile"
        case .changePassword: return "/auth/password"
        case .deleteAccount: return "/auth/account"
            
        // Content
        case .feed(let page, let limit):
            return "/feed?page=\(page)&limit=\(limit)"
        case .series(let page, let limit):
            return "/series?page=\(page)&limit=\(limit)"
        case .seriesDetail(let id):
            return "/series/\(id)"
        case .episode(let seriesId, let episodeNum):
            return "/series/\(seriesId)/episodes/\(episodeNum)"
        case .search(let query, let page):
            let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
            return "/series/search?q=\(encodedQuery)&page=\(page)"
        case .likeSeries(let id):
            return "/series/\(id)/like"
        case .favoriteSeries(let id):
            return "/series/\(id)/favorite"
            
        // Unlock
        case .unlock: return "/unlock"
        case .unlocks: return "/unlocks"
            
        // Comments
        case .comments(let seriesId, let page):
            return "/comments?seriesId=\(seriesId)&page=\(page)"
        case .postComment: return "/comments"
            
        // Payment
        case .creditProducts: return "/credits/products"
        case .transactions(let page):
            return "/transactions?page=\(page)"
        case .verifyAppleIAP: return "/iap/verify/apple"
        case .subscriptionProducts: return "/subscription/products"
        }
    }
}
