namespace HiringProjectNew.Server.DTOs.Recruiter.Jobs
{
    public class RecruiterJobDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public int JobCategoryId { get; set; }

        public string JobCategoryName { get; set; } = string.Empty;

        public int RecruiterId { get; set; }

        public string RecruiterName { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string EmploymentType { get; set; } = string.Empty;

        public string ExperienceLevel { get; set; } = string.Empty;

        public decimal? MinimumSalary { get; set; }

        public decimal? MaximumSalary { get; set; }

        public string RequiredSkills { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Responsibilities { get; set; } = string.Empty;

        public string Requirements { get; set; } = string.Empty;

        public DateTime ApplicationDeadline { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}