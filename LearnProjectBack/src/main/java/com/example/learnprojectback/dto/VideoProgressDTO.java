package com.example.learnprojectback.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class VideoProgressDTO {
    private UUID id;
    private UUID learnerId;
    private UUID videoId;
    private int watchedPercent;
}
