namespace HiringProjectNew.Server.DTOs.Recruiter.Jobs
{
    public class RecruiterJobListDto
    {
        public List<RecruiterJobDto> Jobs { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}