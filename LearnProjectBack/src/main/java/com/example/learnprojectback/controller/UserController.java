package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.UserCreationRequest;
import com.example.learnprojectback.dto.UserDTO;
import com.example.learnprojectback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserCreationRequest userCreationRequest) {
        return ResponseEntity.ok(userService.createUser(userCreationRequest));
    }

    @PostMapping("/users/upload")
    public ResponseEntity<List<UserDTO>> uploadUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            List<UserDTO> createdUsers = userService.createUsersFromCsv(reader);
            return ResponseEntity.ok(createdUsers);
        } catch (IOException e) {
            // Handle exception
            return ResponseEntity.status(500).build();
        }
    }
}
