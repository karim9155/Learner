package com.example.learnprojectback.security;

import com.example.learnprojectback.model.Membership;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.repository.MembershipRepository;
import com.example.learnprojectback.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    public CustomUserDetailsService(UserRepository userRepository, MembershipRepository membershipRepository) {
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<Membership> memberships = membershipRepository.findByUser(user);
        Collection<? extends GrantedAuthority> authorities = memberships.stream()
                .map(membership -> new SimpleGrantedAuthority(membership.getRole().name()))
                .collect(Collectors.toList());

        return new JwtUser(user.getId(), user.getEmail(), user.getPassword(), authorities);
    }
}
