package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.VideoDTO;
import com.example.learnprojectback.model.Course;
import com.example.learnprojectback.model.Video;
import com.example.learnprojectback.repository.CourseRepository;
import com.example.learnprojectback.repository.VideoRepository;
import com.example.learnprojectback.service.VideoService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoServiceImpl implements VideoService {

    private final VideoRepository videoRepository;
    private final CourseRepository courseRepository;
    private final ModelMapper modelMapper;

    public VideoServiceImpl(VideoRepository videoRepository, CourseRepository courseRepository, ModelMapper modelMapper) {
        this.videoRepository = videoRepository;
        this.courseRepository = courseRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public VideoDTO uploadVideo(VideoDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Video video = modelMapper.map(dto, Video.class);
        video.setCourse(course);
        video = videoRepository.save(video);
        return modelMapper.map(video, VideoDTO.class);
    }

    @Override
    public List<VideoDTO> listVideosByCourse(UUID courseId) {
        return videoRepository.findAll().stream()
                .filter(video -> video.getCourse().getId().equals(courseId))
                .map(video -> modelMapper.map(video, VideoDTO.class))
                .collect(Collectors.toList());
    }
}
