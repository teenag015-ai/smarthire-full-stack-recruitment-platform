namespace HiringProjectNew.Server.DTOs.Candidate.Assessments
{
    public class CandidateAssessmentDetailsDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public int DurationMinutes { get; set; }

        public int PassingScore { get; set; }

        public int TotalQuestions { get; set; }

        public List<CandidateAssessmentQuestionDto> Questions { get; set; }
            = new List<CandidateAssessmentQuestionDto>();
    }

    public class CandidateAssessmentQuestionDto
    {
        public int Id { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        public string OptionA { get; set; } = string.Empty;

        public string OptionB { get; set; } = string.Empty;

        public string OptionC { get; set; } = string.Empty;

        public string OptionD { get; set; } = string.Empty;

        public int Marks { get; set; }
    }
}