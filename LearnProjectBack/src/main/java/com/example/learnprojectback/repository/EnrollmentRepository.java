package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findAllByUser_Id(UUID userId);
}
