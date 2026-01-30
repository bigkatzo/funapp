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
            // Feed Tab
            FeedView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Feed")
                }
                .tag(0)
            
            // Browse Tab
            BrowseView()
                .tabItem {
                    Image(systemName: "square.grid.2x2.fill")
                    Text("Browse")
                }
                .tag(1)
            
            // Market Tab (Placeholder)
            MarketView()
                .tabItem {
                    Image(systemName: "bag.fill")
                    Text("Market")
                }
                .tag(2)
            
            // Credits Tab
            CreditsView()
                .tabItem {
                    Image(systemName: "creditcard.fill")
                    Text("Credits")
                }
                .tag(3)
            
            // Profile Tab
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(4)
        }
        .accentColor(Colors.primary)
        .onAppear {
            // Configure tab bar appearance
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(Colors.surface)
            
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
            
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
