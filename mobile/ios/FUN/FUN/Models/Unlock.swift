/**
 * FUN App - Unlock Model
 */

import Foundation

struct Unlock: Codable, Identifiable {
    let id: String
    let seriesId: String
    let episodeNum: Int
    let method: String  // "ad", "credits", "iap", "premium"
    let creditsSpent: Int?
    let unlockedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case seriesId, episodeNum, method, creditsSpent, unlockedAt
    }
}

struct UnlockRequest: Codable {
    let seriesId: String
    let episodeNum: Int
    let method: String
    let adProof: String?
    let receipt: String?
}

struct UnlockResponse: Codable {
    let unlock: Unlock
    let message: String
}

struct UnlocksResponse: Codable {
    let unlocks: [Unlock]
}
