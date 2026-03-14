package com.revconnect.userservice.controller;

import com.revconnect.userservice.dto.RegisterRequest;
import com.revconnect.userservice.dto.UpdateUserRequest;
import com.revconnect.userservice.dto.UserDTO;
import com.revconnect.userservice.entity.BusinessProfile;
import com.revconnect.userservice.entity.CreatorProfile;
import com.revconnect.userservice.repository.BusinessProfileRepository;
import com.revconnect.userservice.repository.CreatorProfileRepository;
import com.revconnect.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private CreatorProfileRepository creatorProfileRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserDTO user = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            UserDTO user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            UserDTO user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UpdateUserRequest request) {
        try {
            UserDTO user = userService.updateUser(userId, request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            UserDTO user = userService.getUserById(userId);
            Map<String, Object> profile = new HashMap<>();
            profile.put("user", user);

            if ("BUSINESS".equals(user.getRole())) {
                businessProfileRepository.findByUserId(userId).ifPresent(bp -> profile.put("businessProfile", bp));
            } else if ("CREATOR".equals(user.getRole())) {
                creatorProfileRepository.findByUserId(userId).ifPresent(cp -> profile.put("creatorProfile", cp));
            }

            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/creator-profile")
    public ResponseEntity<?> saveCreatorProfile(@PathVariable Long userId, @RequestBody CreatorProfile profile) {
        try {
            CreatorProfile existing = creatorProfileRepository.findByUserId(userId).orElse(new CreatorProfile());
            existing.setUserId(userId);
            existing.setCreatorName(profile.getCreatorName());
            existing.setContentCategory(profile.getContentCategory());
            existing.setDetailedBio(profile.getDetailedBio());
            existing.setContactEmail(profile.getContactEmail());
            existing.setContactPhone(profile.getContactPhone());
            existing.setWebsiteUrl(profile.getWebsiteUrl());
            existing.setPortfolioUrl(profile.getPortfolioUrl());
            existing.setSocialLinks(profile.getSocialLinks());
            existing.setExternalLinks(profile.getExternalLinks());
            existing.setSubscriberCount(profile.getSubscriberCount());
            return ResponseEntity.ok(creatorProfileRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/business-profile")
    public ResponseEntity<?> saveBusinessProfile(@PathVariable Long userId, @RequestBody BusinessProfile profile) {
        try {
            BusinessProfile existing = businessProfileRepository.findByUserId(userId).orElse(new BusinessProfile());
            existing.setUserId(userId);
            existing.setCompanyName(profile.getCompanyName());
            existing.setIndustry(profile.getIndustry());
            existing.setCompanySize(profile.getCompanySize());
            existing.setDescription(profile.getDescription());
            existing.setContactEmail(profile.getContactEmail());
            existing.setPhoneNumber(profile.getPhoneNumber());
            existing.setBusinessAddress(profile.getBusinessAddress());
            existing.setCity(profile.getCity());
            existing.setCountry(profile.getCountry());
            existing.setWebsiteUrl(profile.getWebsiteUrl());
            existing.setSocialLinks(profile.getSocialLinks());
            existing.setBusinessHours(profile.getBusinessHours());
            existing.setExternalLinks(profile.getExternalLinks());
            return ResponseEntity.ok(businessProfileRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
