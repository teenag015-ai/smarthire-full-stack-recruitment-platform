using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Recruiter.Assessments
{
    public class EditAssessmentQuestionDto
    {
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
    }
}