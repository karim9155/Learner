package com.example.learnprojectback.dto;

import com.example.learnprojectback.model.Role;
import lombok.Data;

@Data
public class UserCreationRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
}
