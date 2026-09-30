using HiringProjectNew.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Candidate")]
    public class CandidateDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidateDashboardController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            // ==========================================================
            // GET LOGGED-IN CANDIDATE ID
            // ==========================================================

            var candidateIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

            if (!int.TryParse(
                    candidateIdClaim,
                    out int candidateId))
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid candidate authentication."
                });
            }


            // ==========================================================
            // APPLICATIONS
            // ==========================================================

            var totalApplications =
                await _context.Applications
                    .CountAsync(a =>
                        a.CandidateId == candidateId &&
                        a.IsActive);


            // ==========================================================
            // ACTIVE APPLICATIONS
            // ==========================================================

            var activeApplications =
                await _context.Applications
                    .CountAsync(a =>
                        a.CandidateId == candidateId &&
                        a.IsActive &&
                        a.CurrentStage != "Rejected" &&
                        a.CurrentStage != "Hired");


            // ==========================================================
            // INTERVIEWS
            // ==========================================================

            var totalInterviews =
                await _context.Interviews
                    .CountAsync(i =>
                        _context.Applications.Any(a =>
                            a.Id == i.ApplicationId &&
                            a.CandidateId == candidateId));


            // ==========================================================
            // UPCOMING INTERVIEWS
            // ==========================================================

            var upcomingInterviews =
                await _context.Interviews
                    .Where(i =>
                        i.ScheduledAt >= DateTime.UtcNow &&
                        _context.Applications.Any(a =>
                            a.Id == i.ApplicationId &&
                            a.CandidateId == candidateId))
                    .OrderBy(i => i.ScheduledAt)
                    .Take(5)
                    .Select(i => new
                    {
                        i.Id,
                        i.ApplicationId,
                        i.InterviewType,
                        i.ScheduledAt,
                        i.DurationMinutes,
                        i.MeetingLink,
                        i.Location,
                        i.InterviewerName,
                        i.Status,

                        JobTitle =
                            _context.Applications
                                .Where(a =>
                                    a.Id == i.ApplicationId)
                                .Join(
                                    _context.Jobs,
                                    a => a.JobId,
                                    j => j.Id,
                                    (a, j) => j.Title
                                )
                                .FirstOrDefault()
                    })
                    .ToListAsync();


            // ==========================================================
            // OFFERS
            // ==========================================================
            //
            // IMPORTANT:
            // Keep the Dashboard offer visibility rules identical
            // to CandidateOfferService.
            //
            // Candidates should NOT see:
            //     Draft
            //     Withdrawn
            //
            // Candidates CAN see:
            //     Sent
            //     Accepted
            //     Rejected
            //     Expired
            //
            // ==========================================================

            var visibleOffersQuery =
                _context.Offers
                    .Where(o =>
                        o.CandidateId == candidateId &&
                        o.Status != "Draft" &&
                        o.Status != "Withdrawn");


            // ==========================================================
            // TOTAL OFFERS
            // ==========================================================

            var totalOffers =
                await visibleOffersQuery
                    .CountAsync();


            // ==========================================================
            // PENDING OFFERS
            // ==========================================================
            //
            // Only "Sent" offers require a candidate response.
            //
            // Draft offers are recruiter-side only and therefore
            // must NOT appear as pending candidate offers.
            //
            // ==========================================================

            var activeOffers =
                await visibleOffersQuery
                    .CountAsync(o =>
                        o.Status == "Sent");


            // ==========================================================
            // RECENT APPLICATIONS
            // ==========================================================

            var recentApplications =
                await _context.Applications
                    .Where(a =>
                        a.CandidateId == candidateId &&
                        a.IsActive)
                    .OrderByDescending(a => a.AppliedAt)
                    .Take(5)
                    .Select(a => new
                    {
                        a.Id,
                        a.JobId,
                        a.CurrentStage,
                        a.AppliedAt,

                        JobTitle =
                            _context.Jobs
                                .Where(j =>
                                    j.Id == a.JobId)
                                .Select(j => j.Title)
                                .FirstOrDefault(),

                        Location =
                            _context.Jobs
                                .Where(j =>
                                    j.Id == a.JobId)
                                .Select(j => j.Location)
                                .FirstOrDefault()
                    })
                    .ToListAsync();


            // ==========================================================
            // RESPONSE
            // ==========================================================

            var dashboard = new
            {
                statistics = new
                {
                    totalApplications,
                    activeApplications,
                    totalInterviews,
                    totalOffers,
                    activeOffers
                },

                upcomingInterviews,

                recentApplications
            };


            return Ok(dashboard);
        }
    }
}