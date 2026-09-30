using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class Job
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public int JobCategoryId { get; set; }

        [Required]
        public int RecruiterId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string EmploymentType { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ExperienceLevel { get; set; } = string.Empty;

        [Range(0, 999999999)]
        public decimal? MinimumSalary { get; set; }

        [Range(0, 999999999)]
        public decimal? MaximumSalary { get; set; }

        [MaxLength(1000)]
        public string RequiredSkills { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Responsibilities { get; set; } = string.Empty;

        public string Requirements { get; set; } = string.Empty;

        public DateTime ApplicationDeadline { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}