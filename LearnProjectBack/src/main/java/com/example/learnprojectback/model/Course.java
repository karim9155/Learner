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
public class Course {
    @Id
    @GeneratedValue
    private UUID id;
    @ManyToOne
    private Organization org;
    @ManyToOne
    private User createdBy;    // the trainer
    private String title;
    private String description;
    private Instant createdAt = Instant.now();

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Video> videos;

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Enrollment> enrollments;
}
