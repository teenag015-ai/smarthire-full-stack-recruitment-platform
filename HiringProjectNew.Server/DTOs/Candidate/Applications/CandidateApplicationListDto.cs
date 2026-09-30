namespace HiringProjectNew.Server.DTOs.Candidate.Applications
{
    public class CandidateApplicationListDto
    {
        public int ApplicationId { get; set; }

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;

        public string JobCategoryName { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string EmploymentType { get; set; } = string.Empty;

        public string ExperienceLevel { get; set; } = string.Empty;

        public decimal? MinimumSalary { get; set; }

        public decimal? MaximumSalary { get; set; }

        public string CurrentStage { get; set; } = string.Empty;

        public string? CoverLetter { get; set; }

        public DateTime AppliedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; }

        public DateTime ApplicationDeadline { get; set; }
    }
}