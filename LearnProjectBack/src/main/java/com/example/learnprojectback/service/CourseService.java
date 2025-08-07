package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.CourseDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface CourseService {
    CourseDTO createCourse(UUID orgId, UUID trainerId, CourseDTO dto);
    List<CourseDTO> listCourses(UUID orgId);
}
