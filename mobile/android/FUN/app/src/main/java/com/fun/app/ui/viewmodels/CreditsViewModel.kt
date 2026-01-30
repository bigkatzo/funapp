/**
 * FUN App - Credits ViewModel (Android)
 */

package com.fun.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.fun.app.FunApplication
import com.fun.app.core.network.ApiClient
import com.fun.app.core.network.NetworkResult
import com.fun.app.core.network.safeApiCall
import com.fun.app.data.models.Transaction
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CreditsViewModel(
    private val apiClient: ApiClient
) : ViewModel() {
    
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions: StateFlow<List<Transaction>> = _transactions.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private var currentPage = 1
    private val pageLimit = 20
    
    fun loadTransactions(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 1
            _transactions.value = emptyList()
        }
        
        viewModelScope.launch {
            _isLoading.value = true
            
            when (val result = safeApiCall {
                apiClient.apiService.getTransactions(page = currentPage)
            }) {
                is NetworkResult.Success -> {
                    if (refresh) {
                        _transactions.value = result.data.transactions
                    } else {
                        _transactions.value = _transactions.value + result.data.transactions
                    }
                    currentPage++
                }
                is NetworkResult.Error -> {
                    println("Failed to load transactions: ${result.message}")
                }
                else -> {}
            }
            
            _isLoading.value = false
        }
    }
    
    fun refreshUser() {
        // Trigger auth profile refresh through app-level state
        // This would typically be done through a shared user state
        loadTransactions(refresh = true)
    }
    
    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return CreditsViewModel(
                    apiClient = FunApplication.instance.apiClient
                ) as T
            }
        }
    }
}
