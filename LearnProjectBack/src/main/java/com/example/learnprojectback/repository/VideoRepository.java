package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VideoRepository extends JpaRepository<Video, UUID> {
}
