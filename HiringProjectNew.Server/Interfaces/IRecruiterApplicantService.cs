using HiringProjectNew.Server.DTOs.Recruiter.Applicants;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterApplicantService
    {
        Task<RecruiterApplicantListDto> GetApplicantsAsync(
            int recruiterId,
            RecruiterApplicantQueryDto query);

        Task<RecruiterApplicantDto?> GetApplicantByIdAsync(
            int recruiterId,
            int applicationId);

        Task<bool> UpdateApplicationStageAsync(
            int recruiterId,
            int applicationId,
            string stage);
    }
}