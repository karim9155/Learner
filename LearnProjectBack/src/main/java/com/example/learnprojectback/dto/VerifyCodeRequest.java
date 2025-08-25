package com.example.learnprojectback.dto;

import lombok.Data;

@Data
public class VerifyCodeRequest {
    private String phone;
    private String code;
}
