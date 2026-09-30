using HiringProjectNew.Server.DTOs.Recruiter.Interviews;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterInterviewService
    {
        Task<RecruiterInterviewListDto> GetInterviewsAsync(
            int recruiterId,
            RecruiterInterviewQueryDto query);

        Task<RecruiterInterviewDto?> GetInterviewByIdAsync(
            int recruiterId,
            int interviewId);

        Task<RecruiterInterviewDto> CreateInterviewAsync(
            int recruiterId,
            CreateInterviewDto request);

        Task<RecruiterInterviewDto?> EditInterviewAsync(
            int recruiterId,
            int interviewId,
            EditInterviewDto request);

        Task<bool> DeleteInterviewAsync(
            int recruiterId,
            int interviewId);

        Task<bool> UpdateInterviewStatusAsync(
            int recruiterId,
            int interviewId,
            string status);
    }
}