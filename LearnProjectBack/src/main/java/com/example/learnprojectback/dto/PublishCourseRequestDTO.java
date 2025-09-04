package com.example.learnprojectback.dto;

import java.util.List;

public class PublishCourseRequestDTO {

    private String title;
    private String description;
    private List<VideoData> videos;

    public static class VideoData {
        private String title;
        private String youtubeUrl;
        private QuizData quiz;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getYoutubeUrl() { return youtubeUrl; }
        public void setYoutubeUrl(String youtubeUrl) { this.youtubeUrl = youtubeUrl; }
        public QuizData getQuiz() { return quiz; }
        public void setQuiz(QuizData quiz) { this.quiz = quiz; }
    }

    public static class QuizData {
        private String question;
        private List<String> options;
        private int correctAnswer;

        // Getters and Setters
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public int getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(int correctAnswer) { this.correctAnswer = correctAnswer; }
    }

    // Getters and Setters for PublishCourseRequestDTO
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<VideoData> getVideos() { return videos; }
    public void setVideos(List<VideoData> videos) { this.videos = videos; }
}
