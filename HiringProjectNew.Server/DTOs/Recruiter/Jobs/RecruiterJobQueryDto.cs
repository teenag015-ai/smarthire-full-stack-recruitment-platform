namespace HiringProjectNew.Server.DTOs.Recruiter.Jobs
{
    public class RecruiterJobQueryDto
    {
        public string? Search { get; set; }

        public int? DepartmentId { get; set; }

        public int? JobCategoryId { get; set; }

        public string? EmploymentType { get; set; }

        public bool? IsActive { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}