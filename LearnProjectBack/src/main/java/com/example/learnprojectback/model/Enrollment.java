// karim9155/learner/Learner-6bb22e8d279db03baeab60b29e20ac5e0c7c258b/LearnProjectBack/src/main/java/com/example/learnprojectback/model/Enrollment.java

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
    @JoinColumn(name = "learner_id") // The user being enrolled (employee)
    private User learner;

    @ManyToOne
    @JoinColumn(name = "user_id") // The user performing the enrollment (admin)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private Instant assignedAt = Instant.now();
}