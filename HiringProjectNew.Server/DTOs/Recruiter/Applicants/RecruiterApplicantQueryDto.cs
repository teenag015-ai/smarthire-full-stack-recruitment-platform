namespace HiringProjectNew.Server.DTOs.Recruiter.Applicants
{
    public class RecruiterApplicantQueryDto
    {
        public string? Search { get; set; }

        public int? JobId { get; set; }

        public string? CurrentStage { get; set; }

        public bool? IsActive { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}