/**
 * FUN App - Transaction Model
 */

import Foundation

struct Transaction: Codable, Identifiable {
    let id: String
    let type: String  // "credit_purchase", "credit_spend", "subscription"
    let amount: Double
    let currency: String
    let paymentMethod: String  // "apple_iap", "stripe", "system"
    let status: String
    let metadata: TransactionMetadata?
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case type, amount, currency, paymentMethod, status, metadata, createdAt
    }
}

struct TransactionMetadata: Codable {
    let credits: Int?
    let seriesId: String?
    let episodeNum: Int?
    let productId: String?
}

struct TransactionsResponse: Codable {
    let transactions: [Transaction]
    let pagination: Pagination
}

struct CreditProduct: Codable, Identifiable {
    let id: String
    let name: String
    let credits: Int
    let priceUSD: Double
    let stripePriceId: String?
    let appleProductId: String?
    let bonus: Int?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, credits, priceUSD, stripePriceId, appleProductId, bonus
    }
    
    var isPopular: Bool {
        return credits == 500
    }
    
    var hasBonus: Bool {
        return bonus != nil && bonus! > 0
    }
}

struct CreditProductsResponse: Codable {
    let products: [CreditProduct]
}

struct SubscriptionProduct: Codable, Identifiable {
    let id: String
    let name: String
    let tier: String  // "monthly", "annual"
    let priceUSD: Double
    let stripePriceId: String?
    let appleProductId: String?
    let features: [String]
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, tier, priceUSD, stripePriceId, appleProductId, features
    }
}

struct SubscriptionProductsResponse: Codable {
    let products: [SubscriptionProduct]
}
