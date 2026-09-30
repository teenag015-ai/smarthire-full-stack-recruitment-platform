namespace HiringProjectNew.Server.DTOs.Recruiter.Assessments
{
    public class RecruiterAssessmentDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public int RecruiterId { get; set; }

        public string RecruiterName { get; set; } = string.Empty;

        public int DurationMinutes { get; set; }

        public int PassingScore { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}