package com.example.learnprojectback.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.UUID;

@Data
public class OrganizationDTO {
    private UUID id;
    private String name;
    private String domain;
    private JsonNode settings;
}
