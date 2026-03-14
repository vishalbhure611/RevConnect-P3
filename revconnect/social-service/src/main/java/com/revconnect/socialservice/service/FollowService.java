package com.revconnect.socialservice.service;

import com.revconnect.socialservice.dto.FollowDTO;
import com.revconnect.socialservice.entity.Follow;
import com.revconnect.socialservice.repository.FollowRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    @Transactional
    public FollowDTO followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow yourself");
        }

        if (followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already following this user");
        }

        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);

        Follow savedFollow = followRepository.save(follow);
        return convertToDTO(savedFollow);
    }

    @Transactional
    public void unfollowUser(Long followerId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow relationship not found"));
        followRepository.delete(follow);
    }

    public List<Long> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId).stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());
    }

    public List<Long> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId).stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent();
    }

    private FollowDTO convertToDTO(Follow follow) {
        FollowDTO dto = new FollowDTO();
        dto.setId(follow.getId());
        dto.setFollowerId(follow.getFollowerId());
        dto.setFollowingId(follow.getFollowingId());
        dto.setCreatedAt(follow.getCreatedAt());
        return dto;
    }
}
