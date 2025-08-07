package com.example.learnprojectback.controller;

import com.example.learnprojectback.model.Organization;
import com.example.learnprojectback.repository.OrganizationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    /**
     * POST /api/organizations : Create a new organization.
     */
    @PostMapping
    public ResponseEntity<Organization> createOrganization(@RequestBody Organization organization) {
        Organization savedOrganization = organizationRepository.save(organization);
        return ResponseEntity.ok(savedOrganization);
    }

    /**
     * GET /api/organizations : Get a list of all organizations.
     */
    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();
        return ResponseEntity.ok(organizations);
    }

    /**
     * GET /api/organizations/{id} : Get a single organization by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable UUID id) {
        // Find the organization by ID and return it, or return a 404 Not Found status
        return organizationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/organizations/{id} : Update an existing organization.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Organization> updateOrganization(@PathVariable UUID id, @RequestBody Organization organizationDetails) {
        return organizationRepository.findById(id)
                .map(existingOrganization -> {
                    // Update the fields of the existing organization
                    existingOrganization.setName(organizationDetails.getName());
                    existingOrganization.setDomain(organizationDetails.getDomain());
                    existingOrganization.setSettings(organizationDetails.getSettings());
                    // Save the updated organization to the database
                    Organization updatedOrganization = organizationRepository.save(existingOrganization);
                    return ResponseEntity.ok(updatedOrganization);
                })
                // If the organization is not found, return a 404 Not Found status
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/organizations/{id} : Delete an organization by its ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteOrganization(@PathVariable UUID id) {
        return organizationRepository.findById(id)
                .map(organization -> {
                    // If found, delete the organization
                    organizationRepository.delete(organization);
                    // Return a 204 No Content status to indicate success
                    return ResponseEntity.noContent().build();
                })
                // If the organization is not found, return a 404 Not Found status
                .orElse(ResponseEntity.notFound().build());
    }
}