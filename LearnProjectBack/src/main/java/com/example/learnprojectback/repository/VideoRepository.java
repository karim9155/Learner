package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VideoRepository extends JpaRepository<Video, UUID> {
    List<Video> findAllByUserId(UUID userId);
    List<Video> findAllByCourseId(UUID courseId); // Add this line
}