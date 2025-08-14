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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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

    @Async // This annotation makes the method run in a background thread
    @Override
    @Transactional
    public List<UserDTO> createUsersFromCsv(Reader reader) {
        try {
            CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.withHeader("name", "lastname", "departement", "email", "phone number", "badg number").withSkipHeaderRecord());
            List<CSVRecord> records = StreamSupport.stream(parser.spliterator(), false).collect(Collectors.toList());

            // 1. Get all emails from the CSV
            Set<String> emailsInCsv = records.stream()
                    .map(record -> record.get("email"))
                    .collect(Collectors.toSet());

            // 2. Find which of those emails already exist in the database in a single query
            Set<String> existingEmails = userRepository.findAllByEmailIn(new ArrayList<>(emailsInCsv)).stream()
                    .map(User::getEmail)
                    .collect(Collectors.toSet());

            List<User> usersToCreate = new ArrayList<>();
            List<Membership> membershipsToCreate = new ArrayList<>();

            // Find or create the default organization
            Organization organization = organizationRepository.findByName("Default Organization")
                    .orElseGet(() -> {
                        Organization newOrg = new Organization();
                        newOrg.setName("Default Organization");
                        return organizationRepository.save(newOrg);
                    });

            for (CSVRecord record : records) {
                String email = record.get("email");
                // 3. Skip records for users that already exist
                if (existingEmails.contains(email)) {
                    continue;
                }

                User user = new User();
                user.setName(record.get("name"));
                user.setLastName(record.get("lastname"));
                user.setDepartment(record.get("departement"));
                user.setEmail(email);
                user.setPhone(record.get("phone number"));
                user.setBadgeNumber(record.get("badg number"));
                user.setPassword(passwordEncoder.encode("password")); // Default password
                usersToCreate.add(user);

                Membership membership = new Membership();
                membership.setUser(user);
                membership.setOrganization(organization);
                membership.setRole(Role.EMPLOYEE);
                membershipsToCreate.add(membership);
            }

            // 4. Save the new users and memberships in batches
            List<User> savedUsers = userRepository.saveAll(usersToCreate);
            membershipRepository.saveAll(membershipsToCreate);

            return savedUsers.stream()
                    .map(user -> modelMapper.map(user, UserDTO.class))
                    .collect(Collectors.toList());

        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file", e);
        }
    }
    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getEmployees(Pageable pageable, String search) {
        List<Membership> memberships = membershipRepository.findAll().stream()
                .filter(m -> m.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());

        List<User> employees = memberships.stream().map(Membership::getUser).collect(Collectors.toList());

        if (search != null && !search.isEmpty()) {
            employees = employees.stream()
                    .filter(user -> user.getName().toLowerCase().contains(search.toLowerCase()) ||
                            user.getEmail().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList());
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), employees.size());

        List<UserDTO> pageContent = employees.subList(start, end).stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, employees.size());
    }


    @Override
    @Transactional
    public void deleteUser(UUID userId) {
        userRepository.deleteById(userId);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UUID userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userDTO.getName());
        user.setLastName(userDTO.getLastName());
        user.setDepartment(userDTO.getDepartment());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setActive(userDTO.isActive());

        User updatedUser = userRepository.save(user);
        return modelMapper.map(updatedUser, UserDTO.class);
    }
}