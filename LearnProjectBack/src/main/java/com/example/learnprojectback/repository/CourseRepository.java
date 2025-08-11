package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByOrgId(UUID orgId);
    @Query(value = "SELECT c.* FROM course c WHERE c.created_by_id = :trainerId", nativeQuery = true)
    List<Course> findByCreatedById(@Param("trainerId") UUID trainerId);
}