using HiringProjectNew.Server.DTOs.Recruiter.Analytics;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterAnalyticsService
    {
        Task<RecruiterAnalyticsDto> GetAnalyticsAsync(
            int recruiterId
        );
    }
}