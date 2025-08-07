package com.example.learnprojectback.service.impl;

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

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ModelMapper modelMapper;

    public EnrollmentServiceImpl(EnrollmentRepository enrollmentRepository, UserRepository userRepository, CourseRepository courseRepository, ModelMapper modelMapper) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public EnrollmentDTO assignLearner(EnrollmentDTO dto) {
        User learner = userRepository.findById(dto.getLearnerId())
                .orElseThrow(() -> new RuntimeException("Learner not found"));
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setLearner(learner);
        enrollment.setCourse(course);

        enrollment = enrollmentRepository.save(enrollment);
        return modelMapper.map(enrollment, EnrollmentDTO.class);
    }
}
