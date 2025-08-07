package com.example.learnprojectback.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VideoProgress {
    @Id
    @GeneratedValue
    private UUID id;
    @ManyToOne
    private User learner;
    @ManyToOne
    private Video video;
    private int watchedPercent;   // 0–100
    private Instant lastWatchedAt = Instant.now();
}
