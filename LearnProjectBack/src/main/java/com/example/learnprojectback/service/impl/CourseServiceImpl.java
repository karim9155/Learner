package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.model.Course;
import com.example.learnprojectback.model.Organization;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.CourseRepository;
import com.example.learnprojectback.repository.OrganizationRepository;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.service.CourseService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public CourseDTO createCourse(UUID orgId, UUID trainerId, CourseDTO dto) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer (User) not found with id: " + trainerId));

        Course newCourse = modelMapper.map(dto, Course.class);
        newCourse.setCreatedBy(trainer);

        if (orgId != null) {
            Organization org = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + orgId));
            newCourse.setOrg(org);
        }

        Course savedCourse = courseRepository.save(newCourse);

        return convertToDto(savedCourse);
    }

    @Override
    public List<CourseDTO> listCourses(UUID orgId) {
        List<Course> courses = courseRepository.findByOrgId(orgId);

        return courses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(this::convertToDto) // Use the robust conversion method here as well
                .collect(Collectors.toList());
    }

    private CourseDTO convertToDto(Course course) {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setId(course.getId());
        courseDTO.setTitle(course.getTitle());
        courseDTO.setDescription(course.getDescription());

        // FIX: Add null checks to prevent any errors
        if (course.getCreatedBy() != null) {
            courseDTO.setTrainerId(course.getCreatedBy().getId());
            courseDTO.setTrainerEmail(course.getCreatedBy().getEmail());
        }
        if (course.getOrg() != null) {
            courseDTO.setOrganizationId(course.getOrg().getId());
        }
        return courseDTO;
    }
    @Override
    public List<CourseDTO> getCoursesByTrainer(UUID trainerId) {
        return courseRepository.findByCreatedById(trainerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    @Override
    public List<CourseDTO> getEnrolledCourses(UUID userId) {
        return courseRepository.findEnrolledCoursesByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    @Override
    public List<CourseDTO> getCoursesByUserId(UUID userId) {
        return courseRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    @Override
    public void deleteCourse(UUID courseId) {
        courseRepository.deleteById(courseId);
    }
}