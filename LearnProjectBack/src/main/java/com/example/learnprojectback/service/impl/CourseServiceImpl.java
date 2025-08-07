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

@Service // The @Service annotation goes on the implementation class
@RequiredArgsConstructor // Lombok annotation for constructor injection
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public CourseDTO createCourse(UUID orgId, UUID trainerId, CourseDTO dto) {
        // 1. Find the parent organization and trainer entities
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + orgId));

        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer (User) not found with id: " + trainerId));

        // 2. Map the DTO to a new Course entity
        Course newCourse = modelMapper.map(dto, Course.class);

        // 3. Set the relationships
        newCourse.setOrg(org);
        newCourse.setCreatedBy(trainer);

        // 4. Save the new course
        Course savedCourse = courseRepository.save(newCourse);

        // 5. Map the saved entity back to a DTO and return it
        return modelMapper.map(savedCourse, CourseDTO.class);
    }

    @Override
    public List<CourseDTO> listCourses(UUID orgId) {
        // 1. Find all courses for the given organization
        List<Course> courses = courseRepository.findByOrgId(orgId);

        // 2. Map the list of entities to a list of DTOs and return
        return courses.stream()
                .map(course -> modelMapper.map(course, CourseDTO.class))
                .collect(Collectors.toList());
    }
}