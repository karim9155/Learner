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
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private UUID id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    private String phone;
    private boolean active = true;
    private Instant createdAt = Instant.now();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Membership> memberships;

    @JsonIgnore
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Course> createdCourses;

    @JsonIgnore
    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Enrollment> enrollments;

    @JsonIgnore
    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VideoProgress> videoProgresses;
}
