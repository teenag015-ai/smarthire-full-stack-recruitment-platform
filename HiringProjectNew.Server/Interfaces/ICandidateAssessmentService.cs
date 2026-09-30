using HiringProjectNew.Server.DTOs.Candidate.Assessments;

namespace HiringProjectNew.Server.Interfaces
{
    public interface ICandidateAssessmentService
    {
        Task<List<CandidateAssessmentDto>>
            GetAvailableAssessmentsAsync(
                int candidateId);

        Task<CandidateAssessmentDetailsDto?>
            GetAssessmentDetailsAsync(
                int candidateId,
                int assessmentId);

        Task<CandidateAssessmentDetailsDto?>
            StartAssessmentAsync(
                int candidateId,
                int assessmentId);

        Task<CandidateAssessmentResultDto>
            SubmitAssessmentAsync(
                int candidateId,
                int assessmentId,
                SubmitAssessmentDto request);

        Task<CandidateAssessmentResultDto?>
            GetAssessmentResultAsync(
                int candidateId,
                int assessmentId);
    }
}