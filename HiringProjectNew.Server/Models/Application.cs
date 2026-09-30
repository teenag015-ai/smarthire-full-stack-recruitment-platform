using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class Application
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CandidateId { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        [MaxLength(30)]
        public string CurrentStage { get; set; } = "Applied";

        [MaxLength(1000)]
        public string? CoverLetter { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;
    }
}