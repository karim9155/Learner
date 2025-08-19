package com.example.learnprojectback.repository;

import com.example.learnprojectback.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    List<User> findAllByEmailIn(List<String> emails); // Add this method
    List<User> findByEmailContainingIgnoreCase(String email);
    Optional<User> findByPhone(String phone); // Add this line

}