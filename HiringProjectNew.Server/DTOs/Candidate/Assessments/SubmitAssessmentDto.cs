using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Candidate.Assessments
{
    public class SubmitAssessmentDto
    {
        [Required]
        public List<CandidateAnswerDto> Answers { get; set; }
            = new List<CandidateAnswerDto>();
    }

    public class CandidateAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        [Required]
        [MaxLength(1)]
        public string SelectedAnswer { get; set; } = string.Empty;
    }
}