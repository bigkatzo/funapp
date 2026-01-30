/**
 * FUN App - API Error Handling
 */

import Foundation

enum APIError: Error, LocalizedError {
    case networkError
    case unauthorized
    case forbidden
    case notFound
    case serverError
    case decodingError
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return "Network connection failed. Please check your internet connection."
        case .unauthorized:
            return "Your session has expired. Please log in again."
        case .forbidden:
            return "You don't have permission to access this resource."
        case .notFound:
            return "The requested content was not found."
        case .serverError:
            return "Server error. Please try again later."
        case .decodingError:
            return "Failed to process server response."
        case .unknown(let message):
            return message
        }
    }
}
