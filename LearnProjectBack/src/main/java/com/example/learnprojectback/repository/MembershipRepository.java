package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MembershipRepository extends JpaRepository<Membership, UUID> {
}
