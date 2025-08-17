// karim9155/learner/Learner-6bb22e8d279db03baeab60b29e20ac5e0c7c258b/LearnProjectBack/src/main/java/com/example/learnprojectback/service/EnrollmentService.java

package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.BatchEnrollmentRequest;
import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.dto.EnrollmentDTO;

import java.util.List;
import java.util.UUID;

public interface EnrollmentService {
    EnrollmentDTO assignLearner(EnrollmentDTO dto, UUID adminId);

    List<EnrollmentDTO> assignLearnersToCourse(BatchEnrollmentRequest request, UUID adminId);
    List<CourseDTO> getCoursesEnrolledByAdmin(UUID adminId);

}