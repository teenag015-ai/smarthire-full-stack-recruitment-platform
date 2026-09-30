using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Interviewer;
using HiringProjectNew.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class InterviewerService : IInterviewerService
    {
        private readonly ApplicationDbContext _context;

        public InterviewerService(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // DASHBOARD
        // =========================================================
        public async Task<InterviewerDashboardDto?> GetDashboardAsync(
            string interviewerEmail)
        {
            if (string.IsNullOrWhiteSpace(interviewerEmail))
                return null;

            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var query = _context.Interviews
                .AsNoTracking()
                .Where(i =>
                    i.InterviewerEmail == interviewerEmail
                );

            var totalInterviews = await query.CountAsync();

            var upcomingInterviews = await query.CountAsync(i =>
                i.ScheduledAt >= DateTime.Now &&
                i.Status != "Cancelled"
            );

            var todayInterviews = await query.CountAsync(i =>
                i.ScheduledAt >= today &&
                i.ScheduledAt < tomorrow
            );

            var completedInterviews = await query.CountAsync(i =>
                i.Status == "Completed"
            );

            var cancelledInterviews = await query.CountAsync(i =>
                i.Status == "Cancelled"
            );

            var rescheduledInterviews = await query.CountAsync(i =>
                i.Status == "Rescheduled"
            );

            var upcomingInterviewList = await query
                .Where(i =>
                    i.ScheduledAt >= DateTime.Now &&
                    i.Status != "Cancelled"
                )
                .OrderBy(i => i.ScheduledAt)
                .Take(5)
                .Select(i => new InterviewerInterviewDto
                {
                    Id = i.Id,
                    ApplicationId = i.ApplicationId,

                    CandidateId = _context.Applications
                        .Where(a => a.Id == i.ApplicationId)
                        .Select(a => a.CandidateId)
                        .FirstOrDefault(),

                    CandidateName = _context.Users
                        .Where(u =>
                            u.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.CandidateId)
                                .FirstOrDefault()
                        )
                        .Select(u => u.FullName)
                        .FirstOrDefault() ?? string.Empty,

                    CandidateEmail = _context.Users
                        .Where(u =>
                            u.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.CandidateId)
                                .FirstOrDefault()
                        )
                        .Select(u => u.Email)
                        .FirstOrDefault() ?? string.Empty,

                    JobId = _context.Applications
                        .Where(a => a.Id == i.ApplicationId)
                        .Select(a => a.JobId)
                        .FirstOrDefault(),

                    JobTitle = _context.Jobs
                        .Where(j =>
                            j.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.JobId)
                                .FirstOrDefault()
                        )
                        .Select(j => j.Title)
                        .FirstOrDefault() ?? string.Empty,

                    InterviewType = i.InterviewType,
                    ScheduledAt = i.ScheduledAt,
                    DurationMinutes = i.DurationMinutes,
                    MeetingLink = i.MeetingLink,
                    Location = i.Location,
                    InterviewerName = i.InterviewerName,
                    InterviewerEmail = i.InterviewerEmail,
                    Status = i.Status,
                    Notes = i.Notes
                })
                .ToListAsync();

            return new InterviewerDashboardDto
            {
                TotalInterviews = totalInterviews,
                UpcomingInterviews = upcomingInterviews,
                TodayInterviews = todayInterviews,
                CompletedInterviews = completedInterviews,
                CancelledInterviews = cancelledInterviews,
                RescheduledInterviews = rescheduledInterviews,
                UpcomingInterviewList = upcomingInterviewList
            };
        }


        // =========================================================
        // GET ALL INTERVIEWS
        // =========================================================
        public async Task<List<InterviewerInterviewDto>> GetInterviewsAsync(
            string interviewerEmail)
        {
            if (string.IsNullOrWhiteSpace(interviewerEmail))
                return new List<InterviewerInterviewDto>();

            var interviews = await _context.Interviews
                .AsNoTracking()
                .Where(i =>
                    i.InterviewerEmail == interviewerEmail
                )
                .OrderByDescending(i => i.ScheduledAt)
                .Select(i => new InterviewerInterviewDto
                {
                    Id = i.Id,
                    ApplicationId = i.ApplicationId,

                    CandidateId = _context.Applications
                        .Where(a => a.Id == i.ApplicationId)
                        .Select(a => a.CandidateId)
                        .FirstOrDefault(),

                    CandidateName = _context.Users
                        .Where(u =>
                            u.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.CandidateId)
                                .FirstOrDefault()
                        )
                        .Select(u => u.FullName)
                        .FirstOrDefault() ?? string.Empty,

                    CandidateEmail = _context.Users
                        .Where(u =>
                            u.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.CandidateId)
                                .FirstOrDefault()
                        )
                        .Select(u => u.Email)
                        .FirstOrDefault() ?? string.Empty,

                    JobId = _context.Applications
                        .Where(a => a.Id == i.ApplicationId)
                        .Select(a => a.JobId)
                        .FirstOrDefault(),

                    JobTitle = _context.Jobs
                        .Where(j =>
                            j.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.JobId)
                                .FirstOrDefault()
                        )
                        .Select(j => j.Title)
                        .FirstOrDefault() ?? string.Empty,

                    InterviewType = i.InterviewType,
                    ScheduledAt = i.ScheduledAt,
                    DurationMinutes = i.DurationMinutes,
                    MeetingLink = i.MeetingLink,
                    Location = i.Location,
                    InterviewerName = i.InterviewerName,
                    InterviewerEmail = i.InterviewerEmail,
                    Status = i.Status,
                    Notes = i.Notes
                })
                .ToListAsync();

            return interviews;
        }


        // =========================================================
        // GET INTERVIEW BY ID
        // =========================================================
        public async Task<InterviewerInterviewDto?> GetInterviewByIdAsync(
            string interviewerEmail,
            int interviewId)
        {
            if (string.IsNullOrWhiteSpace(interviewerEmail))
                return null;

            var interview = await _context.Interviews
                .AsNoTracking()
                .Where(i =>
                    i.Id == interviewId &&
                    i.InterviewerEmail == interviewerEmail
                )
                .Select(i => new InterviewerInterviewDto
                {
                    Id = i.Id,
                    ApplicationId = i.ApplicationId,

                    CandidateId = _context.Applications
                        .Where(a => a.Id == i.ApplicationId)
                        .Select(a => a.CandidateId)
                        .FirstOrDefault(),

                    CandidateName = _context.Users
                        .Where(u =>
                            u.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.CandidateId)
                                .FirstOrDefault()
                        )
                        .Select(u => u.FullName)
                        .FirstOrDefault() ?? string.Empty,

                    CandidateEmail = _context.Users
                        .Where(u =>
                            u.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.CandidateId)
                                .FirstOrDefault()
                        )
                        .Select(u => u.Email)
                        .FirstOrDefault() ?? string.Empty,

                    JobId = _context.Applications
                        .Where(a => a.Id == i.ApplicationId)
                        .Select(a => a.JobId)
                        .FirstOrDefault(),

                    JobTitle = _context.Jobs
                        .Where(j =>
                            j.Id ==
                            _context.Applications
                                .Where(a => a.Id == i.ApplicationId)
                                .Select(a => a.JobId)
                                .FirstOrDefault()
                        )
                        .Select(j => j.Title)
                        .FirstOrDefault() ?? string.Empty,

                    InterviewType = i.InterviewType,
                    ScheduledAt = i.ScheduledAt,
                    DurationMinutes = i.DurationMinutes,
                    MeetingLink = i.MeetingLink,
                    Location = i.Location,
                    InterviewerName = i.InterviewerName,
                    InterviewerEmail = i.InterviewerEmail,
                    Status = i.Status,
                    Notes = i.Notes
                })
                .FirstOrDefaultAsync();

            return interview;
        }
    }
}