using HiringProjectNew.Server.DTOs.Recruiter.Offers;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IRecruiterOfferService
    {
        Task<RecruiterOfferListDto> GetOffersAsync(
            int recruiterId,
            RecruiterOfferQueryDto query);

        Task<RecruiterOfferDto?> GetOfferByIdAsync(
            int recruiterId,
            int offerId);

        Task<RecruiterOfferDto> CreateOfferAsync(
            int recruiterId,
            CreateOfferDto request);

        Task<RecruiterOfferDto?> EditOfferAsync(
            int recruiterId,
            int offerId,
            EditOfferDto request);

        Task<bool> DeleteOfferAsync(
            int recruiterId,
            int offerId);

        Task<bool> UpdateOfferStatusAsync(
            int recruiterId,
            int offerId,
            string status);
    }
}