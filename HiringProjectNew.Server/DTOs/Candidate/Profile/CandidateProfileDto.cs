namespace HiringProjectNew.Server.DTOs.Candidate.Profile
{
    public class CandidateProfileDto
    {
        public int Id { get; set; }

        public int CandidateId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string ProfessionalHeadline { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string About { get; set; } = string.Empty;

        public string Skills { get; set; } = string.Empty;

        public string Education { get; set; } = string.Empty;

        public string Experience { get; set; } = string.Empty;

        public string ResumeFileName { get; set; } = string.Empty;

        public string ResumeFilePath { get; set; } = string.Empty;

        public int ProfileCompletionPercentage { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}