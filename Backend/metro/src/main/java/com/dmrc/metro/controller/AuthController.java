package com.dmrc.metro.controller;

import com.dmrc.metro.entity.User;
import com.dmrc.metro.repository.UserRepository;
import com.dmrc.metro.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final boolean cookieSecure;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil, @Value("${cookie.secure}") boolean cookieSecure) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.cookieSecure = cookieSecure;
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("jwtToken", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("None") // Required for cross-site cookies
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request, HttpServletResponse response) {
        if (!request.password.equals(request.confirmPassword)) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }
        
        if (userRepository.findByEmail(request.email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        
        User newUser = new User(request.email, request.name, request.password, request.phoneNumber);
        userRepository.save(newUser);
        
        String token = jwtUtil.generateToken(newUser.getEmail());
        setJwtCookie(response, token);
        
        return ResponseEntity.ok(new AuthResponse("User registered successfully!", newUser.getName(), newUser.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest request, HttpServletResponse response) {
        Optional<User> user = userRepository.findByEmail(request.email);
        
        if (user.isPresent() && user.get().getPassword().equals(request.password)) {
            String token = jwtUtil.generateToken(user.get().getEmail());
            setJwtCookie(response, token);
            return ResponseEntity.ok(new AuthResponse("Login successful!", user.get().getName(), user.get().getEmail()));
        }
        
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        
        if (!userOpt.isPresent()) {
             return ResponseEntity.status(404).body("User not found");
        }
        
        User user = userOpt.get();
        if (!user.getPassword().equals(request.currentPassword)) {
             return ResponseEntity.status(401).body("Incorrect current password");
        }
        
        if (!request.newPassword.equals(request.confirmPassword)) {
             return ResponseEntity.badRequest().body("New password and confirm password do not match");
        }
        
        user.setPassword(request.newPassword);
        userRepository.save(user);
        
        return ResponseEntity.ok("Password updated successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(jakarta.servlet.http.HttpServletRequest request) {
        String token = jwtUtil.getTokenFromCookies(request);
        if (token != null && jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractEmail(token);
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(new UserResponse(
                    user.get().getName(), 
                    user.get().getEmail(), 
                    user.get().getPhoneNumber()
                ));
            }
        }
        return ResponseEntity.status(401).body("Not authenticated");
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromCookies(httpRequest);
        if (token != null && jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractEmail(token);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (request.name != null && !request.name.isEmpty()) {
                    user.setName(request.name);
                }
                if (request.phoneNumber != null && !request.phoneNumber.isEmpty()) {
                    user.setPhoneNumber(request.phoneNumber);
                }
                userRepository.save(user);
                return ResponseEntity.ok(new UserResponse(user.getName(), user.getEmail(), user.getPhoneNumber()));
            }
        }
        return ResponseEntity.status(401).body("Not authenticated");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwtToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountRequest request, HttpServletResponse response) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.password)) {
            userRepository.delete(userOpt.get());
            
            // Clear JWT cookie after deletion
            ResponseCookie cookie = ResponseCookie.from("jwtToken", "")
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(0)
                    .sameSite("None")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            
            return ResponseEntity.ok("Account deleted successfully");
        }
        
        return ResponseEntity.status(401).body("Invalid credentials for account deletion");
    }

    static class AuthRequest {
        public String email;
        public String name;
        public String password;
        public String confirmPassword;
        public String phoneNumber;
    }

    static class AuthResponse {
        public String message;
        public String name;
        public String email;
        public AuthResponse(String m, String n, String e) {
            this.message = m;
            this.name = n;
            this.email = e;
        }
    }

    static class ChangePasswordRequest {
        public String email;
        public String currentPassword;
        public String newPassword;
        public String confirmPassword;
    }

    static class UserResponse {
        public String name;
        public String email;
        public String phoneNumber;
        public UserResponse(String n, String e, String p) {
            this.name = n;
            this.email = e;
            this.phoneNumber = p;
        }
    }

    static class UpdateProfileRequest {
        public String name;
        public String phoneNumber;
    }

    static class DeleteAccountRequest {
        public String email;
        public String password;
    }
}
