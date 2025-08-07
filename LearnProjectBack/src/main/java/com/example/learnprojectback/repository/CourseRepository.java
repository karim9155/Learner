package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByOrgId(UUID orgId);
}
