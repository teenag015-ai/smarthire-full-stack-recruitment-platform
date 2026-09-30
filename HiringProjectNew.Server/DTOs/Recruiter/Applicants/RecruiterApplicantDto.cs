namespace HiringProjectNew.Server.DTOs.Recruiter.Applicants
{
    public class RecruiterApplicantDto
    {
        public int ApplicationId { get; set; }

        public int CandidateId { get; set; }

        public string CandidateName { get; set; } = string.Empty;

        public string CandidateEmail { get; set; } = string.Empty;

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public string CurrentStage { get; set; } = string.Empty;

        public string? CoverLetter { get; set; }

        public DateTime AppliedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; }
    }
}