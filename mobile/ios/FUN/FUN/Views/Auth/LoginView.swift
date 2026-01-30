/**
 * FUN App - Login View
 */

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var showSignup = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    // Logo
                    Text("FUN")
                        .font(.system(size: 64, weight: .bold))
                        .foregroundColor(Colors.primary)
                    
                    Text("Vertical Drama Reels")
                        .font(.headline)
                        .foregroundColor(Colors.textSecondary)
                    
                    Spacer().frame(height: 40)
                    
                    // Email field
                    TextField("Email", text: $email)
                        .textFieldStyle(FUNTextFieldStyle())
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                    
                    // Password field
                    SecureField("Password", text: $password)
                        .textFieldStyle(FUNTextFieldStyle())
                        .textContentType(.password)
                    
                    // Error message
                    if let error = authViewModel.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(Colors.accent)
                            .multilineTextAlignment(.center)
                    }
                    
                    // Login button
                    Button(action: {
                        Task {
                            await authViewModel.login(email: email, password: password)
                        }
                    }) {
                        if authViewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                        } else {
                            Text("Log In")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                        }
                    }
                    .background(Colors.primary)
                    .cornerRadius(12)
                    .disabled(authViewModel.isLoading || email.isEmpty || password.isEmpty)
                    
                    // Signup link
                    Button(action: {
                        showSignup = true
                    }) {
                        HStack(spacing: 4) {
                            Text("Don't have an account?")
                                .foregroundColor(Colors.textSecondary)
                            Text("Sign Up")
                                .foregroundColor(Colors.primary)
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal, 32)
                .padding(.top, 60)
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showSignup) {
                SignupView()
                    .environmentObject(authViewModel)
            }
        }
    }
}

// Custom text field style
struct FUNTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Colors.surface)
            .cornerRadius(12)
            .foregroundColor(Colors.textPrimary)
            .accentColor(Colors.primary)
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthViewModel())
}
