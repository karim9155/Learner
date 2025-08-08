package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.RegistrationRequest;
import com.example.learnprojectback.dto.RegistrationResponse;
import com.example.learnprojectback.model.Membership;
import com.example.learnprojectback.model.Organization;
import com.example.learnprojectback.model.Role;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.MembershipRepository;
import com.example.learnprojectback.repository.OrganizationRepository;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, OrganizationRepository organizationRepository, MembershipRepository membershipRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
    }

    @Transactional
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
        user.setActive(true);

        user = userRepository.save(user);

        Organization organization = organizationRepository.findByName("Default Organization")
                .orElseGet(() -> {
                    Organization newOrg = new Organization();
                    newOrg.setName("Default Organization");
                    return organizationRepository.save(newOrg);
                });

        Membership membership = new Membership();
        membership.setUser(user);
        membership.setOrganization(organization);
        membership.setRole(Role.ADMIN);

        membershipRepository.save(membership);

        return new RegistrationResponse(user.getId(), "User registered successfully");
    }
}
