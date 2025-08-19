package com.example.learnprojectback.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class LearnerCourseInfoDTO {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private List<CourseDTO> enrolledCourses;
}