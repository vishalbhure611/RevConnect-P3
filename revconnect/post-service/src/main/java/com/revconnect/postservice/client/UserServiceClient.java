package com.revconnect.postservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;

@Component
public class UserServiceClient {

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    private final RestTemplate restTemplate;

    public UserServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> getUserById(Long userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId;
            return restTemplate.getForObject(url, Map.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("User not found");
        } catch (Exception e) {
            throw new RuntimeException("User service unavailable");
        }
    }

    public boolean userExists(Long userId) {
        try {
            getUserById(userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
