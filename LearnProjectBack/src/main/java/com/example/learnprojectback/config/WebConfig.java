package com.example.learnprojectback.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // The URL path the browser will request (e.g., /uploads/image.png)
        String resourceHandlerPath = "/uploads/**";

        // The absolute file system path INSIDE the Docker container where files are stored.
        // The WORKDIR in your Dockerfile is /app, so the full path is /app/uploads/.
        String resourceLocation = "file:/app/uploads/";

        registry.addResourceHandler(resourceHandlerPath)
                .addResourceLocations(resourceLocation);
    }
}
