/**
 * FUN App - Socket.IO Manager (Android)
 * Handles real-time communication
 */

package com.fun.app.core.socket

import com.fun.app.core.constants.Config
import com.fun.app.data.models.Comment
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject

class SocketManager {
    
    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()
    
    private val _likeUpdate = MutableStateFlow<Pair<String, Int>?>(null)
    val likeUpdate: StateFlow<Pair<String, Int>?> = _likeUpdate.asStateFlow()
    
    private val _viewerCount = MutableStateFlow<Pair<String, Int>?>(null)
    val viewerCount: StateFlow<Pair<String, Int>?> = _viewerCount.asStateFlow()
    
    private val _newComment = MutableStateFlow<Comment?>(null)
    val newComment: StateFlow<Comment?> = _newComment.asStateFlow()
    
    private var socket: Socket? = null
    private val gson = Gson()
    
    fun initialize() {
        if (socket != null) return
        
        try {
            val opts = IO.Options().apply {
                reconnection = true
                reconnectionDelay = 1000
                reconnectionAttempts = 5
            }
            
            socket = IO.socket(Config.socketURL, opts)
            setupListeners()
        } catch (e: Exception) {
            println("❌ Socket initialization error: ${e.message}")
        }
    }
    
    fun connect() {
        socket?.connect()
    }
    
    fun disconnect() {
        socket?.disconnect()
    }
    
    fun joinSeries(seriesId: String) {
        socket?.emit("joinSeries", JSONObject().put("seriesId", seriesId))
    }
    
    fun leaveSeries(seriesId: String) {
        socket?.emit("leaveSeries", JSONObject().put("seriesId", seriesId))
    }
    
    fun watchEpisode(seriesId: String, episodeNum: Int) {
        socket?.emit("watchEpisode", JSONObject().apply {
            put("seriesId", seriesId)
            put("episodeNum", episodeNum)
        })
    }
    
    private fun setupListeners() {
        socket?.apply {
            on(Socket.EVENT_CONNECT) {
                println("✅ Socket.IO connected")
                _isConnected.value = true
            }
            
            on(Socket.EVENT_DISCONNECT) {
                println("❌ Socket.IO disconnected")
                _isConnected.value = false
            }
            
            on("like-update") { args ->
                try {
                    val data = args[0] as JSONObject
                    val seriesId = data.getString("seriesId")
                    val count = data.getInt("likeCount")
                    _likeUpdate.value = Pair(seriesId, count)
                } catch (e: Exception) {
                    println("Error parsing like update: ${e.message}")
                }
            }
            
            on("viewerCount") { args ->
                try {
                    val data = args[0] as JSONObject
                    val seriesId = data.getString("seriesId")
                    val count = data.getInt("count")
                    _viewerCount.value = Pair(seriesId, count)
                } catch (e: Exception) {
                    println("Error parsing viewer count: ${e.message}")
                }
            }
            
            on("new-comment") { args ->
                try {
                    val data = args[0] as JSONObject
                    val comment = gson.fromJson(data.toString(), Comment::class.java)
                    _newComment.value = comment
                } catch (e: Exception) {
                    println("Error parsing comment: ${e.message}")
                }
            }
        }
    }
    
    companion object {
        val instance = SocketManager()
    }
}
