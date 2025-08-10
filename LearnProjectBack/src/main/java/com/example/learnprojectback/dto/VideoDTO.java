package com.example.learnprojectback.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class VideoDTO {
    private UUID id;
    private UUID courseId;
    private UUID userId;
    private String title;
    private String youtubeUrl;
    private Integer durationSeconds;
    private Integer orderIndex;
}
