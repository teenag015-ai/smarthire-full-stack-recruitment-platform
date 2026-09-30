using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Interviewer.Evaluation
{
    public class CreateInterviewEvaluationDto
    {
        [Required]
        public int InterviewId { get; set; }

        [Range(1, 5)]
        public int TechnicalSkills { get; set; }

        [Range(1, 5)]
        public int ProblemSolving { get; set; }

        [Range(1, 5)]
        public int Communication { get; set; }

        [Range(1, 5)]
        public int JobKnowledge { get; set; }

        [Range(1, 5)]
        public int OverallRating { get; set; }

        [MaxLength(2000)]
        public string Strengths { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Weaknesses { get; set; } = string.Empty;

        [MaxLength(3000)]
        public string Comments { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Recommendation { get; set; } = string.Empty;
    }
}