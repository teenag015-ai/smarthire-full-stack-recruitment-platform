using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class Interview
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ApplicationId { get; set; }

        [Required]
        public int RecruiterId { get; set; }

        [Required]
        [MaxLength(30)]
        public string InterviewType { get; set; } = string.Empty;

        [Required]
        public DateTime ScheduledAt { get; set; }

        [Range(15, 480)]
        public int DurationMinutes { get; set; } = 60;

        [MaxLength(500)]
        public string MeetingLink { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(100)]
        public string InterviewerName { get; set; } = string.Empty;

        [MaxLength(150)]
        public string InterviewerEmail { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Status { get; set; } = "Scheduled";

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}