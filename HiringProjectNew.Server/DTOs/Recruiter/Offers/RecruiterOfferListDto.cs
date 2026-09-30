namespace HiringProjectNew.Server.DTOs.Recruiter.Offers
{
    public class RecruiterOfferListDto
    {
        public List<RecruiterOfferDto> Offers { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}