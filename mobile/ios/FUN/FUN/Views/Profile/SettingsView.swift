/**
 * FUN App - Settings View
 * App settings and preferences
 */

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = SettingsViewModel()
    @Environment(\.dismiss) var dismiss
    
    @AppStorage("videoQuality") private var videoQuality: VideoQuality = .auto
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("autoplayEnabled") private var autoplayEnabled = true
    
    @State private var showingPasswordChange = false
    @State private var showingDeleteAccount = false
    
    var body: some View {
        ZStack {
            Colors.background.ignoresSafeArea()
            
            List {
                // Video Section
                Section {
                    Picker("Video Quality", selection: $videoQuality) {
                        ForEach(VideoQuality.allCases) { quality in
                            Text(quality.displayName).tag(quality)
                        }
                    }
                    
                    Toggle("Autoplay Next Episode", isOn: $autoplayEnabled)
                } header: {
                    Text("Video")
                }
                
                // Notifications Section
                Section {
                    Toggle("Push Notifications", isOn: $notificationsEnabled)
                        .onChange(of: notificationsEnabled) { enabled in
                            if enabled {
                                requestNotificationPermission()
                            }
                        }
                    
                    NavigationLink("Notification Preferences") {
                        NotificationPreferencesView()
                    }
                } header: {
                    Text("Notifications")
                }
                
                // Account Section
                Section {
                    Button(action: {
                        showingPasswordChange = true
                    }) {
                        HStack {
                            Image(systemName: "lock.fill")
                                .foregroundColor(Colors.primary)
                            Text("Change Password")
                                .foregroundColor(Colors.textPrimary)
                        }
                    }
                    
                    NavigationLink("Restore Purchases") {
                        RestorePurchasesView()
                    }
                    
                    Button(action: {
                        showingDeleteAccount = true
                    }) {
                        HStack {
                            Image(systemName: "trash.fill")
                                .foregroundColor(Colors.accent)
                            Text("Delete Account")
                                .foregroundColor(Colors.accent)
                        }
                    }
                } header: {
                    Text("Account")
                }
                
                // About Section
                Section {
                    NavigationLink("Privacy Policy") {
                        WebView(url: "https://fun.app/privacy")
                    }
                    
                    NavigationLink("Terms of Service") {
                        WebView(url: "https://fun.app/terms")
                    }
                    
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(Bundle.main.appVersion)
                            .foregroundColor(Colors.textSecondary)
                    }
                } header: {
                    Text("About")
                }
            }
            .scrollContentBackground(.hidden)
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showingPasswordChange) {
            ChangePasswordView()
                .environmentObject(authViewModel)
        }
        .alert("Delete Account", isPresented: $showingDeleteAccount) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task {
                    await viewModel.deleteAccount()
                    authViewModel.logout()
                }
            }
        } message: {
            Text("This action cannot be undone. All your data will be permanently deleted.")
        }
    }
    
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if !granted {
                DispatchQueue.main.async {
                    notificationsEnabled = false
                }
            }
        }
    }
}

// MARK: - Notification Preferences View

struct NotificationPreferencesView: View {
    @AppStorage("notifyNewEpisodes") private var notifyNewEpisodes = true
    @AppStorage("notifyLikes") private var notifyLikes = true
    @AppStorage("notifyComments") private var notifyComments = true
    @AppStorage("notifyFollowers") private var notifyFollowers = true
    
    var body: some View {
        List {
            Toggle("New Episodes", isOn: $notifyNewEpisodes)
            Toggle("Likes", isOn: $notifyLikes)
            Toggle("Comments", isOn: $notifyComments)
            Toggle("New Followers", isOn: $notifyFollowers)
        }
        .navigationTitle("Notification Preferences")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Change Password View

struct ChangePasswordView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccess = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Current password
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Current Password")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(Colors.textPrimary)
                            
                            SecureField("Enter current password", text: $currentPassword)
                                .textFieldStyle(.plain)
                                .padding()
                                .background(Colors.surface)
                                .cornerRadius(12)
                        }
                        
                        // New password
                        VStack(alignment: .leading, spacing: 8) {
                            Text("New Password")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(Colors.textPrimary)
                            
                            SecureField("Enter new password", text: $newPassword)
                                .textFieldStyle(.plain)
                                .padding()
                                .background(Colors.surface)
                                .cornerRadius(12)
                        }
                        
                        // Confirm password
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirm New Password")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(Colors.textPrimary)
                            
                            SecureField("Confirm new password", text: $confirmPassword)
                                .textFieldStyle(.plain)
                                .padding()
                                .background(Colors.surface)
                                .cornerRadius(12)
                        }
                        
                        // Error message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(Colors.accent)
                        }
                        
                        // Change button
                        Button(action: changePassword) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 56)
                            } else {
                                Text("Change Password")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 56)
                            }
                        }
                        .background(Colors.primary)
                        .cornerRadius(16)
                        .disabled(isLoading || !isValidForm)
                    }
                    .padding()
                }
            }
            .navigationTitle("Change Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Success", isPresented: $showingSuccess) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Password changed successfully")
            }
        }
    }
    
    private var isValidForm: Bool {
        !currentPassword.isEmpty &&
        !newPassword.isEmpty &&
        !confirmPassword.isEmpty &&
        newPassword == confirmPassword &&
        newPassword.count >= 8
    }
    
    private func changePassword() {
        guard isValidForm else {
            errorMessage = "Please check all fields"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await APIClient.shared.requestWithoutResponse(
                    .changePassword,
                    method: .post,
                    parameters: [
                        "currentPassword": currentPassword,
                        "newPassword": newPassword
                    ]
                )
                
                isLoading = false
                showingSuccess = true
            } catch {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }
}

// MARK: - Restore Purchases View

struct RestorePurchasesView: View {
    @State private var isRestoring = false
    @State private var resultMessage: String?
    
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "arrow.clockwise.circle.fill")
                .font(.system(size: 64))
                .foregroundColor(Colors.primary)
            
            Text("Restore Purchases")
                .font(.title2.bold())
                .foregroundColor(Colors.textPrimary)
            
            Text("If you've purchased credits or subscriptions on another device, you can restore them here.")
                .font(.body)
                .foregroundColor(Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            if let message = resultMessage {
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(Colors.success)
                    .padding()
                    .background(Colors.success.opacity(0.2))
                    .cornerRadius(8)
            }
            
            Button(action: restore) {
                if isRestoring {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                } else {
                    Text("Restore Purchases")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                }
            }
            .background(Colors.primary)
            .cornerRadius(16)
            .padding(.horizontal)
            .disabled(isRestoring)
            
            Spacer()
        }
        .padding(.top, 40)
        .navigationTitle("Restore Purchases")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func restore() {
        isRestoring = true
        
        Task {
            await IAPManager.shared.restorePurchases()
            resultMessage = "Purchases restored successfully"
            isRestoring = false
        }
    }
}

// MARK: - Web View

struct WebView: View {
    let url: String
    
    var body: some View {
        Text("Web view for: \(url)")
            .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Settings ViewModel

@MainActor
class SettingsViewModel: ObservableObject {
    @Published var isLoading = false
    
    private let apiClient = APIClient.shared
    
    func deleteAccount() async {
        isLoading = true
        
        do {
            try await apiClient.requestWithoutResponse(
                .deleteAccount,
                method: .delete
            )
            isLoading = false
        } catch {
            print("Delete account error: \(error)")
            isLoading = false
        }
    }
}

// MARK: - Extensions

extension Bundle {
    var appVersion: String {
        return infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }
}

extension VideoQuality: CaseIterable {
    static var allCases: [VideoQuality] = [.auto, .quality360, .quality540, .quality720, .quality1080]
}

extension VideoQuality: Identifiable {
    var id: String { displayName }
    
    var displayName: String {
        switch self {
        case .auto: return "Auto"
        case .quality360: return "360p"
        case .quality540: return "540p"
        case .quality720: return "720p (HD)"
        case .quality1080: return "1080p (Full HD)"
        }
    }
}

#Preview {
    NavigationView {
        SettingsView()
            .environmentObject(AuthViewModel())
    }
}
