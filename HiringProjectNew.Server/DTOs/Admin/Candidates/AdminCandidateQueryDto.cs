namespace HiringProjectNew.Server.DTOs.Admin.Candidates
{
    public class AdminCandidateQueryDto
    {
        public string? Search { get; set; }

        public bool? IsActive { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}