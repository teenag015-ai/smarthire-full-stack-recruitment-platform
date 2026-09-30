using HiringProjectNew.Server.DTOs.Recruiter.Assessments;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterAssessmentQuestionService
    {
        Task<List<AssessmentQuestionDto>> GetQuestionsAsync(
            int recruiterId,
            int assessmentId);

        Task<AssessmentQuestionDto?> GetQuestionByIdAsync(
            int recruiterId,
            int questionId);

        Task<AssessmentQuestionDto> CreateQuestionAsync(
            int recruiterId,
            CreateAssessmentQuestionDto request);

        Task<AssessmentQuestionDto?> EditQuestionAsync(
            int recruiterId,
            int questionId,
            EditAssessmentQuestionDto request);

        Task<bool> DeleteQuestionAsync(
            int recruiterId,
            int questionId);

        Task<bool> UpdateQuestionStatusAsync(
            int recruiterId,
            int questionId,
            bool isActive);
    }
}