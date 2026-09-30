using System;

namespace HiringProjectNew.Server.DTOs.Interviewer.Evaluation
{
    public class InterviewEvaluationDto
    {
        public int Id { get; set; }

        public int InterviewId { get; set; }

        public int InterviewerId { get; set; }

        public int CandidateId { get; set; }

        public string CandidateName { get; set; } = string.Empty;

        public string CandidateEmail { get; set; } = string.Empty;

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public string InterviewType { get; set; } = string.Empty;

        public DateTime ScheduledAt { get; set; }

        public string InterviewStatus { get; set; } = string.Empty;

        public int TechnicalSkills { get; set; }

        public int ProblemSolving { get; set; }

        public int Communication { get; set; }

        public int JobKnowledge { get; set; }

        public int OverallRating { get; set; }

        public string Strengths { get; set; } = string.Empty;

        public string Weaknesses { get; set; } = string.Empty;

        public string Comments { get; set; } = string.Empty;

        public string Recommendation { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}