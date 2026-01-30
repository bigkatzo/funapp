/**
 * FUN App - Edit Profile View
 * Edit username, bio, avatar
 */

import SwiftUI
import PhotosUI

struct EditProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var displayName: String = ""
    @State private var bio: String = ""
    @State private var selectedImage: PhotosPickerItem?
    @State private var profileImage: UIImage?
    @State private var isUploading = false
    @State private var errorMessage: String?
    @State private var showingSuccessAlert = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Avatar picker
                        avatarSection
                        
                        // Form fields
                        VStack(spacing: 16) {
                            // Display name
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Display Name")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(Colors.textPrimary)
                                
                                TextField("Enter your name", text: $displayName)
                                    .textFieldStyle(.plain)
                                    .padding()
                                    .background(Colors.surface)
                                    .cornerRadius(12)
                                    .foregroundColor(Colors.textPrimary)
                            }
                            
                            // Bio
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Bio")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(Colors.textPrimary)
                                
                                TextEditor(text: $bio)
                                    .frame(height: 100)
                                    .padding(8)
                                    .background(Colors.surface)
                                    .cornerRadius(12)
                                    .foregroundColor(Colors.textPrimary)
                                    .scrollContentBackground(.hidden)
                            }
                            
                            // Character count
                            Text("\(bio.count)/200")
                                .font(.caption)
                                .foregroundColor(Colors.textSecondary)
                                .frame(maxWidth: .infinity, alignment: .trailing)
                        }
                        .padding(.horizontal)
                        
                        // Error message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(Colors.accent)
                                .padding(.horizontal)
                        }
                        
                        // Save button
                        Button(action: saveProfile) {
                            if isUploading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 56)
                            } else {
                                Text("Save Changes")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 56)
                            }
                        }
                        .background(Colors.primary)
                        .cornerRadius(16)
                        .padding(.horizontal)
                        .disabled(isUploading)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Colors.textSecondary)
                }
            }
            .onAppear {
                displayName = authViewModel.currentUser?.displayName ?? ""
                bio = authViewModel.currentUser?.bio ?? ""
            }
            .alert("Success", isPresented: $showingSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Profile updated successfully")
            }
        }
    }
    
    private var avatarSection: some View {
        VStack(spacing: 16) {
            // Avatar display
            if let image = profileImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 120, height: 120)
                    .clipShape(Circle())
            } else {
                Circle()
                    .fill(Colors.surface)
                    .frame(width: 120, height: 120)
                    .overlay(
                        Group {
                            if let avatarUrl = authViewModel.currentUser?.avatarUrl,
                               !avatarUrl.isEmpty {
                                // Load avatar from URL
                                AsyncImage(url: URL(string: avatarUrl)) { image in
                                    image
                                        .resizable()
                                        .scaledToFill()
                                } placeholder: {
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(Colors.textSecondary)
                                }
                            } else {
                                Image(systemName: "person.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(Colors.textSecondary)
                            }
                        }
                    )
                    .clipShape(Circle())
            }
            
            // Photo picker
            PhotosPicker(selection: $selectedImage, matching: .images) {
                Text("Change Photo")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(Colors.primary)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 8)
                    .background(Colors.primary.opacity(0.2))
                    .cornerRadius(20)
            }
            .onChange(of: selectedImage) { newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        profileImage = image
                    }
                }
            }
        }
    }
    
    private func saveProfile() {
        guard !isUploading else { return }
        
        // Limit bio length
        if bio.count > 200 {
            errorMessage = "Bio must be 200 characters or less"
            return
        }
        
        isUploading = true
        errorMessage = nil
        
        Task {
            do {
                var avatarUrl: String? = nil
                
                // Upload avatar if changed
                if let image = profileImage {
                    avatarUrl = try await uploadAvatar(image)
                }
                
                // Update profile
                var parameters: [String: Any] = [
                    "displayName": displayName
                ]
                
                if !bio.isEmpty {
                    parameters["bio"] = bio
                }
                
                if let url = avatarUrl {
                    parameters["avatarUrl"] = url
                }
                
                try await APIClient.shared.requestWithoutResponse(
                    .updateProfile,
                    method: .put,
                    parameters: parameters
                )
                
                // Refresh user data
                await authViewModel.fetchProfile()
                
                isUploading = false
                showingSuccessAlert = true
            } catch {
                errorMessage = error.localizedDescription
                isUploading = false
            }
        }
    }
    
    private func uploadAvatar(_ image: UIImage) async throws -> String {
        // Compress image
        guard let imageData = image.jpegData(compressionQuality: 0.7) else {
            throw NSError(domain: "ImageError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to process image"])
        }
        
        // Get upload URL from backend
        struct UploadURLResponse: Decodable {
            let uploadUrl: String
            let fileUrl: String
        }
        
        let uploadResponse: UploadURLResponse = try await APIClient.shared.request(
            .getUploadURL(type: "avatar"),
            method: .get
        )
        
        // Upload to S3
        var request = URLRequest(url: URL(string: uploadResponse.uploadUrl)!)
        request.httpMethod = "PUT"
        request.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")
        request.httpBody = imageData
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NSError(domain: "UploadError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to upload image"])
        }
        
        return uploadResponse.fileUrl
    }
}

#Preview {
    EditProfileView()
        .environmentObject(AuthViewModel())
}
