package com.example.learnprojectback.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Organization {
    @Id
    @GeneratedValue
    private UUID id;
    private String name;
    private String domain;
    @Column(columnDefinition = "jsonb")
    @Type(JsonBinaryType.class)
    private JsonNode settings;
    private Instant createdAt = Instant.now();

    @JsonIgnore
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Membership> memberships;

    @JsonIgnore
    @OneToMany(mappedBy = "org", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Course> courses;
}
