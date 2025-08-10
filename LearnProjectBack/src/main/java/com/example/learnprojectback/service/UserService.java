package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.UserCreationRequest;
import com.example.learnprojectback.dto.UserDTO;

import java.io.Reader;
import java.util.List;

public interface UserService {
    UserDTO createUser(UserCreationRequest userCreationRequest);
    List<UserDTO> createUsersFromCsv(Reader reader);
}
