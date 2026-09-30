namespace HiringProjectNew.Server.DTOs.Candidate.Assessments
{
    public class CandidateAssessmentDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public int DurationMinutes { get; set; }

        public int PassingScore { get; set; }

        public int TotalQuestions { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}