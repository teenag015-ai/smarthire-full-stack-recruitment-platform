using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Offers;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterOfferService : IRecruiterOfferService
    {
        private readonly ApplicationDbContext _context;

        private static readonly string[] ValidStatuses =
        {
            "Draft",
            "Sent",
            "Accepted",
            "Rejected",
            "Expired",
            "Withdrawn"
        };

        public RecruiterOfferService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecruiterOfferListDto> GetOffersAsync(
            int recruiterId,
            RecruiterOfferQueryDto query)
        {
            var recruiterExists = await _context.Users
                .AnyAsync(u =>
                    u.Id == recruiterId &&
                    u.Role == "Recruiter" &&
                    u.IsActive);

            if (!recruiterExists)
            {
                throw new InvalidOperationException(
                    "Recruiter account is not active or does not exist.");
            }

            query.PageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            query.PageSize = query.PageSize <= 0
                ? 10
                : Math.Min(query.PageSize, 100);

            var offersQuery =
                from offer in _context.Offers

                join application in _context.Applications
                    on offer.ApplicationId equals application.Id

                join candidate in _context.Users
                    on offer.CandidateId equals candidate.Id

                join job in _context.Jobs
                    on offer.JobId equals job.Id

                join recruiter in _context.Users
                    on offer.RecruiterId equals recruiter.Id

                where offer.RecruiterId == recruiterId

                select new
                {
                    Offer = offer,
                    Application = application,
                    Candidate = candidate,
                    Job = job,
                    Recruiter = recruiter
                };

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim().ToLower();

                offersQuery = offersQuery.Where(x =>
                    x.Candidate.FullName.ToLower().Contains(search) ||
                    x.Candidate.Email.ToLower().Contains(search) ||
                    x.Job.Title.ToLower().Contains(search) ||
                    x.Offer.Designation.ToLower().Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                var status = query.Status.Trim();

                offersQuery = offersQuery.Where(x =>
                    x.Offer.Status == status);
            }

            if (query.FromDate.HasValue)
            {
                var fromDate = query.FromDate.Value.Date;

                offersQuery = offersQuery.Where(x =>
                    x.Offer.JoiningDate >= fromDate);
            }

            if (query.ToDate.HasValue)
            {
                var toDate = query.ToDate.Value.Date.AddDays(1);

                offersQuery = offersQuery.Where(x =>
                    x.Offer.JoiningDate < toDate);
            }

            var totalRecords = await offersQuery.CountAsync();

            var totalPages = totalRecords == 0
                ? 0
                : (int)Math.Ceiling(
                    totalRecords / (double)query.PageSize);

            var offers = await offersQuery
                .OrderByDescending(x => x.Offer.CreatedAt)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(x => new RecruiterOfferDto
                {
                    Id = x.Offer.Id,

                    ApplicationId = x.Offer.ApplicationId,

                    CandidateId = x.Offer.CandidateId,

                    CandidateName = x.Candidate.FullName,

                    CandidateEmail = x.Candidate.Email,

                    JobId = x.Offer.JobId,

                    JobTitle = x.Job.Title,

                    RecruiterId = x.Offer.RecruiterId,

                    RecruiterName = x.Recruiter.FullName,

                    Designation = x.Offer.Designation,

                    OfferedSalary = x.Offer.OfferedSalary,

                    JoiningDate = x.Offer.JoiningDate,

                    OfferExpiryDate = x.Offer.OfferExpiryDate,

                    Status = x.Offer.Status,

                    Benefits = x.Offer.Benefits,

                    Notes = x.Offer.Notes,

                    CreatedAt = x.Offer.CreatedAt,

                    UpdatedAt = x.Offer.UpdatedAt,

                    SentAt = x.Offer.SentAt,

                    RespondedAt = x.Offer.RespondedAt
                })
                .ToListAsync();

            return new RecruiterOfferListDto
            {
                Offers = offers,

                TotalRecords = totalRecords,

                PageNumber = query.PageNumber,

                PageSize = query.PageSize,

                TotalPages = totalPages
            };
        }

        public async Task<RecruiterOfferDto?> GetOfferByIdAsync(
            int recruiterId,
            int offerId)
        {
            return await
                (from offer in _context.Offers

                 join application in _context.Applications
                     on offer.ApplicationId equals application.Id

                 join candidate in _context.Users
                     on offer.CandidateId equals candidate.Id

                 join job in _context.Jobs
                     on offer.JobId equals job.Id

                 join recruiter in _context.Users
                     on offer.RecruiterId equals recruiter.Id

                 where offer.Id == offerId &&
                       offer.RecruiterId == recruiterId

                 select new RecruiterOfferDto
                 {
                     Id = offer.Id,

                     ApplicationId = offer.ApplicationId,

                     CandidateId = offer.CandidateId,

                     CandidateName = candidate.FullName,

                     CandidateEmail = candidate.Email,

                     JobId = offer.JobId,

                     JobTitle = job.Title,

                     RecruiterId = offer.RecruiterId,

                     RecruiterName = recruiter.FullName,

                     Designation = offer.Designation,

                     OfferedSalary = offer.OfferedSalary,

                     JoiningDate = offer.JoiningDate,

                     OfferExpiryDate = offer.OfferExpiryDate,

                     Status = offer.Status,

                     Benefits = offer.Benefits,

                     Notes = offer.Notes,

                     CreatedAt = offer.CreatedAt,

                     UpdatedAt = offer.UpdatedAt,

                     SentAt = offer.SentAt,

                     RespondedAt = offer.RespondedAt
                 })
                .FirstOrDefaultAsync();
        }

        public async Task<RecruiterOfferDto> CreateOfferAsync(
            int recruiterId,
            CreateOfferDto request)
        {
            var recruiter = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == recruiterId &&
                    u.Role == "Recruiter" &&
                    u.IsActive);

            if (recruiter == null)
            {
                throw new InvalidOperationException(
                    "Recruiter account is not active or does not exist.");
            }

            if (request.JoiningDate.Date < DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Joining date cannot be in the past.");
            }

            if (request.OfferExpiryDate.Date < DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Offer expiry date cannot be in the past.");
            }

            if (request.OfferExpiryDate <= request.JoiningDate)
            {
                throw new InvalidOperationException(
                    "Offer expiry date must be after the joining date.");
            }

            var application =
                await
                (from app in _context.Applications

                 join job in _context.Jobs
                     on app.JobId equals job.Id

                 join candidate in _context.Users
                     on app.CandidateId equals candidate.Id

                 where app.Id == request.ApplicationId &&
                       job.RecruiterId == recruiterId &&
                       candidate.IsActive

                 select new
                 {
                     Application = app,
                     Job = job,
                     Candidate = candidate
                 })
                .FirstOrDefaultAsync();

            if (application == null)
            {
                throw new InvalidOperationException(
                    "Application does not belong to this recruiter.");
            }

            var validStages = new[]
            {
                "Selected",
                "Offer"
            };

            if (!validStages.Contains(
                    application.Application.CurrentStage))
            {
                throw new InvalidOperationException(
                    "An offer can only be created for a selected or offer-stage application.");
            }

            var existingOffer = await _context.Offers
                .AnyAsync(o =>
                    o.ApplicationId == request.ApplicationId &&
                    o.RecruiterId == recruiterId &&
                    o.Status != "Rejected" &&
                    o.Status != "Withdrawn" &&
                    o.Status != "Expired");

            if (existingOffer)
            {
                throw new InvalidOperationException(
                    "An active offer already exists for this application.");
            }

            var offer = new Offer
            {
                ApplicationId = request.ApplicationId,

                CandidateId = application.Application.CandidateId,

                JobId = application.Application.JobId,

                RecruiterId = recruiterId,

                Designation = request.Designation.Trim(),

                OfferedSalary = request.OfferedSalary,

                JoiningDate = request.JoiningDate,

                OfferExpiryDate = request.OfferExpiryDate,

                Status = "Draft",

                Benefits = request.Benefits?.Trim() ?? string.Empty,

                Notes = request.Notes?.Trim() ?? string.Empty,

                CreatedAt = DateTime.UtcNow
            };

            _context.Offers.Add(offer);

            application.Application.CurrentStage = "Offer";
            application.Application.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (await GetOfferByIdAsync(
                recruiterId,
                offer.Id))!;
        }

        public async Task<RecruiterOfferDto?> EditOfferAsync(
            int recruiterId,
            int offerId,
            EditOfferDto request)
        {
            var offer = await _context.Offers
                .FirstOrDefaultAsync(o =>
                    o.Id == offerId &&
                    o.RecruiterId == recruiterId);

            if (offer == null)
            {
                return null;
            }

            if (offer.Status != "Draft")
            {
                throw new InvalidOperationException(
                    "Only draft offers can be edited.");
            }

            if (request.JoiningDate.Date < DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Joining date cannot be in the past.");
            }

            if (request.OfferExpiryDate.Date < DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Offer expiry date cannot be in the past.");
            }

            if (request.OfferExpiryDate <= request.JoiningDate)
            {
                throw new InvalidOperationException(
                    "Offer expiry date must be after the joining date.");
            }

            offer.Designation = request.Designation.Trim();

            offer.OfferedSalary = request.OfferedSalary;

            offer.JoiningDate = request.JoiningDate;

            offer.OfferExpiryDate = request.OfferExpiryDate;

            offer.Benefits = request.Benefits?.Trim() ?? string.Empty;

            offer.Notes = request.Notes?.Trim() ?? string.Empty;

            offer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetOfferByIdAsync(
                recruiterId,
                offerId);
        }

        public async Task<bool> DeleteOfferAsync(
            int recruiterId,
            int offerId)
        {
            var offer = await _context.Offers
                .FirstOrDefaultAsync(o =>
                    o.Id == offerId &&
                    o.RecruiterId == recruiterId);

            if (offer == null)
            {
                return false;
            }

            if (offer.Status != "Draft")
            {
                throw new InvalidOperationException(
                    "Only draft offers can be deleted.");
            }

            _context.Offers.Remove(offer);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateOfferStatusAsync(
            int recruiterId,
            int offerId,
            string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new InvalidOperationException(
                    "Offer status is required.");
            }

            status = status.Trim();

            if (!ValidStatuses.Contains(status))
            {
                throw new InvalidOperationException(
                    "Invalid offer status.");
            }

            var offer = await _context.Offers
                .FirstOrDefaultAsync(o =>
                    o.Id == offerId &&
                    o.RecruiterId == recruiterId);

            if (offer == null)
            {
                return false;
            }

            if (offer.Status == "Accepted" ||
                offer.Status == "Rejected" ||
                offer.Status == "Withdrawn")
            {
                throw new InvalidOperationException(
                    "This offer has already reached a final status.");
            }

            if (status == "Sent")
            {
                if (offer.Status != "Draft")
                {
                    throw new InvalidOperationException(
                        "Only draft offers can be sent.");
                }

                offer.SentAt = DateTime.UtcNow;
            }

            if (status == "Accepted")
            {
                if (offer.Status != "Sent")
                {
                    throw new InvalidOperationException(
                        "Only sent offers can be accepted.");
                }

                offer.RespondedAt = DateTime.UtcNow;

                var application = await _context.Applications
                    .FirstOrDefaultAsync(a =>
                        a.Id == offer.ApplicationId);

                if (application != null)
                {
                    application.CurrentStage = "Hired";
                    application.UpdatedAt = DateTime.UtcNow;
                }
            }

            if (status == "Rejected")
            {
                offer.RespondedAt = DateTime.UtcNow;
            }

            offer.Status = status;

            offer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}