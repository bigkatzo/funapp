/**
 * FUN App - Comment Model
 */

import Foundation

struct Comment: Codable, Identifiable {
    let id: String
    let userId: String
    let seriesId: String
    let episodeNum: Int?
    let text: String
    let createdAt: String
    let user: CommentUser?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case userId, seriesId, episodeNum, text, createdAt, user
    }
}

struct CommentUser: Codable {
    let displayName: String
    let avatarUrl: String?
}

struct CommentsResponse: Codable {
    let comments: [Comment]
    let pagination: Pagination
}

struct PostCommentRequest: Codable {
    let seriesId: String
    let episodeNum: Int?
    let text: String
}

struct PostCommentResponse: Codable {
    let comment: Comment
}
