// Create a new file: karim9155/learner/Learner-6bb22e8d279db03baeab60b29e20ac5e0c7c258b/LearnProjectBack/src/main/java/com/example/learnprojectback/dto/BatchEnrollmentRequest.java

package com.example.learnprojectback.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class BatchEnrollmentRequest {
    private UUID courseId;
    private List<UUID> learnerIds;
}