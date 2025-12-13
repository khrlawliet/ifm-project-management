package com.ifm.projectmgmt.service;

import com.ifm.projectmgmt.dto.UserDTO;
import com.ifm.projectmgmt.entity.User;
import com.ifm.projectmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream()
                             .map(this::convertToDTO)
                             .toList();
    }

    /**
     * Search users by username or email
     */
    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String search) {
        log.info("Searching users with term: {}", search);
        if (search == null || search.trim().isEmpty()) {
            return userRepository.findAll().stream()
                                 .map(this::convertToDTO)
                                 .toList();
        }

        return userRepository.searchByUsernameOrEmail(search).stream()
                             .map(this::convertToDTO)
                             .toList();
    }

    /**
     * Convert User entity to UserDTO (exclude password)
     */
    private UserDTO convertToDTO(User user) {
        return new UserDTO(user.getId(),
                           user.getUsername(),
                           user.getEmail(),
                           user.getFullName()
        );
    }
}
