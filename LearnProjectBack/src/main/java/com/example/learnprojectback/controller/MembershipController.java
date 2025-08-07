package com.example.learnprojectback.controller;

import com.example.learnprojectback.model.Membership;
import com.example.learnprojectback.repository.MembershipRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipRepository membershipRepository;

    public MembershipController(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    @PostMapping
    public ResponseEntity<Membership> createMembership(@RequestBody Membership membership) {
        Membership savedMembership = membershipRepository.save(membership);
        return ResponseEntity.ok(savedMembership);
    }
}
