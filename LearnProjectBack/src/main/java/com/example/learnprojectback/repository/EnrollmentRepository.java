package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Course;
import com.example.learnprojectback.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findAllByUser_Id(UUID userId);
    // REPLACE the old method with this corrected one
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course c JOIN FETCH c.createdBy WHERE e.user.id = :userId")
    List<Enrollment> findByUser_Id(UUID userId);
    @Query("SELECT DISTINCT e.course FROM Enrollment e " +
            "JOIN FETCH e.course.createdBy " +
            "LEFT JOIN FETCH e.course.org " + // Use LEFT JOIN in case org is optional
            "WHERE e.user.id = :userId")
    List<Course> findCoursesByAdminEnrollments(UUID userId);
}
