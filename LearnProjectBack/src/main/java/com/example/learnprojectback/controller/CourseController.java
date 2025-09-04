package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.dto.PublishCourseRequestDTO;
import com.example.learnprojectback.security.JwtUser;
import com.example.learnprojectback.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseDTO> create(@RequestPart("course") CourseDTO dto,
                                            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage,
                                            @AuthenticationPrincipal JwtUser auth) {
        CourseDTO createdCourse = courseService.createCourse(dto.getOrganizationId(), auth.getId(), dto, coverImage);
        return ResponseEntity.ok(createdCourse);
    }

    @GetMapping
    public List<CourseDTO> list(@AuthenticationPrincipal JwtUser auth) {
        // In a real application, we would get the orgId from the authenticated user
        UUID orgId = UUID.randomUUID(); // Placeholderl
        return courseService.listCourses(orgId);
    }

    @GetMapping("/all")
    public List<CourseDTO> getAllCourses(@RequestParam(required = false) String search) {
        return courseService.getAllCourses(search);
    }
    @GetMapping("/by-trainer/{trainerId}")
    public List<CourseDTO> getCoursesByTrainer(@PathVariable UUID trainerId, @RequestParam(required = false) String search) {
        return courseService.getCoursesByTrainer(trainerId, search);
    }

    @GetMapping("/by-user/{userId}")
    public List<CourseDTO> getCoursesByUser(@PathVariable UUID userId) {
        return courseService.getCoursesByUserId(userId);
    }

    @PostMapping("/publish")
    public ResponseEntity<CourseDTO> publishCourse(@RequestBody PublishCourseRequestDTO request) {
        CourseDTO publishedCourse = courseService.publishCourse(request);
        return ResponseEntity.ok(publishedCourse);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }
}
