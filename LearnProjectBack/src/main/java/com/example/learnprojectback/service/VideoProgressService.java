package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.ProgressReportDTO;
import com.example.learnprojectback.dto.VideoProgressDTO;

import java.util.List;
import java.util.UUID;

public interface VideoProgressService {
    VideoProgressDTO updateProgress(VideoProgressDTO dto);
    List<ProgressReportDTO> getProgressReport(UUID courseId);
}
