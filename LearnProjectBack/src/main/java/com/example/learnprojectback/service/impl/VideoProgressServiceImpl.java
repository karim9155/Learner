package com.example.learnprojectback.service.impl;

import com.example.learnprojectback.dto.ProgressReportDTO;
import com.example.learnprojectback.dto.VideoProgressDTO;
import com.example.learnprojectback.model.User;
import com.example.learnprojectback.model.Video;
import com.example.learnprojectback.model.VideoProgress;
import com.example.learnprojectback.repository.UserRepository;
import com.example.learnprojectback.repository.VideoProgressRepository;
import com.example.learnprojectback.repository.VideoRepository;
import com.example.learnprojectback.service.VideoProgressService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoProgressServiceImpl implements VideoProgressService {

    private final VideoProgressRepository videoProgressRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final ModelMapper modelMapper;

    public VideoProgressServiceImpl(VideoProgressRepository videoProgressRepository, UserRepository userRepository, VideoRepository videoRepository, ModelMapper modelMapper) {
        this.videoProgressRepository = videoProgressRepository;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public VideoProgressDTO updateProgress(VideoProgressDTO dto) {
        User learner = userRepository.findById(dto.getLearnerId())
                .orElseThrow(() -> new RuntimeException("Learner not found"));
        Video video = videoRepository.findById(dto.getVideoId())
                .orElseThrow(() -> new RuntimeException("Video not found"));

        VideoProgress videoProgress = new VideoProgress();
        videoProgress.setLearner(learner);
        videoProgress.setVideo(video);
        videoProgress.setWatchedPercent(dto.getWatchedPercent());

        videoProgress = videoProgressRepository.save(videoProgress);
        return modelMapper.map(videoProgress, VideoProgressDTO.class);
    }

    @Override
    public List<ProgressReportDTO> getProgressReport(UUID courseId) {
        // This is a simplified implementation. A more complex implementation would
        // involve aggregating progress for all videos in a course.
        return videoProgressRepository.findAll().stream()
                .filter(vp -> vp.getVideo().getCourse().getId().equals(courseId))
                .map(vp -> {
                    ProgressReportDTO reportDTO = new ProgressReportDTO();
                    reportDTO.setCourseId(courseId);
                    reportDTO.setLearnerId(vp.getLearner().getId());
                    // This is a simplified progress calculation.
                    reportDTO.setProgress(vp.getWatchedPercent());
                    return reportDTO;
                })
                .collect(Collectors.toList());
    }
}
