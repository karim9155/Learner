package com.example.learnprojectback.dto;

import com.example.learnprojectback.model.Role;
import lombok.Data;

@Data
public class UserCreationRequest {
    private String name;
    private String lastName;
    private String department;
    private String badgeNumber;
    private String email;
    private String password;
    private String phone;
    private Role role;
}
