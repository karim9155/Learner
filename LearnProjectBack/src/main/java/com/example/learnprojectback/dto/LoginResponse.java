package com.example.learnprojectback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String jwt;
    private UserDTO user; // <-- Add this line

}
