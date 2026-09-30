namespace HiringProjectNew.Server.DTOs.Recruiter.Applicants
{
    public class RecruiterApplicantListDto
    {
        public List<RecruiterApplicantDto> Applicants { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}