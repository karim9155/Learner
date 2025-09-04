package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.model.*;
import com.example.learnprojectback.repository.CourseRepository;
import com.example.learnprojectback.repository.OrganizationRepository;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.service.CourseService;
import com.example.learnprojectback.service.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import com.example.learnprojectback.dto.PublishCourseRequestDTO;
import com.example.learnprojectback.repository.QuizRepository;
import com.example.learnprojectback.security.JwtUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final ModelMapper modelMapper;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public CourseDTO publishCourse(PublishCourseRequestDTO request) {
        JwtUser jwtUser = (JwtUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findById(jwtUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // FIX: Get the organization through the user's membership
        Organization userOrg = currentUser.getMemberships().stream()
                .findFirst() // Assumes the user has at least one membership
                .map(Membership::getOrganization)
                .orElseThrow(() -> new EntityNotFoundException("User is not part of any organization"));

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCreatedBy(currentUser);
        course.setOrg(userOrg); // Use the organization found via membership

        List<Video> videoEntities = new ArrayList<>();
        for (PublishCourseRequestDTO.VideoData videoData : request.getVideos()) {
            Video video = new Video();
            video.setTitle(videoData.getTitle());
            video.setYoutubeUrl(videoData.getYoutubeUrl());
            video.setCourse(course);
            video.setUser(currentUser);

            if (videoData.getQuiz() != null) {
                Quiz quiz = new Quiz();
                quiz.setQuestion(videoData.getQuiz().getQuestion());
                quiz.setOptions(videoData.getQuiz().getOptions());
                quiz.setCorrectAnswer(videoData.getQuiz().getCorrectAnswer());
                video.setQuiz(quiz);
            }
            videoEntities.add(video);
        }
        course.setVideos(videoEntities);

        Course savedCourse = courseRepository.save(course);
        return convertToDto(savedCourse);
    }
    @Override
    public CourseDTO createCourse(UUID orgId, UUID trainerId, CourseDTO dto, MultipartFile coverImage) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer (User) not found with id: " + trainerId));

        Course newCourse = modelMapper.map(dto, Course.class);
        newCourse.setCreatedBy(trainer);

        if (orgId != null) {
            Organization org = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + orgId));
            newCourse.setOrg(org);
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            String coverImageName = fileStorageService.store(coverImage);
            newCourse.setCoverImage(coverImageName);
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
    public List<CourseDTO> getAllCourses(String search) {
        List<Course> courses;
        if (search != null && !search.isEmpty()) {
            courses = courseRepository.findAllByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search);
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream()
                .map(this::convertToDto) // Use the robust conversion method here as well
                .collect(Collectors.toList());
    }

    private CourseDTO convertToDto(Course course) {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setId(course.getId());
        courseDTO.setTitle(course.getTitle());
        courseDTO.setDescription(course.getDescription());
        courseDTO.setCoverImage(course.getCoverImage());

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
    public List<CourseDTO> getCoursesByTrainer(UUID trainerId, String search) {
        List<Course> courses;
        if (search != null && !search.isEmpty()) {
            courses = courseRepository.findByCreatedByIdAndSearchTerm(trainerId, search);
        } else {
            courses = courseRepository.findByCreatedById(trainerId);
        }
        return courses.stream()
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