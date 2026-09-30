using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.CandidateOffer
{
    public class CandidateOfferResponseDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}