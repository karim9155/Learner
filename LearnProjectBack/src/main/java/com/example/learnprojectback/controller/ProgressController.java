package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.ProgressReportDTO;
import com.example.learnprojectback.dto.VideoProgressDTO;
import com.example.learnprojectback.service.VideoProgressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final VideoProgressService videoProgressService;

    public ProgressController(VideoProgressService videoProgressService) {
        this.videoProgressService = videoProgressService;
    }

    @PostMapping
    public VideoProgressDTO update(@RequestBody VideoProgressDTO dto) {
        return videoProgressService.updateProgress(dto);
    }

    @GetMapping("/by-course/{courseId}")
    public List<ProgressReportDTO> report(@PathVariable UUID courseId) {
        return videoProgressService.getProgressReport(courseId);
    }
}
