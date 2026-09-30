using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class Offer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ApplicationId { get; set; }

        [Required]
        public int CandidateId { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        public int RecruiterId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Designation { get; set; } = string.Empty;

        [Range(0, 999999999)]
        public decimal OfferedSalary { get; set; }

        public DateTime JoiningDate { get; set; }

        public DateTime OfferExpiryDate { get; set; }

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Draft";

        [MaxLength(2000)]
        public string Benefits { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? SentAt { get; set; }

        public DateTime? RespondedAt { get; set; }
    }
}