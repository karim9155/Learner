package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.EnrollmentDTO;
import com.example.learnprojectback.service.EnrollmentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public EnrollmentDTO assign(@RequestBody EnrollmentDTO dto) {
        return enrollmentService.assignLearner(dto);
    }
}
