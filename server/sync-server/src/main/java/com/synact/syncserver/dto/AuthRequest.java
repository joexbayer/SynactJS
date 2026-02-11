package com.synact.syncserver.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
    @Email(message = "Email format is invalid.")
    @NotBlank(message = "Email is required.")
    String email,

    @NotBlank(message = "Password is required.")
    @Size(min = 10, message = "Password must be at least 10 characters.")
    String password,

    String appId
) {
}
