using HiringProjectNew.Server.DTOs.Recruiter.Assessments;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterAssessmentService
    {
        Task<RecruiterAssessmentListDto> GetAssessmentsAsync(
            int recruiterId,
            RecruiterAssessmentQueryDto query);

        Task<RecruiterAssessmentDto?> GetAssessmentByIdAsync(
            int recruiterId,
            int id);

        Task<RecruiterAssessmentDto> CreateAssessmentAsync(
            int recruiterId,
            CreateAssessmentDto request);

        Task<RecruiterAssessmentDto?> EditAssessmentAsync(
            int recruiterId,
            int id,
            EditAssessmentDto request);

        Task<bool> DeleteAssessmentAsync(
            int recruiterId,
            int id);

        Task<bool> UpdateAssessmentStatusAsync(
            int recruiterId,
            int id,
            bool isActive);
    }
}