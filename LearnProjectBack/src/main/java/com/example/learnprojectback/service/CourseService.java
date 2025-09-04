package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.dto.PublishCourseRequestDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public interface CourseService {
    CourseDTO createCourse(UUID orgId, UUID trainerId, CourseDTO dto, MultipartFile coverImage);
    CourseDTO publishCourse(PublishCourseRequestDTO request);
    List<CourseDTO> listCourses(UUID orgId);
    List<CourseDTO> getAllCourses(String search);
    List<CourseDTO> getCoursesByTrainer(UUID trainerId, String search);
    void deleteCourse(UUID courseId);
    List<CourseDTO> getEnrolledCourses(UUID userId); // New Method
    List<CourseDTO> getCoursesByUserId(UUID userId);
}