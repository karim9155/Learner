package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.VideoDTO;
import com.example.learnprojectback.service.VideoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping
    public VideoDTO upload(@RequestBody VideoDTO dto) {
        return videoService.uploadVideo(dto);
    }

    @GetMapping("/by-course/{courseId}")
    public List<VideoDTO> listByCourse(@PathVariable UUID courseId) {
        return videoService.listVideosByCourse(courseId);
    }
}
