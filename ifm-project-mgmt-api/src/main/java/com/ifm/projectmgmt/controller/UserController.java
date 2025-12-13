package com.ifm.projectmgmt.controller;

import com.ifm.projectmgmt.dto.UserDTO;
import com.ifm.projectmgmt.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;

    /**
     * Get all users
     */
    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all users in the system")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.info("GET request to fetch all users");
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Search users by username or email
     */
    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by username or email")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam(required = false) String q) {
        log.info("GET request to search users with query: {}", q);
        List<UserDTO> users = userService.searchUsers(q);
        return ResponseEntity.ok(users);
    }
}
