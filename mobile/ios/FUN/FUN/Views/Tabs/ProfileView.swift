/**
 * FUN App - Profile View
 * User profile and settings
 */

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingLogoutAlert = false
    @State private var showingEditProfile = false
    @State private var showingSubscription = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // User info
                        userInfoSection
                        
                        // Premium status
                        if let user = authViewModel.currentUser {
                            premiumStatusSection(user: user)
                        }
                        
                        // Settings sections
                        settingsSection
                        
                        // Account actions
                        accountSection
                        
                        // Logout button
                        Button(action: {
                            showingLogoutAlert = true
                        }) {
                            Text("Logout")
                                .font(.headline)
                                .foregroundColor(Colors.accent)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Colors.surface)
                                .cornerRadius(12)
                        }
                        .padding(.horizontal)
                        .padding(.top, 16)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .alert("Logout", isPresented: $showingLogoutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Logout", role: .destructive) {
                    authViewModel.logout()
                }
            } message: {
                Text("Are you sure you want to logout?")
            }
            .sheet(isPresented: $showingEditProfile) {
                EditProfileView()
                    .environmentObject(authViewModel)
            }
            .sheet(isPresented: $showingSubscription) {
                SubscriptionView()
                    .environmentObject(authViewModel)
            }
        }
    }
    
    private var userInfoSection: some View {
        VStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(Colors.surface)
                .frame(width: 100, height: 100)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(Colors.textSecondary)
                )
            
            // Name and email
            VStack(spacing: 4) {
                Text(authViewModel.currentUser?.displayName ?? "User")
                    .font(.title2.bold())
                    .foregroundColor(Colors.textPrimary)
                
                Text(authViewModel.currentUser?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(Colors.textSecondary)
            }
            
            // Edit button
            Button(action: {
                showingEditProfile = true
            }) {
                Text("Edit Profile")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(Colors.primary)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 8)
                    .background(Colors.primary.opacity(0.2))
                    .cornerRadius(20)
            }
        }
        .padding()
    }
    
    private func premiumStatusSection(user: User) -> some View {
        VStack(spacing: 12) {
            if user.isPremium {
                HStack {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                    
                    Text("Premium Active")
                        .font(.headline)
                        .foregroundColor(Colors.textPrimary)
                    
                    Spacer()
                }
                
                if let expiresAt = user.premiumExpiresAt {
                    Text("Expires: \(expiresAt)")
                        .font(.caption)
                        .foregroundColor(Colors.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            } else {
                VStack(spacing: 12) {
                    Text("Upgrade to Premium")
                        .font(.headline)
                        .foregroundColor(Colors.textPrimary)
                    
                    Text("Unlock all episodes, no ads")
                        .font(.subheadline)
                        .foregroundColor(Colors.textSecondary)
                    
                    Button(action: {
                        showingSubscription = true
                    }) {
                        Text("Get Premium")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Colors.primary)
                            .cornerRadius(8)
                    }
                }
            }
        }
        .padding()
        .background(Colors.surface)
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Settings")
                .font(.headline)
                .foregroundColor(Colors.textPrimary)
                .padding(.horizontal)
                .padding(.bottom, 8)
            
            VStack(spacing: 0) {
                NavigationLink(destination: WatchHistoryView()) {
                    settingsRowContent(icon: "clock.fill", title: "Watch History")
                }
                Divider().background(Colors.divider).padding(.leading, 56)
                
                NavigationLink(destination: SettingsView().environmentObject(authViewModel)) {
                    settingsRowContent(icon: "gearshape.fill", title: "Settings")
                }
            }
            .background(Colors.surface)
            .cornerRadius(12)
            .padding(.horizontal)
        }
    }
    
    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Account")
                .font(.headline)
                .foregroundColor(Colors.textPrimary)
                .padding(.horizontal)
                .padding(.bottom, 8)
            
            VStack(spacing: 0) {
                NavigationLink(destination: Text("Help & Support")) {
                    settingsRowContent(icon: "questionmark.circle.fill", title: "Help & Support")
                }
                Divider().background(Colors.divider).padding(.leading, 56)
                
                NavigationLink(destination: Text("Privacy Policy")) {
                    settingsRowContent(icon: "doc.text.fill", title: "Privacy Policy")
                }
                Divider().background(Colors.divider).padding(.leading, 56)
                
                NavigationLink(destination: Text("Terms of Service")) {
                    settingsRowContent(icon: "doc.text.fill", title: "Terms of Service")
                }
            }
            .background(Colors.surface)
            .cornerRadius(12)
            .padding(.horizontal)
        }
    }
    
    private func settingsRowContent(icon: String, title: String, value: String? = nil) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(Colors.primary)
                .frame(width: 24)
            
            Text(title)
                .font(.body)
                .foregroundColor(Colors.textPrimary)
            
            Spacer()
            
            if let value = value {
                Text(value)
                    .font(.subheadline)
                    .foregroundColor(Colors.textSecondary)
            }
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(Colors.textSecondary)
        }
        .padding()
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
