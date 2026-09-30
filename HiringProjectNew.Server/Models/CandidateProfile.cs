using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class CandidateProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CandidateId { get; set; }

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(150)]
        public string ProfessionalHeadline { get; set; } = string.Empty;

        [MaxLength(150)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string About { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Skills { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Education { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Experience { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ResumeFileName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string ResumeFilePath { get; set; } = string.Empty;

        public int ProfileCompletionPercentage { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}