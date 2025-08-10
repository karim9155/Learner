package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.UserCreationRequest;
import com.example.learnprojectback.dto.UserDTO;
import com.example.learnprojectback.model.Membership;
import com.example.learnprojectback.model.Organization;
import com.example.learnprojectback.model.Role;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.MembershipRepository;
import com.example.learnprojectback.repository.OrganizationRepository;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Transactional
    @Override
    public UserDTO createUser(UserCreationRequest userCreationRequest) {
        if (userRepository.findByEmail(userCreationRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(userCreationRequest.getName());
        user.setLastName(userCreationRequest.getLastName());
        user.setDepartment(userCreationRequest.getDepartment());
        user.setBadgeNumber(userCreationRequest.getBadgeNumber());
        user.setEmail(userCreationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userCreationRequest.getPassword()));
        user.setPhone(userCreationRequest.getPhone());

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
        membership.setRole(userCreationRequest.getRole());

        membershipRepository.save(membership);

        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    @Transactional
    public List<UserDTO> createUsersFromCsv(Reader reader) {
        try {
            CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.withHeader("name", "lastname", "departement", "email", "phone number", "badg number").withSkipHeaderRecord());
            List<User> users = new ArrayList<>();
            for (CSVRecord record : parser) {
                UserCreationRequest request = new UserCreationRequest();
                request.setName(record.get("name"));
                request.setLastName(record.get("lastname"));
                request.setDepartment(record.get("departement"));
                request.setEmail(record.get("email"));
                request.setPhone(record.get("phone number"));
                request.setBadgeNumber(record.get("badg number"));
                request.setPassword("password"); // Default password
                request.setRole(Role.EMPLOYEE);

                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                    // Skip if email already exists
                    continue;
                }

                User user = new User();
                user.setName(request.getName());
                user.setLastName(request.getLastName());
                user.setDepartment(request.getDepartment());
                user.setBadgeNumber(request.getBadgeNumber());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setPhone(request.getPhone());
                users.add(user);
            }
            userRepository.saveAll(users);
            return users.stream()
                    .map(user -> modelMapper.map(user, UserDTO.class))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file", e);
        }
    }
}
