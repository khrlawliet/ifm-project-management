package com.ifm.projectmgmt.dto;

public record UserDTO(
    Long id,
    String username,
    String email,
    String fullName
) {}
