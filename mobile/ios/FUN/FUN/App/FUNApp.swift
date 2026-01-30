/**
 * FUN App - Main Entry Point
 * SwiftUI App lifecycle
 */

import SwiftUI

@main
struct FUNApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var socketManager = SocketManager.shared
    
    init() {
        // Configure app appearance
        configureAppearance()
        
        // Initialize AppLovin MAX
        AdManager.shared.initialize()
        
        // Initialize IAP Manager
        _ = IAPManager.shared
    }
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isAuthenticated {
                MainTabView()
                    .environmentObject(authViewModel)
                    .environmentObject(socketManager)
            } else {
                LoginView()
                    .environmentObject(authViewModel)
            }
        }
    }
    
    private func configureAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Colors.background)
        appearance.titleTextAttributes = [
            .foregroundColor: UIColor.white,
            .font: UIFont.systemFont(ofSize: 18, weight: .semibold)
        ]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        // Configure tab bar appearance
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(Colors.surface)
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }
}
