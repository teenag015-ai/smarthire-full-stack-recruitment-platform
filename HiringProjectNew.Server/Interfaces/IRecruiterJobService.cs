using HiringProjectNew.Server.DTOs.Recruiter.Jobs;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterJobService
    {
        Task<RecruiterJobListDto> GetJobsAsync(
            int recruiterId,
            RecruiterJobQueryDto query);

        Task<RecruiterJobDto?> GetJobByIdAsync(
            int recruiterId,
            int id);

        Task<RecruiterJobDto> CreateJobAsync(
            int recruiterId,
            CreateJobDto request);

        Task<RecruiterJobDto?> EditJobAsync(
            int recruiterId,
            int id,
            EditJobDto request);

        Task<bool> DeleteJobAsync(
            int recruiterId,
            int id);

        Task<bool> UpdateJobStatusAsync(
            int recruiterId,
            int id,
            bool isActive);
    }
}