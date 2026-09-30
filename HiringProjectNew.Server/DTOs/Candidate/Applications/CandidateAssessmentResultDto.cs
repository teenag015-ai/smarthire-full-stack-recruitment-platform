namespace HiringProjectNew.Server.DTOs.Candidate.Assessments
{
    public class CandidateAssessmentResultDto
    {
        public int Id { get; set; }

        public int AssessmentId { get; set; }

        public string AssessmentTitle { get; set; } = string.Empty;

        public int TotalQuestions { get; set; }

        public int CorrectAnswers { get; set; }

        public int TotalMarks { get; set; }

        public int ObtainedMarks { get; set; }

        public decimal Percentage { get; set; }

        public bool IsPassed { get; set; }

        public DateTime StartedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public bool IsCompleted { get; set; }
    }
}