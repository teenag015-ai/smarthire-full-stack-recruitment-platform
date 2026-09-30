using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.CandidateOffer;
using HiringProjectNew.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class CandidateOfferService : ICandidateOfferService
    {
        private readonly ApplicationDbContext _context;

        public CandidateOfferService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // GET ALL OFFERS FOR LOGGED-IN CANDIDATE
        // ============================================================
        public async Task<List<CandidateOfferDto>> GetCandidateOffersAsync(
            int candidateId)
        {
            return await _context.Offers
                .AsNoTracking()
                .Where(o =>
                    o.CandidateId == candidateId &&
                    o.Status != "Draft" &&
                    o.Status != "Withdrawn")
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new CandidateOfferDto
                {
                    Id = o.Id,

                    ApplicationId = o.ApplicationId,

                    JobId = o.JobId,

                    JobTitle = _context.Jobs
                        .Where(j => j.Id == o.JobId)
                        .Select(j => j.Title)
                        .FirstOrDefault() ?? string.Empty,

                    Designation = o.Designation,

                    OfferedSalary = o.OfferedSalary,

                    JoiningDate = o.JoiningDate,

                    OfferExpiryDate = o.OfferExpiryDate,

                    Status = o.Status,

                    Benefits = o.Benefits,

                    Notes = o.Notes,

                    CreatedAt = o.CreatedAt,

                    SentAt = o.SentAt,

                    RespondedAt = o.RespondedAt
                })
                .ToListAsync();
        }

        // ============================================================
        // GET SINGLE OFFER
        // ============================================================
        public async Task<CandidateOfferDto?> GetCandidateOfferByIdAsync(
            int candidateId,
            int offerId)
        {
            return await _context.Offers
                .AsNoTracking()
                .Where(o =>
                    o.Id == offerId &&
                    o.CandidateId == candidateId &&
                    o.Status != "Draft" &&
                    o.Status != "Withdrawn")
                .Select(o => new CandidateOfferDto
                {
                    Id = o.Id,

                    ApplicationId = o.ApplicationId,

                    JobId = o.JobId,

                    JobTitle = _context.Jobs
                        .Where(j => j.Id == o.JobId)
                        .Select(j => j.Title)
                        .FirstOrDefault() ?? string.Empty,

                    Designation = o.Designation,

                    OfferedSalary = o.OfferedSalary,

                    JoiningDate = o.JoiningDate,

                    OfferExpiryDate = o.OfferExpiryDate,

                    Status = o.Status,

                    Benefits = o.Benefits,

                    Notes = o.Notes,

                    CreatedAt = o.CreatedAt,

                    SentAt = o.SentAt,

                    RespondedAt = o.RespondedAt
                })
                .FirstOrDefaultAsync();
        }

        // ============================================================
        // ACCEPT / REJECT OFFER
        // ============================================================
        public async Task<CandidateOfferDto?> RespondToOfferAsync(
            int candidateId,
            int offerId,
            CandidateOfferResponseDto request)
        {
            var offer = await _context.Offers
                .FirstOrDefaultAsync(o =>
                    o.Id == offerId &&
                    o.CandidateId == candidateId);

            if (offer == null)
            {
                return null;
            }

            // Candidate can respond only to a Sent offer.
            if (!string.Equals(
                    offer.Status,
                    "Sent",
                    StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            // Candidate can only Accept or Reject.
            if (!string.Equals(
                    request.Status,
                    "Accepted",
                    StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    request.Status,
                    "Rejected",
                    StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            // Check whether the offer has expired.
            if (offer.OfferExpiryDate < DateTime.UtcNow)
            {
                offer.Status = "Expired";
                offer.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return null;
            }

            offer.Status = string.Equals(
                request.Status,
                "Accepted",
                StringComparison.OrdinalIgnoreCase)
                ? "Accepted"
                : "Rejected";

            offer.RespondedAt = DateTime.UtcNow;
            offer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCandidateOfferByIdAsync(
                candidateId,
                offerId);
        }
    }
}