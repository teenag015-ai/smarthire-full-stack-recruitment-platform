using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Interviews;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterInterviewService : IRecruiterInterviewService
    {
        private readonly ApplicationDbContext _context;

        private static readonly string[] ValidInterviewTypes =
        {
            "Technical",
            "HR",
            "Managerial",
            "Behavioral",
            "Final"
        };

        private static readonly string[] ValidStatuses =
        {
            "Scheduled",
            "Completed",
            "Rescheduled",
            "Cancelled",
            "No Show"
        };

        public RecruiterInterviewService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecruiterInterviewListDto> GetInterviewsAsync(
            int recruiterId,
            RecruiterInterviewQueryDto query)
        {
            var recruiterExists = await _context.Users
                .AnyAsync(u =>
                    u.Id == recruiterId &&
                    u.Role == "Recruiter" &&
                    u.IsActive);

            if (!recruiterExists)
            {
                throw new InvalidOperationException(
                    "Recruiter account is inactive or does not exist.");
            }

            var interviewsQuery =
                from interview in _context.Interviews
                join application in _context.Applications
                    on interview.ApplicationId equals application.Id
                join candidate in _context.Users
                    on application.CandidateId equals candidate.Id
                join job in _context.Jobs
                    on application.JobId equals job.Id
                where interview.RecruiterId == recruiterId
                select new
                {
                    Interview = interview,
                    Application = application,
                    Candidate = candidate,
                    Job = job
                };

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                interviewsQuery = interviewsQuery.Where(x =>
                    x.Candidate.FullName.Contains(search) ||
                    x.Candidate.Email.Contains(search) ||
                    x.Job.Title.Contains(search) ||
                    x.Interview.InterviewerName.Contains(search) ||
                    x.Interview.InterviewerEmail.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.InterviewType))
            {
                interviewsQuery = interviewsQuery.Where(x =>
                    x.Interview.InterviewType ==
                    query.InterviewType);
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                interviewsQuery = interviewsQuery.Where(x =>
                    x.Interview.Status ==
                    query.Status);
            }

            if (query.FromDate.HasValue)
            {
                var fromDate =
                    query.FromDate.Value.Date;

                interviewsQuery = interviewsQuery.Where(x =>
                    x.Interview.ScheduledAt >= fromDate);
            }

            if (query.ToDate.HasValue)
            {
                var toDate =
                    query.ToDate.Value.Date.AddDays(1);

                interviewsQuery = interviewsQuery.Where(x =>
                    x.Interview.ScheduledAt < toDate);
            }

            var totalRecords =
                await interviewsQuery.CountAsync();

            var pageNumber =
                query.PageNumber < 1
                    ? 1
                    : query.PageNumber;

            var pageSize =
                query.PageSize < 1
                    ? 10
                    : query.PageSize;

            if (pageSize > 100)
            {
                pageSize = 100;
            }

            var totalPages =
                totalRecords == 0
                    ? 1
                    : (int)Math.Ceiling(
                        totalRecords / (double)pageSize);

            if (pageNumber > totalPages)
            {
                pageNumber = totalPages;
            }

            var interviews =
                await interviewsQuery
                    .OrderBy(x => x.Interview.ScheduledAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => new RecruiterInterviewDto
                    {
                        Id = x.Interview.Id,

                        ApplicationId =
                            x.Interview.ApplicationId,

                        CandidateId =
                            x.Candidate.Id,

                        CandidateName =
                            x.Candidate.FullName,

                        CandidateEmail =
                            x.Candidate.Email,

                        JobId =
                            x.Job.Id,

                        JobTitle =
                            x.Job.Title,

                        InterviewType =
                            x.Interview.InterviewType,

                        ScheduledAt =
                            x.Interview.ScheduledAt,

                        DurationMinutes =
                            x.Interview.DurationMinutes,

                        MeetingLink =
                            x.Interview.MeetingLink,

                        Location =
                            x.Interview.Location,

                        InterviewerName =
                            x.Interview.InterviewerName,

                        InterviewerEmail =
                            x.Interview.InterviewerEmail,

                        Status =
                            x.Interview.Status,

                        Notes =
                            x.Interview.Notes,

                        CreatedAt =
                            x.Interview.CreatedAt,

                        UpdatedAt =
                            x.Interview.UpdatedAt
                    })
                    .ToListAsync();

            return new RecruiterInterviewListDto
            {
                Interviews = interviews,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<RecruiterInterviewDto?> GetInterviewByIdAsync(
            int recruiterId,
            int interviewId)
        {
            var result =
                await (
                    from interview in _context.Interviews
                    join application in _context.Applications
                        on interview.ApplicationId equals application.Id
                    join candidate in _context.Users
                        on application.CandidateId equals candidate.Id
                    join job in _context.Jobs
                        on application.JobId equals job.Id
                    where interview.Id == interviewId &&
                          interview.RecruiterId == recruiterId
                    select new RecruiterInterviewDto
                    {
                        Id = interview.Id,

                        ApplicationId =
                            interview.ApplicationId,

                        CandidateId =
                            candidate.Id,

                        CandidateName =
                            candidate.FullName,

                        CandidateEmail =
                            candidate.Email,

                        JobId =
                            job.Id,

                        JobTitle =
                            job.Title,

                        InterviewType =
                            interview.InterviewType,

                        ScheduledAt =
                            interview.ScheduledAt,

                        DurationMinutes =
                            interview.DurationMinutes,

                        MeetingLink =
                            interview.MeetingLink,

                        Location =
                            interview.Location,

                        InterviewerName =
                            interview.InterviewerName,

                        InterviewerEmail =
                            interview.InterviewerEmail,

                        Status =
                            interview.Status,

                        Notes =
                            interview.Notes,

                        CreatedAt =
                            interview.CreatedAt,

                        UpdatedAt =
                            interview.UpdatedAt
                    }
                )
                .FirstOrDefaultAsync();

            return result;
        }

        public async Task<RecruiterInterviewDto> CreateInterviewAsync(
            int recruiterId,
            CreateInterviewDto request)
        {
            ValidateInterviewType(request.InterviewType);

            if (request.ScheduledAt <= DateTime.Now)
            {
                throw new InvalidOperationException(
                    "Interview date and time must be in the future.");
            }

            var application =
                await (
                    from app in _context.Applications
                    join job in _context.Jobs
                        on app.JobId equals job.Id
                    join candidate in _context.Users
                        on app.CandidateId equals candidate.Id
                    where app.Id == request.ApplicationId &&
                          job.RecruiterId == recruiterId
                    select new
                    {
                        Application = app,
                        Job = job,
                        Candidate = candidate
                    }
                )
                .FirstOrDefaultAsync();

            if (application == null)
            {
                throw new InvalidOperationException(
                    "Application not found or does not belong to this recruiter.");
            }

            if (!application.Candidate.IsActive)
            {
                throw new InvalidOperationException(
                    "The candidate account is inactive.");
            }

            var validStages = new[]
            {
                "Assessment",
                "Interview",
                "Selected",
                "Offer"
            };

            if (!validStages.Contains(
                application.Application.CurrentStage))
            {
                throw new InvalidOperationException(
                    "Interview can only be scheduled for candidates who have reached the appropriate recruitment stage.");
            }

            var conflictingInterview =
                await _context.Interviews.AnyAsync(i =>
                    i.ApplicationId ==
                    request.ApplicationId &&
                    i.Status != "Cancelled" &&
                    i.Status != "No Show" &&
                    i.ScheduledAt == request.ScheduledAt);

            if (conflictingInterview)
            {
                throw new InvalidOperationException(
                    "An interview already exists for this candidate at the selected time.");
            }

            var interview = new Interview
            {
                ApplicationId =
                    request.ApplicationId,

                RecruiterId =
                    recruiterId,

                InterviewType =
                    request.InterviewType.Trim(),

                ScheduledAt =
                    request.ScheduledAt,

                DurationMinutes =
                    request.DurationMinutes,

                MeetingLink =
                    request.MeetingLink?.Trim() ?? string.Empty,

                Location =
                    request.Location?.Trim() ?? string.Empty,

                InterviewerName =
                    request.InterviewerName?.Trim() ?? string.Empty,

                InterviewerEmail =
                    request.InterviewerEmail?.Trim() ?? string.Empty,

                Status =
                    "Scheduled",

                Notes =
                    request.Notes?.Trim() ?? string.Empty,

                CreatedAt =
                    DateTime.UtcNow
            };

            _context.Interviews.Add(interview);

            await _context.SaveChangesAsync();

            return await GetInterviewByIdAsync(
                recruiterId,
                interview.Id
            ) ?? throw new InvalidOperationException(
                "Interview was created but could not be retrieved.");
        }

        public async Task<RecruiterInterviewDto?> EditInterviewAsync(
            int recruiterId,
            int interviewId,
            EditInterviewDto request)
        {
            ValidateInterviewType(request.InterviewType);

            if (request.ScheduledAt <= DateTime.Now)
            {
                throw new InvalidOperationException(
                    "Interview date and time must be in the future.");
            }

            var interview =
                await _context.Interviews
                    .FirstOrDefaultAsync(i =>
                        i.Id == interviewId &&
                        i.RecruiterId == recruiterId);

            if (interview == null)
            {
                return null;
            }

            if (interview.Status == "Completed" ||
                interview.Status == "Cancelled" ||
                interview.Status == "No Show")
            {
                throw new InvalidOperationException(
                    "Completed, cancelled, or no-show interviews cannot be edited.");
            }

            var application =
                await (
                    from app in _context.Applications
                    join job in _context.Jobs
                        on app.JobId equals job.Id
                    join candidate in _context.Users
                        on app.CandidateId equals candidate.Id
                    where app.Id == request.ApplicationId &&
                          job.RecruiterId == recruiterId
                    select new
                    {
                        Application = app,
                        Candidate = candidate
                    }
                )
                .FirstOrDefaultAsync();

            if (application == null)
            {
                throw new InvalidOperationException(
                    "Application not found or does not belong to this recruiter.");
            }

            var conflictingInterview =
                await _context.Interviews.AnyAsync(i =>
                    i.Id != interviewId &&
                    i.ApplicationId ==
                        request.ApplicationId &&
                    i.Status != "Cancelled" &&
                    i.Status != "No Show" &&
                    i.ScheduledAt ==
                        request.ScheduledAt);

            if (conflictingInterview)
            {
                throw new InvalidOperationException(
                    "Another interview already exists for this candidate at the selected time.");
            }

            interview.ApplicationId =
                request.ApplicationId;

            interview.InterviewType =
                request.InterviewType.Trim();

            interview.ScheduledAt =
                request.ScheduledAt;

            interview.DurationMinutes =
                request.DurationMinutes;

            interview.MeetingLink =
                request.MeetingLink?.Trim() ?? string.Empty;

            interview.Location =
                request.Location?.Trim() ?? string.Empty;

            interview.InterviewerName =
                request.InterviewerName?.Trim() ?? string.Empty;

            interview.InterviewerEmail =
                request.InterviewerEmail?.Trim() ?? string.Empty;

            interview.Notes =
                request.Notes?.Trim() ?? string.Empty;

            interview.Status =
                "Rescheduled";

            interview.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetInterviewByIdAsync(
                recruiterId,
                interviewId
            );
        }

        public async Task<bool> DeleteInterviewAsync(
            int recruiterId,
            int interviewId)
        {
            var interview =
                await _context.Interviews
                    .FirstOrDefaultAsync(i =>
                        i.Id == interviewId &&
                        i.RecruiterId == recruiterId);

            if (interview == null)
            {
                return false;
            }

            if (interview.Status == "Completed")
            {
                throw new InvalidOperationException(
                    "Completed interviews cannot be deleted.");
            }

            _context.Interviews.Remove(interview);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateInterviewStatusAsync(
            int recruiterId,
            int interviewId,
            string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new InvalidOperationException(
                    "Interview status is required.");
            }

            var normalizedStatus =
                status.Trim();

            if (!ValidStatuses.Contains(
                normalizedStatus))
            {
                throw new InvalidOperationException(
                    "Invalid interview status.");
            }

            var interview =
                await _context.Interviews
                    .FirstOrDefaultAsync(i =>
                        i.Id == interviewId &&
                        i.RecruiterId == recruiterId);

            if (interview == null)
            {
                return false;
            }

            if (interview.Status == "Completed" &&
                normalizedStatus != "Completed")
            {
                throw new InvalidOperationException(
                    "A completed interview cannot be moved to another status.");
            }

            interview.Status =
                normalizedStatus;

            interview.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        private static void ValidateInterviewType(
            string interviewType)
        {
            if (string.IsNullOrWhiteSpace(
                interviewType))
            {
                throw new InvalidOperationException(
                    "Interview type is required.");
            }

            if (!ValidInterviewTypes.Contains(
                interviewType.Trim()))
            {
                throw new InvalidOperationException(
                    "Invalid interview type.");
            }
        }
    }
}