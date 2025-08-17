// karim9155/learner/Learner-6bb22e8d279db03baeab60b29e20ac5e0c7c258b/LearnProjectBack/src/main/java/com/example/learnprojectback/service/impl/EnrollmentServiceImpl.java

package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.BatchEnrollmentRequest;
import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.dto.EnrollmentDTO;
import com.example.learnprojectback.model.Course;
import com.example.learnprojectback.model.Enrollment;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.CourseRepository;
import com.example.learnprojectback.repository.EnrollmentRepository;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.service.EnrollmentService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ModelMapper modelMapper; // Make sure ModelMapper is injected


    public EnrollmentServiceImpl(EnrollmentRepository enrollmentRepository, UserRepository userRepository, CourseRepository courseRepository, ModelMapper modelMapper) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public EnrollmentDTO assignLearner(EnrollmentDTO dto, UUID adminId) {
        User learner = userRepository.findById(dto.getLearnerId())
                .orElseThrow(() -> new RuntimeException("Learner not found with ID: " + dto.getLearnerId()));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found with ID: " + adminId));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + dto.getCourseId()));

        Enrollment enrollment = new Enrollment();
        enrollment.setLearner(learner); // Set the employee
        enrollment.setUser(admin);      // Set the admin
        enrollment.setCourse(course);

        enrollment = enrollmentRepository.save(enrollment);

        // Manually create the response DTO to ensure fields are not null
        EnrollmentDTO responseDto = new EnrollmentDTO();
        responseDto.setId(enrollment.getId());
        responseDto.setLearnerId(enrollment.getLearner().getId());
        responseDto.setCourseId(enrollment.getCourse().getId());

        return responseDto;
    }

    @Override
    @Transactional
    public List<EnrollmentDTO> assignLearnersToCourse(BatchEnrollmentRequest request, UUID adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found with ID: " + adminId));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + request.getCourseId()));

        List<Enrollment> newEnrollments = new ArrayList<>();
        for (UUID learnerId : request.getLearnerIds()) {
            User learner = userRepository.findById(learnerId)
                    .orElseThrow(() -> new RuntimeException("Learner not found with ID: " + learnerId));

            Enrollment enrollment = new Enrollment();
            enrollment.setLearner(learner);
            enrollment.setUser(admin);
            enrollment.setCourse(course);
            newEnrollments.add(enrollment);
        }

        List<Enrollment> savedEnrollments = enrollmentRepository.saveAll(newEnrollments);

        return savedEnrollments.stream().map(enrollment -> {
            EnrollmentDTO dto = new EnrollmentDTO();
            dto.setId(enrollment.getId());
            dto.setLearnerId(enrollment.getLearner().getId());
            dto.setCourseId(enrollment.getCourse().getId());
            return dto;
        }).collect(Collectors.toList());
    }
    @Override
    public List<CourseDTO> getCoursesEnrolledByAdmin(UUID adminId) {
        // STEP 1: Fetch the fully loaded Course entities.
        List<Course> courses = enrollmentRepository.findCoursesByAdminEnrollments(adminId);

        // STEP 2: Manually map the results to DTOs. This is now safe from errors.
        return courses.stream()
                .map(this::convertToCourseDTO)
                .collect(Collectors.toList());
    }

    // ADD THIS HELPER METHOD to perform the manual mapping.
    private CourseDTO convertToCourseDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle()); // Assuming 'name' is the title field
        dto.setDescription(course.getDescription());

        // Safely handle the createdBy user
        User createdBy = course.getCreatedBy();
        if (createdBy != null) {
            // This now correctly populates the trainerEmail field.
            dto.setTrainerEmail(createdBy.getEmail());
        }

        return dto;
    }
}