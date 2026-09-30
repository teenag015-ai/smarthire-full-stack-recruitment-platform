namespace HiringProjectNew.Server.DTOs.CandidateOffer
{
    public class CandidateOfferDto
    {
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public decimal OfferedSalary { get; set; }

        public DateTime JoiningDate { get; set; }

        public DateTime OfferExpiryDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public string Benefits { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime? SentAt { get; set; }

        public DateTime? RespondedAt { get; set; }
    }
}