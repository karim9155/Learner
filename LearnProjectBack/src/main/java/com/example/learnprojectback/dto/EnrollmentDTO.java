package com.example.learnprojectback.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class EnrollmentDTO {
    private UUID id;
    private UUID learnerId;
    private UUID courseId;
}
