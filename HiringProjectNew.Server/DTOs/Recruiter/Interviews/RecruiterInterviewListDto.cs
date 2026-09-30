namespace HiringProjectNew.Server.DTOs.Recruiter.Interviews
{
    public class RecruiterInterviewListDto
    {
        public List<RecruiterInterviewDto> Interviews { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}