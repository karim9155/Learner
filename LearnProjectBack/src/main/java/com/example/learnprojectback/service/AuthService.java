package com.example.learnprojectback.service;

import com.example.learnprojectback.dto.RegistrationRequest;
import com.example.learnprojectback.dto.RegistrationResponse;

public interface AuthService {
    RegistrationResponse register(RegistrationRequest registrationRequest);
}
