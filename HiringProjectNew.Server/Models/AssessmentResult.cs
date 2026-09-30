using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class AssessmentResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public int CandidateId { get; set; }

        public int TotalQuestions { get; set; }

        public int CorrectAnswers { get; set; }

        public int TotalMarks { get; set; }

        public int ObtainedMarks { get; set; }

        public decimal Percentage { get; set; }

        public bool IsPassed { get; set; }

        public DateTime StartedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public bool IsCompleted { get; set; } = false;
    }
}