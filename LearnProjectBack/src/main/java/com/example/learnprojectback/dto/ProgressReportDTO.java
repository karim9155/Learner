package com.example.learnprojectback.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ProgressReportDTO {
    private UUID courseId;
    private UUID learnerId;
    private int progress;
}
