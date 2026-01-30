/**
 * FUN App - Auth ViewModel
 */

package com.fun.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.fun.app.FunApplication
import com.fun.app.core.auth.AuthManager
import com.fun.app.core.network.ApiClient
import com.fun.app.core.network.NetworkResult
import com.fun.app.core.network.safeApiCall
import com.fun.app.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    private val apiClient: ApiClient,
    private val authManager: AuthManager
) : ViewModel() {

    private val _isAuthenticated = MutableStateFlow(authManager.isAuthenticated.value)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        viewModelScope.launch {
            authManager.isAuthenticated.collect { isAuth ->
                _isAuthenticated.value = isAuth
                if (isAuth && _currentUser.value == null) {
                    fetchProfile()
                }
            }
        }
    }

    fun signup(email: String, password: String, displayName: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            when (val result = safeApiCall {
                apiClient.apiService.signup(
                    SignupRequest(email, password, displayName)
                )
            }) {
                is NetworkResult.Success -> {
                    authManager.saveTokens(
                        accessToken = result.data.tokens.accessToken,
                        refreshToken = result.data.tokens.refreshToken
                    )
                    _currentUser.value = result.data.user
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message
                }
                else -> {}
            }

            _isLoading.value = false
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            when (val result = safeApiCall {
                apiClient.apiService.login(LoginRequest(email, password))
            }) {
                is NetworkResult.Success -> {
                    authManager.saveTokens(
                        accessToken = result.data.tokens.accessToken,
                        refreshToken = result.data.tokens.refreshToken
                    )
                    _currentUser.value = result.data.user
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message
                }
                else -> {}
            }

            _isLoading.value = false
        }
    }

    fun logout() {
        authManager.clearTokens()
        _currentUser.value = null
    }

    private fun fetchProfile() {
        viewModelScope.launch {
            when (val result = safeApiCall { apiClient.apiService.getProfile() }) {
                is NetworkResult.Success -> {
                    _currentUser.value = result.data.user
                }
                is NetworkResult.Error -> {
                    if (result.code == 401) {
                        logout()
                    }
                }
                else -> {}
            }
        }
    }

    fun updateProfile(displayName: String?, avatarUrl: String?, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true

            when (val result = safeApiCall {
                apiClient.apiService.updateProfile(
                    UpdateProfileRequest(displayName, avatarUrl)
                )
            }) {
                is NetworkResult.Success -> {
                    _currentUser.value = result.data.user
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message
                }
                else -> {}
            }

            _isLoading.value = false
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = FunApplication.instance
                return AuthViewModel(
                    apiClient = app.apiClient,
                    authManager = app.authManager
                ) as T
            }
        }
    }
}
