using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Recruiter.Offers
{
    public class EditOfferDto
    {
        [Required]
        [MaxLength(150)]
        public string Designation { get; set; } = string.Empty;

        [Range(1, 999999999)]
        public decimal OfferedSalary { get; set; }

        [Required]
        public DateTime JoiningDate { get; set; }

        [Required]
        public DateTime OfferExpiryDate { get; set; }

        [MaxLength(2000)]
        public string Benefits { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Notes { get; set; } = string.Empty;
    }
}