package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.UserCreationRequest;
import com.example.learnprojectback.dto.UserDTO;

public interface UserService {
    UserDTO createUser(UserCreationRequest userCreationRequest);
}
