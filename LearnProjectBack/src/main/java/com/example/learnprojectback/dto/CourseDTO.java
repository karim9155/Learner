package com.example.learnprojectback.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CourseDTO {
    private UUID id;
    private UUID organizationId;
    private UUID trainerId;
    private String title;
    private String description;
}
