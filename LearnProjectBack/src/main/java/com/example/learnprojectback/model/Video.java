package com.example.learnprojectback.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Video {
    @Id
    @GeneratedValue
    private UUID id;
    @ManyToOne
    private Course course;
    @ManyToOne
    private User user;
    private String title;
    private String youtubeUrl;     // or file path
    @Column(nullable = true)
    private Integer durationSeconds;
    @Column(nullable = true)
    private Integer orderIndex;
    private Instant createdAt = Instant.now();

    @JsonIgnore
    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VideoProgress> videoProgresses;
}
