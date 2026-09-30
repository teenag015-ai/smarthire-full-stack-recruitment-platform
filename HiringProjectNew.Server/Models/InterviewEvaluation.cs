using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class InterviewEvaluation
    {
        [Key]
        public int Id { get; set; }

        // =========================================================
        // INTERVIEW
        // =========================================================

        [Required]
        public int InterviewId { get; set; }


        // =========================================================
        // INTERVIEWER
        // =========================================================

        [Required]
        public int InterviewerId { get; set; }


        // =========================================================
        // RATINGS
        // =========================================================

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


        // =========================================================
        // FEEDBACK
        // =========================================================

        [MaxLength(2000)]
        public string Strengths { get; set; } = string.Empty;


        [MaxLength(2000)]
        public string Weaknesses { get; set; } = string.Empty;


        [MaxLength(3000)]
        public string Comments { get; set; } = string.Empty;


        // =========================================================
        // RECOMMENDATION
        // =========================================================

        [Required]
        [MaxLength(30)]
        public string Recommendation { get; set; } = string.Empty;


        // =========================================================
        // TIMESTAMPS
        // =========================================================

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;


        public DateTime? UpdatedAt { get; set; }
    }
}