package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.*;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.security.JwtUtil;
import com.example.learnprojectback.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final UserRepository userRepository; // <-- Add this


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // Authenticate the user (this part is correct)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        // Fetch the full User entity from your database
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow();

        // Generate the JWT
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        // Map the User entity to your existing UserDTO
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        // Assuming your User entity has a corresponding isActive() or getActive() method
        userDTO.setActive(user.isActive());

        // Create the final response object with both the JWT and the user DTO
        return ResponseEntity.ok(new LoginResponse(jwt, userDTO));
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest registrationRequest) {
        return ResponseEntity.ok(authService.register(registrationRequest));
    }
}
