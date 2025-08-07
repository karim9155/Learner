package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.Membership;
import com.example.learnprojectback.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    List<Membership> findByUser(User user);
}
