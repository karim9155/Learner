package com.example.learnprojectback.util;

import com.example.learnprojectback.dto.CourseDTO;
import com.example.learnprojectback.model.Course;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        // This safety check is still required to prevent the final mapping error.
        modelMapper.createTypeMap(Course.class, CourseDTO.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getCreatedBy() != null ? src.getCreatedBy().getId() : null, CourseDTO::setTrainerId);
                    mapper.map(src -> src.getCreatedBy() != null ? src.getCreatedBy().getEmail() : null, CourseDTO::setTrainerEmail);
                    mapper.map(src -> src.getOrg() != null ? src.getOrg().getId() : null, CourseDTO::setOrganizationId);
                });


        return modelMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}