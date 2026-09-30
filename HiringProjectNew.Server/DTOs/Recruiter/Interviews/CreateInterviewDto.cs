using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Recruiter.Interviews
{
    public class CreateInterviewDto
    {
        [Required]
        public int ApplicationId { get; set; }

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
        [EmailAddress]
        public string InterviewerEmail { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;
    }
}