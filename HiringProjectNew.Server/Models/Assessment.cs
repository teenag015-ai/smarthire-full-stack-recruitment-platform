using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class Assessment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int JobId { get; set; }

        [Required]
        public int RecruiterId { get; set; }

        [Range(1, 300)]
        public int DurationMinutes { get; set; } = 30;

        [Range(0, 100)]
        public int PassingScore { get; set; } = 60;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}