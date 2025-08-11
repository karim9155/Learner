// src/main/java/com/example/learnprojectback/service/impl/CourseServiceImpl.java
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
        // 1. Find all courses for the given organization
        List<Course> courses = courseRepository.findByOrgId(orgId);

        // 2. Map the list of entities to a list of DTOs and return
        return courses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(course -> {
                    CourseDTO dto = new CourseDTO();
                    dto.setId(course.getId());
                    dto.setTitle(course.getTitle());
                    dto.setDescription(course.getDescription());

                    if (course.getOrg() != null) {
                        dto.setOrganizationId(course.getOrg().getId());
                    }

                    if (course.getCreatedBy() != null) {
                        dto.setTrainerId(course.getCreatedBy().getId());
                        dto.setTrainerEmail(course.getCreatedBy().getEmail());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    private CourseDTO convertToDto(Course course) {
        CourseDTO courseDTO = modelMapper.map(course, CourseDTO.class);
        if (course.getCreatedBy() != null) {
            courseDTO.setTrainerId(course.getCreatedBy().getId());
            courseDTO.setTrainerEmail(course.getCreatedBy().getEmail());
        }
        if (course.getOrg() != null) {
            courseDTO.setOrganizationId(course.getOrg().getId());
        }
        return courseDTO;
    }
}