package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VideoProgressRepository extends JpaRepository<VideoProgress, UUID> {
}
