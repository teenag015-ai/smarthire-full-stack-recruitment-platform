using HiringProjectNew.Server.DTOs.CandidateOffer;

namespace HiringProjectNew.Server.Interfaces
{
    public interface ICandidateOfferService
    {
        Task<List<CandidateOfferDto>> GetCandidateOffersAsync(
            int candidateId);

        Task<CandidateOfferDto?> GetCandidateOfferByIdAsync(
            int candidateId,
            int offerId);

        Task<CandidateOfferDto?> RespondToOfferAsync(
            int candidateId,
            int offerId,
            CandidateOfferResponseDto request);
    }
}