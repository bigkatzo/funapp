/**
 * FUN App - API Client
 * Handles all network requests with authentication
 */

import Foundation
import Alamofire

class APIClient {
    static let shared = APIClient()
    
    private let session: Session
    private let authManager = AuthManager.shared
    
    private init() {
        // Configure session with interceptor for token refresh
        let interceptor = AuthInterceptor()
        session = Session(interceptor: interceptor)
    }
    
    // MARK: - Request Methods
    
    func request<T: Decodable>(
        _ endpoint: APIEndpoint,
        method: HTTPMethod = .get,
        parameters: Parameters? = nil,
        encoding: ParameterEncoding = JSONEncoding.default
    ) async throws -> T {
        return try await withCheckedThrowingContinuation { continuation in
            var headers = HTTPHeaders()
            
            // Add auth token if available
            if let token = authManager.accessToken {
                headers.add(.authorization(bearerToken: token))
            }
            
            session.request(
                endpoint.url,
                method: method,
                parameters: parameters,
                encoding: encoding,
                headers: headers
            )
            .validate()
            .responseDecodable(of: T.self) { response in
                switch response.result {
                case .success(let value):
                    continuation.resume(returning: value)
                case .failure(let error):
                    let apiError = self.handleError(error, response: response.response)
                    continuation.resume(throwing: apiError)
                }
            }
        }
    }
    
    func requestWithoutResponse(
        _ endpoint: APIEndpoint,
        method: HTTPMethod = .post,
        parameters: Parameters? = nil
    ) async throws {
        return try await withCheckedThrowingContinuation { continuation in
            var headers = HTTPHeaders()
            
            if let token = authManager.accessToken {
                headers.add(.authorization(bearerToken: token))
            }
            
            session.request(
                endpoint.url,
                method: method,
                parameters: parameters,
                encoding: JSONEncoding.default,
                headers: headers
            )
            .validate()
            .response { response in
                if let error = response.error {
                    let apiError = self.handleError(error, response: response.response)
                    continuation.resume(throwing: apiError)
                } else {
                    continuation.resume()
                }
            }
        }
    }
    
    // MARK: - Error Handling
    
    private func handleError(_ error: AFError, response: HTTPURLResponse?) -> APIError {
        let statusCode = response?.statusCode ?? 0
        
        switch statusCode {
        case 401:
            return .unauthorized
        case 403:
            return .forbidden
        case 404:
            return .notFound
        case 500...599:
            return .serverError
        default:
            if error.isSessionTaskError {
                return .networkError
            }
            return .unknown(error.localizedDescription)
        }
    }
}

// MARK: - Auth Interceptor

private class AuthInterceptor: RequestInterceptor {
    private let authManager = AuthManager.shared
    
    func adapt(_ urlRequest: URLRequest, for session: Session, completion: @escaping (Result<URLRequest, Error>) -> Void) {
        var urlRequest = urlRequest
        
        if let token = authManager.accessToken {
            urlRequest.headers.add(.authorization(bearerToken: token))
        }
        
        completion(.success(urlRequest))
    }
    
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        guard let response = request.task?.response as? HTTPURLResponse,
              response.statusCode == 401 else {
            completion(.doNotRetryWithError(error))
            return
        }
        
        // Token expired, try to refresh
        Task {
            do {
                try await authManager.refreshAccessToken()
                completion(.retry)
            } catch {
                completion(.doNotRetryWithError(error))
            }
        }
    }
}
