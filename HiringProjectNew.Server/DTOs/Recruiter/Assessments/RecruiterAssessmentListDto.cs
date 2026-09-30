namespace HiringProjectNew.Server.DTOs.Recruiter.Assessments
{
    public class RecruiterAssessmentListDto
    {
        public List<RecruiterAssessmentDto> Assessments { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}