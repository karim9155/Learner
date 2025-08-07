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
public class Membership {
    @Id
    @GeneratedValue
    private UUID id;
    @ManyToOne
    private Organization organization;
    @ManyToOne
    private User user;
    @Enumerated(EnumType.STRING)
    private Role role;
    private Instant createdAt = Instant.now();
}
