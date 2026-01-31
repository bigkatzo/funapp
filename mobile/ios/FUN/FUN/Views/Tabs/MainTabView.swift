/**
 * FUN App - Main Tab View
 * 5-tab navigation structure
 */

import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 0
    @State private var showSubscription = false
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Discover Tab (renamed from Feed)
            FeedView()
                .tabItem {
                    Image(systemName: "play.circle.fill")
                    Text("Discover")
                }
                .tag(0)
            
            // Browse Tab
            BrowseView()
                .tabItem {
                    Image(systemName: "square.grid.2x2.fill")
                    Text("Browse")
                }
                .tag(1)
            
            // Profile Tab (renamed from Person)
            ProfileView()
                .tabItem {
                    Image(systemName: "person.circle.fill")
                    Text("You")
                }
                .tag(2)
        }
        .accentColor(.purple)
        .onAppear {
            // Configure tab bar appearance - dark with blur
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor.black.withAlphaComponent(0.9)
            
            // Item colors
            appearance.stackedLayoutAppearance.normal.iconColor = UIColor.white.withAlphaComponent(0.6)
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
                .foregroundColor: UIColor.white.withAlphaComponent(0.6)
            ]
            appearance.stackedLayoutAppearance.selected.iconColor = UIColor.systemPurple
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
                .foregroundColor: UIColor.systemPurple
            ]
            
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
            
            // Ensure tab bar is always visible
            UITabBar.appearance().isTranslucent = true
            
            // Listen for subscription request
            NotificationCenter.default.addObserver(
                forName: NSNotification.Name("ShowSubscription"),
                object: nil,
                queue: .main
            ) { _ in
                showSubscription = true
            }
        }
        .sheet(isPresented: $showSubscription) {
            SubscriptionView()
                .environmentObject(authViewModel)
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
