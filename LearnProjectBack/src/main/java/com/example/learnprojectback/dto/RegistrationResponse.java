package com.example.learnprojectback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class RegistrationResponse {
    private UUID id;
    private String message;
}
