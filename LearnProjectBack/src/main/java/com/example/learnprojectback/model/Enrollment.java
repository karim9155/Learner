package com.example.learnprojectback.model;

import jakarta.persistence.*;
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
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private User learner;

    private Instant assignedAt = Instant.now();

    @ManyToOne
    @JoinColumn(name = "user_id") // This column in the 'enrollment' table links to the 'user' table
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
