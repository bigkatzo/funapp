/**
 * FUN App - Socket.IO Manager
 * Handles real-time communication
 */

import Foundation
import SocketIO
import Combine

class SocketManager: ObservableObject {
    static let shared = SocketManager()
    
    private var manager: SocketIOClient.SocketManager
    private var socket: SocketIOClient
    
    @Published var isConnected = false
    @Published var likeUpdate: (seriesId: String, count: Int)?
    @Published var newComment: Comment?
    
    private init() {
        let url = URL(string: Config.socketURL)!
        manager = SocketIOClient.SocketManager(
            socketURL: url,
            config: [.log(false), .compress]
        )
        socket = manager.defaultSocket
        
        setupListeners()
    }
    
    // MARK: - Connection
    
    func connect() {
        guard !isConnected else { return }
        socket.connect()
    }
    
    func disconnect() {
        socket.disconnect()
    }
    
    // MARK: - Room Management
    
    func joinSeries(_ seriesId: String) {
        socket.emit("join-series", seriesId)
    }
    
    func leaveSeries(_ seriesId: String) {
        socket.emit("leave-series", seriesId)
    }
    
    // MARK: - Event Listeners
    
    private func setupListeners() {
        socket.on(clientEvent: .connect) { [weak self] _, _ in
            self?.isConnected = true
            print("✅ Socket.IO connected")
        }
        
        socket.on(clientEvent: .disconnect) { [weak self] _, _ in
            self?.isConnected = false
            print("❌ Socket.IO disconnected")
        }
        
        socket.on("like-update") { [weak self] data, _ in
            guard let dict = data.first as? [String: Any],
                  let seriesId = dict["seriesId"] as? String,
                  let count = dict["likeCount"] as? Int else {
                return
            }
            
            DispatchQueue.main.async {
                self?.likeUpdate = (seriesId, count)
            }
        }
        
        socket.on("new-comment") { [weak self] data, _ in
            guard let dict = data.first as? [String: Any],
                  let jsonData = try? JSONSerialization.data(withJSONObject: dict),
                  let comment = try? JSONDecoder().decode(Comment.self, from: jsonData) else {
                return
            }
            
            DispatchQueue.main.async {
                self?.newComment = comment
            }
        }
    }
}
