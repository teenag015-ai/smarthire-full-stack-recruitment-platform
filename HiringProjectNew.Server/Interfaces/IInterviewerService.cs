using HiringProjectNew.Server.DTOs.Interviewer;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IInterviewerService
    {
        // Get interviewer dashboard statistics
        Task<InterviewerDashboardDto?> GetDashboardAsync(
            string interviewerEmail
        );

        // Get all interviews assigned to the interviewer
        Task<List<InterviewerInterviewDto>> GetInterviewsAsync(
            string interviewerEmail
        );

        // Get details of one assigned interview
        Task<InterviewerInterviewDto?> GetInterviewByIdAsync(
            string interviewerEmail,
            int interviewId
        );
    }
}