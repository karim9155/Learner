package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.VideoDTO;
import com.example.learnprojectback.model.*;
import com.example.learnprojectback.repository.*;
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
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final ModelMapper modelMapper;

    public VideoServiceImpl(VideoRepository videoRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository, UserRepository userRepository, MembershipRepository membershipRepository, ModelMapper modelMapper) {
        this.videoRepository = videoRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public VideoDTO uploadVideo(VideoDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Video video = modelMapper.map(dto, Video.class);
        video.setCourse(course);
        video.setUser(user);
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

    @Override
    public List<VideoDTO> listAllVideos() {
        return videoRepository.findAll().stream()
                .map(video -> modelMapper.map(video, VideoDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoDTO> listVideosByUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isTrainer = membershipRepository.findByUser(user).stream()
                .anyMatch(membership -> membership.getRole() == Role.TRAINER);

        if (isTrainer) {
            return videoRepository.findAllByUserId(userId).stream()
                    .map(video -> modelMapper.map(video, VideoDTO.class))
                    .collect(Collectors.toList());
        } else { // EMPLOYEE or other roles
            List<Enrollment> enrollments = enrollmentRepository.findAllByUser_Id(userId);
            List<UUID> courseIds = enrollments.stream()
                    .map(enrollment -> enrollment.getCourse().getId())
                    .collect(Collectors.toList());

            return videoRepository.findAll().stream()
                    .filter(video -> courseIds.contains(video.getCourse().getId()))
                    .map(video -> modelMapper.map(video, VideoDTO.class))
                    .collect(Collectors.toList());
        }
    }
    @Override
    public void deleteVideo(UUID videoId) {
        videoRepository.deleteById(videoId);
    }
}
