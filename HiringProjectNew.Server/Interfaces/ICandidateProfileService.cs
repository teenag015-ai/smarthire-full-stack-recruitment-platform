using HiringProjectNew.Server.DTOs.Candidate.Profile;
using Microsoft.AspNetCore.Http;

namespace HiringProjectNew.Server.Interfaces
{
    public interface ICandidateProfileService
    {
        Task<CandidateProfileDto?> GetProfileAsync(
            int candidateId);

        Task<CandidateProfileDto> UpdateProfileAsync(
            int candidateId,
            UpdateCandidateProfileDto request);

        Task<CandidateProfileDto> UploadResumeAsync(
            int candidateId,
            IFormFile resumeFile);
    }
}