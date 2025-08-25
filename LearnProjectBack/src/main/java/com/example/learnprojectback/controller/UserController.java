package com.example.learnprojectback.controller;

import com.example.learnprojectback.dto.*;
import com.example.learnprojectback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Pageable;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserCreationRequest userCreationRequest) {
        return ResponseEntity.ok(userService.createUser(userCreationRequest));
    }

    @PostMapping("/upload")
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
    @GetMapping("/employees")
    public Page<UserDTO> getEmployees(Pageable pageable, @RequestParam(required = false) String search) {
        return userService.getEmployees(pageable, search);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable UUID userId, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(userId, userDTO));
    }
    @PostMapping("/learner/send-code")
    public ResponseEntity<Void> sendCode(@RequestBody SendCodeRequest request) {
        userService.sendVerificationCode(request.getPhone());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/learner/verify-code")
    public ResponseEntity<LearnerCourseInfoDTO> verifyCode(@RequestBody VerifyCodeRequest request) {
        return ResponseEntity.ok(userService.verifyCode(request.getPhone(), request.getCode()));
    }
}
