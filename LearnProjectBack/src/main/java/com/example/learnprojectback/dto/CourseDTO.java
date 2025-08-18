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
    private String trainerEmail;
    // RENAMED and ADDED these fields for clarity
    private UUID createdById;
    private String createdByName;
    private String coverImage;
}
