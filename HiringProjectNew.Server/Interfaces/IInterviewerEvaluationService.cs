using HiringProjectNew.Server.DTOs.Interviewer.Evaluation;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IInterviewerEvaluationService
    {
        Task<InterviewEvaluationDto?> GetEvaluationAsync(
            string interviewerEmail,
            int interviewId);

        Task<InterviewEvaluationDto> CreateEvaluationAsync(
            string interviewerEmail,
            CreateInterviewEvaluationDto request);

        Task<InterviewEvaluationDto?> UpdateEvaluationAsync(
            string interviewerEmail,
            int interviewId,
            UpdateInterviewEvaluationDto request);
    }
}