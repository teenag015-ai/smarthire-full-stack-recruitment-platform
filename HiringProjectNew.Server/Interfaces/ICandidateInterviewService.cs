using HiringProjectNew.Server.DTOs.Candidate.Interviews;

namespace HiringProjectNew.Server.Interfaces
{
    public interface ICandidateInterviewService
    {
        Task<List<CandidateInterviewDto>>
            GetMyInterviewsAsync(int candidateId);

        Task<CandidateInterviewDto?>
            GetInterviewDetailsAsync(
                int candidateId,
                int interviewId);
    }
}