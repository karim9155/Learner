package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.VideoDTO;

import java.util.List;
import java.util.UUID;

public interface VideoService {
    VideoDTO uploadVideo(VideoDTO dto);
    List<VideoDTO> listVideosByCourse(UUID courseId);
}
