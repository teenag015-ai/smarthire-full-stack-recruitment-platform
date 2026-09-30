using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Analytics;
using HiringProjectNew.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterAnalyticsService : IRecruiterAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public RecruiterAnalyticsService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecruiterAnalyticsDto> GetAnalyticsAsync(
            int recruiterId)
        {
            var recruiterExists = await _context.Users
                .AnyAsync(u =>
                    u.Id == recruiterId &&
                    u.Role == "Recruiter" &&
                    u.IsActive);

            if (!recruiterExists)
            {
                throw new UnauthorizedAccessException(
                    "Recruiter account is not active."
                );
            }

            // ==========================================
            // RECRUITER JOBS
            // ==========================================

            var jobs = _context.Jobs
                .Where(j =>
                    j.RecruiterId == recruiterId);

            var totalJobs = await jobs.CountAsync();

            var activeJobs = await jobs
                .CountAsync(j => j.IsActive);


            // ==========================================
            // RECRUITER APPLICATIONS
            // ==========================================

            var applications = _context.Applications
                .Join(
                    _context.Jobs,
                    application => application.JobId,
                    job => job.Id,
                    (application, job) => new
                    {
                        Application = application,
                        Job = job
                    }
                )
                .Where(x =>
                    x.Job.RecruiterId == recruiterId &&
                    x.Application.IsActive);


            var totalApplicants = await applications
                .CountAsync();

            var appliedCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Applied");

            var screeningCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Screening");

            var shortlistedCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Shortlisted");

            var assessmentCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Assessment");

            var interviewCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Interview");

            var selectedCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Selected");

            var offerCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Offer");

            var hiredCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Hired");

            var rejectedCount = await applications
                .CountAsync(x =>
                    x.Application.CurrentStage == "Rejected");


            // ==========================================
            // RECRUITER INTERVIEWS
            // ==========================================

            var interviews = _context.Interviews
                .Join(
                    _context.Applications,
                    interview => interview.ApplicationId,
                    application => application.Id,
                    (interview, application) => new
                    {
                        Interview = interview,
                        Application = application
                    }
                )
                .Join(
                    _context.Jobs,
                    x => x.Application.JobId,
                    job => job.Id,
                    (x, job) => new
                    {
                        Interview = x.Interview,
                        Job = job
                    }
                )
                .Where(x =>
                    x.Job.RecruiterId == recruiterId);


            var totalInterviews = await interviews
                .CountAsync();

            var scheduledInterviews = await interviews
                .CountAsync(x =>
                    x.Interview.Status == "Scheduled");

            var completedInterviews = await interviews
                .CountAsync(x =>
                    x.Interview.Status == "Completed");

            var cancelledInterviews = await interviews
                .CountAsync(x =>
                    x.Interview.Status == "Cancelled");

            var rescheduledInterviews = await interviews
                .CountAsync(x =>
                    x.Interview.Status == "Rescheduled");

            var noShowInterviews = await interviews
                .CountAsync(x =>
                    x.Interview.Status == "No Show");


            // ==========================================
            // RECRUITER OFFERS
            // ==========================================

            var offers = _context.Offers
                .Where(o =>
                    o.RecruiterId == recruiterId);


            var totalOffers = await offers
                .CountAsync();

            var draftOffers = await offers
                .CountAsync(o =>
                    o.Status == "Draft");

            var sentOffers = await offers
                .CountAsync(o =>
                    o.Status == "Sent");

            var acceptedOffers = await offers
                .CountAsync(o =>
                    o.Status == "Accepted");

            var rejectedOffers = await offers
                .CountAsync(o =>
                    o.Status == "Rejected");

            var expiredOffers = await offers
                .CountAsync(o =>
                    o.Status == "Expired");

            var withdrawnOffers = await offers
                .CountAsync(o =>
                    o.Status == "Withdrawn");


            // ==========================================
            // CONVERSION RATES
            // ==========================================

            decimal applicationToInterviewRate = 0;

            if (totalApplicants > 0)
            {
                applicationToInterviewRate =
                    Math.Round(
                        (decimal)totalInterviews /
                        totalApplicants *
                        100,
                        2
                    );
            }


            decimal interviewToOfferRate = 0;

            if (totalInterviews > 0)
            {
                interviewToOfferRate =
                    Math.Round(
                        (decimal)totalOffers /
                        totalInterviews *
                        100,
                        2
                    );
            }


            decimal offerAcceptanceRate = 0;

            if (totalOffers > 0)
            {
                offerAcceptanceRate =
                    Math.Round(
                        (decimal)acceptedOffers /
                        totalOffers *
                        100,
                        2
                    );
            }


            decimal hiringRate = 0;

            if (totalApplicants > 0)
            {
                hiringRate =
                    Math.Round(
                        (decimal)hiredCount /
                        totalApplicants *
                        100,
                        2
                    );
            }


            // ==========================================
            // FINAL ANALYTICS RESPONSE
            // ==========================================

            return new RecruiterAnalyticsDto
            {
                // Overview
                TotalJobs = totalJobs,
                ActiveJobs = activeJobs,
                TotalApplicants = totalApplicants,
                TotalInterviews = totalInterviews,
                TotalOffers = totalOffers,
                TotalHired = hiredCount,

                // Application stages
                AppliedCount = appliedCount,
                ScreeningCount = screeningCount,
                ShortlistedCount = shortlistedCount,
                AssessmentCount = assessmentCount,
                InterviewCount = interviewCount,
                SelectedCount = selectedCount,
                OfferCount = offerCount,
                HiredCount = hiredCount,
                RejectedCount = rejectedCount,

                // Interview statistics
                ScheduledInterviews = scheduledInterviews,
                CompletedInterviews = completedInterviews,
                CancelledInterviews = cancelledInterviews,
                RescheduledInterviews = rescheduledInterviews,
                NoShowInterviews = noShowInterviews,

                // Offer statistics
                DraftOffers = draftOffers,
                SentOffers = sentOffers,
                AcceptedOffers = acceptedOffers,
                RejectedOffers = rejectedOffers,
                ExpiredOffers = expiredOffers,
                WithdrawnOffers = withdrawnOffers,

                // Conversion metrics
                ApplicationToInterviewRate =
                    applicationToInterviewRate,

                InterviewToOfferRate =
                    interviewToOfferRate,

                OfferAcceptanceRate =
                    offerAcceptanceRate,

                HiringRate =
                    hiringRate
            };
        }
    }
}