package com.revconnect.socialservice.controller;

import com.revconnect.socialservice.dto.FollowDTO;
import com.revconnect.socialservice.dto.FollowRequest;
import com.revconnect.socialservice.service.FollowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping
    public ResponseEntity<FollowDTO> followUser(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody FollowRequest request) {
        FollowDTO follow = followService.followUser(userId, request.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(follow);
    }

    @DeleteMapping
    public ResponseEntity<Void> unfollowUser(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long followingId) {
        followService.unfollowUser(userId, followingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<Long>> getFollowers(@PathVariable Long userId) {
        List<Long> followers = followService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<List<Long>> getFollowing(@PathVariable Long userId) {
        List<Long> following = followService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isFollowing(
            @RequestParam Long followerId,
            @RequestParam Long followingId) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(isFollowing);
    }
}
