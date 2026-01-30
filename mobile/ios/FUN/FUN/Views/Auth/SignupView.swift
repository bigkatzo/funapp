/**
 * FUN App - Signup View
 */

import SwiftUI

struct SignupView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var displayName = ""
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        Text("Create Account")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(Colors.textPrimary)
                            .padding(.top, 40)
                        
                        // Display name
                        TextField("Display Name", text: $displayName)
                            .textFieldStyle(FUNTextFieldStyle())
                            .textContentType(.name)
                        
                        // Email
                        TextField("Email", text: $email)
                            .textFieldStyle(FUNTextFieldStyle())
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
                        
                        // Password
                        SecureField("Password", text: $password)
                            .textFieldStyle(FUNTextFieldStyle())
                            .textContentType(.newPassword)
                        
                        // Confirm password
                        SecureField("Confirm Password", text: $confirmPassword)
                            .textFieldStyle(FUNTextFieldStyle())
                            .textContentType(.newPassword)
                        
                        // Error message
                        if showError {
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(Colors.accent)
                                .multilineTextAlignment(.center)
                        }
                        
                        // Signup button
                        Button(action: {
                            validateAndSignup()
                        }) {
                            if authViewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                            } else {
                                Text("Sign Up")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                            }
                        }
                        .background(Colors.primary)
                        .cornerRadius(12)
                        .disabled(authViewModel.isLoading || !isFormValid)
                        .padding(.top, 8)
                        
                        Text("By signing up, you agree to our Terms of Service and Privacy Policy")
                            .font(.caption)
                            .foregroundColor(Colors.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 32)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Colors.primary)
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && !confirmPassword.isEmpty && !displayName.isEmpty
    }
    
    private func validateAndSignup() {
        // Validate email
        guard email.contains("@") && email.contains(".") else {
            showError(message: "Please enter a valid email address")
            return
        }
        
        // Validate password length
        guard password.count >= 6 else {
            showError(message: "Password must be at least 6 characters")
            return
        }
        
        // Validate passwords match
        guard password == confirmPassword else {
            showError(message: "Passwords do not match")
            return
        }
        
        // Validate display name
        guard displayName.count >= 2 else {
            showError(message: "Display name must be at least 2 characters")
            return
        }
        
        showError = false
        
        Task {
            await authViewModel.signup(
                email: email,
                password: password,
                displayName: displayName
            )
            
            if authViewModel.isAuthenticated {
                dismiss()
            } else if let error = authViewModel.errorMessage {
                showError(message: error)
            }
        }
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}

#Preview {
    SignupView()
        .environmentObject(AuthViewModel())
}
