package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByOrgId(UUID orgId);

    @Query(value = "SELECT c.* FROM course c WHERE c.created_by_id = :trainerId", nativeQuery = true)
    List<Course> findByCreatedById(@Param("trainerId") UUID trainerId);
    @Query(value = "SELECT c.* FROM enrollment e JOIN course c ON e.course_id = c.id WHERE e.user_id = :userId;", nativeQuery = true)
    List<Course> findEnrolledCoursesByUserId(@Param("userId") UUID userId);
    @Query(value = "SELECT c.* FROM course c JOIN enrollment e ON c.id = e.course_id WHERE e.user_id = :userId", nativeQuery = true)
    List<Course> findByUserId(@Param("userId") UUID userId);

    List<Course> findAllByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    @Query(value = "SELECT c.* FROM course c WHERE c.created_by_id = :trainerId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))", nativeQuery = true)
    List<Course> findByCreatedByIdAndSearchTerm(@Param("trainerId") UUID trainerId, @Param("searchTerm") String searchTerm);
}