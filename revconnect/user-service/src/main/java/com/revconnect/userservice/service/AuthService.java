package com.revconnect.userservice.service;

import com.revconnect.userservice.dto.AuthResponse;
import com.revconnect.userservice.dto.LoginRequest;
import com.revconnect.userservice.dto.UserDTO;
import com.revconnect.userservice.entity.User;
import com.revconnect.userservice.repository.UserRepository;
import com.revconnect.userservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

        UserDTO userDTO = mapToDTO(user);
        return new AuthResponse(token, userDTO);
    }

    public UserDTO validateToken(String token) {
        try {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return mapToDTO(user);
        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setBio(user.getBio());
        dto.setLocation(user.getLocation());
        dto.setWebsite(user.getWebsite());
        dto.setProfilePicturePath(user.getProfilePicturePath());
        dto.setAccountPrivacy(user.getAccountPrivacy());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
