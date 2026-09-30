using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Candidate.Applications
{
    public class CreateApplicationDto
    {
        [Required]
        public int JobId { get; set; }

        [MaxLength(1000)]
        public string? CoverLetter { get; set; }
    }
}