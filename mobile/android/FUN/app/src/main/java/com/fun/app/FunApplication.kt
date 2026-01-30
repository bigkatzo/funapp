/**
 * FUN App - Application Entry Point
 */

package com.fun.app

import android.app.Application
import com.fun.app.core.auth.AuthManager
import com.fun.app.core.network.ApiClient

class FunApplication : Application() {

    lateinit var apiClient: ApiClient
        private set

    lateinit var authManager: AuthManager
        private set
    
    lateinit var adManager: com.fun.app.core.ads.AdManager
        private set
    
    lateinit var billingManager: com.fun.app.core.billing.BillingManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize auth manager
        authManager = AuthManager(this)

        // Initialize API client
        apiClient = ApiClient(authManager)

        // Initialize AppLovin MAX
        adManager = com.fun.app.core.ads.AdManager(this)
        adManager.initialize()
        
        // Initialize Billing
        billingManager = com.fun.app.core.billing.BillingManager(this)
        billingManager.initialize()
        
        // Initialize Socket.IO
        com.fun.app.core.socket.SocketManager.instance.initialize()
        com.fun.app.core.socket.SocketManager.instance.connect()
    }

    companion object {
        lateinit var instance: FunApplication
            private set
    }
}
