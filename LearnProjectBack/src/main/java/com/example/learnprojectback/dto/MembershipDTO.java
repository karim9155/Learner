package com.example.learnprojectback.dto;

import com.example.learnprojectback.model.Role;
import lombok.Data;

import java.util.UUID;

@Data
public class MembershipDTO {
    private UUID id;
    private UUID organizationId;
    private UUID userId;
    private Role role;
}
