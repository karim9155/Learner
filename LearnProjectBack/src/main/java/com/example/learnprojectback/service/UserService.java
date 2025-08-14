package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.UserCreationRequest;
import com.example.learnprojectback.dto.UserDTO;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;
import java.io.Reader;
import java.util.List;
import java.util.UUID;

public interface UserService {
    UserDTO createUser(UserCreationRequest userCreationRequest);
    List<UserDTO> createUsersFromCsv(Reader reader);
    Page<UserDTO> getEmployees(Pageable pageable, String search);
    void deleteUser(UUID userId);
    UserDTO updateUser(UUID userId, UserDTO userDTO);
}
