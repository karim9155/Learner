// karim9155/learner/Learner-6bb22e8d279db03baeab60b29e20ac5e0c7c258b/LearnProjectBack/src/main/java/com/example/learnprojectback/controller/EnrollmentController.java

package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.BatchEnrollmentRequest;
import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.dto.EnrollmentDTO;
import com.example.learnprojectback.security.JwtUser;
import com.example.learnprojectback.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public EnrollmentDTO assign(@RequestBody EnrollmentDTO dto, @AuthenticationPrincipal JwtUser currentUser) {
        UUID adminId = currentUser.getId();
        return enrollmentService.assignLearner(dto, adminId);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<EnrollmentDTO>> assignBatch(@RequestBody BatchEnrollmentRequest request, @AuthenticationPrincipal JwtUser currentUser) {
        UUID adminId = currentUser.getId();
        List<EnrollmentDTO> enrollments = enrollmentService.assignLearnersToCourse(request, adminId);
        return ResponseEntity.ok(enrollments);
    }
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByAdmin(@PathVariable UUID adminId) {
        List<CourseDTO> courses = enrollmentService.getCoursesEnrolledByAdmin(adminId);
        return ResponseEntity.ok(courses);
    }
}