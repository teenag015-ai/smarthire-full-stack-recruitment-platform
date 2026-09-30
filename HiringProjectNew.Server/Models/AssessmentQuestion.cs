using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.Models
{
    public class AssessmentQuestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string OptionA { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string OptionB { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string OptionC { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string OptionD { get; set; } = string.Empty;

        [Required]
        [MaxLength(1)]
        public string CorrectAnswer { get; set; } = string.Empty;

        [Range(1, 100)]
        public int Marks { get; set; } = 1;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}