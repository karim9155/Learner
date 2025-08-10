package com.example.learnprojectback.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String name;
    private String lastName;
    private String department;
    private String badgeNumber;
    private String email;
    private String phone;
    private boolean active;
}
