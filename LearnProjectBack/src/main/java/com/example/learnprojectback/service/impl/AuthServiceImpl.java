package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.RegistrationRequest;
import com.example.learnprojectback.dto.RegistrationResponse;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public RegistrationResponse register(RegistrationRequest registrationRequest) {
        if (userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(registrationRequest.getName());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setPhone(registrationRequest.getPhone());

        user = userRepository.save(user);

        return new RegistrationResponse(user.getId(), "User registered successfully");
    }
}
