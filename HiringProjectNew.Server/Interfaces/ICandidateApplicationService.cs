using HiringProjectNew.Server.DTOs.Candidate.Applications;

namespace HiringProjectNew.Server.Interfaces
{
    public interface ICandidateApplicationService
    {
        Task<bool> ApplyForJobAsync(
            int candidateId,
            CreateApplicationDto request);

        Task<List<CandidateApplicationListDto>>
            GetCandidateApplicationsAsync(
                int candidateId);
    }
}