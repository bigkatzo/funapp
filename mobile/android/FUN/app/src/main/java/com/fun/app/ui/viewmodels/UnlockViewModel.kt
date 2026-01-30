/**
 * FUN App - Unlock ViewModel (Android)
 * Handles episode unlocking logic
 */

package com.fun.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fun.app.FunApplication
import com.fun.app.core.network.NetworkResult
import com.fun.app.core.network.safeApiCall
import com.fun.app.data.models.UnlockRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class UnlockViewModel : ViewModel() {
    
    private val apiClient = FunApplication.instance.apiClient
    
    private val _isUnlocking = MutableStateFlow(false)
    val isUnlocking: StateFlow<Boolean> = _isUnlocking.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    private val _unlockSuccess = MutableStateFlow(false)
    val unlockSuccess: StateFlow<Boolean> = _unlockSuccess.asStateFlow()
    
    fun unlockWithAd(seriesId: String, episodeNum: Int, adProof: String) {
        viewModelScope.launch {
            _isUnlocking.value = true
            _errorMessage.value = null
            
            val result = safeApiCall {
                apiClient.apiService.unlockEpisode(
                    UnlockRequest(
                        seriesId = seriesId,
                        episodeNum = episodeNum,
                        method = "ad",
                        adProof = adProof
                    )
                )
            }
            
            when (result) {
                is NetworkResult.Success -> {
                    println("✅ Episode unlocked via ad")
                    _unlockSuccess.value = true
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message
                }
                else -> {}
            }
            
            _isUnlocking.value = false
        }
    }
    
    fun unlockWithCredits(seriesId: String, episodeNum: Int) {
        viewModelScope.launch {
            _isUnlocking.value = true
            _errorMessage.value = null
            
            val result = safeApiCall {
                apiClient.apiService.unlockEpisode(
                    UnlockRequest(
                        seriesId = seriesId,
                        episodeNum = episodeNum,
                        method = "credits"
                    )
                )
            }
            
            when (result) {
                is NetworkResult.Success -> {
                    println("✅ Episode unlocked with credits")
                    _unlockSuccess.value = true
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message
                }
                else -> {}
            }
            
            _isUnlocking.value = false
        }
    }
    
    fun resetState() {
        _unlockSuccess.value = false
        _errorMessage.value = null
    }
}
