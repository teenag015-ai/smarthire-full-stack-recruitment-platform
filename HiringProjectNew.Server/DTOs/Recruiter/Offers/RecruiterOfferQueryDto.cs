namespace HiringProjectNew.Server.DTOs.Recruiter.Offers
{
    public class RecruiterOfferQueryDto
    {
        public string? Search { get; set; }

        public string? Status { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}