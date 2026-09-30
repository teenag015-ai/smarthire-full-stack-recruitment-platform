using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Applicants;
using HiringProjectNew.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterApplicantService : IRecruiterApplicantService
    {
        private readonly ApplicationDbContext _context;

        public RecruiterApplicantService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecruiterApplicantListDto> GetApplicantsAsync(
            int recruiterId,
            RecruiterApplicantQueryDto query)
        {
            var recruiterExists = await _context.Users
                .AnyAsync(u =>
                    u.Id == recruiterId &&
                    u.Role == "Recruiter" &&
                    u.IsActive);

            if (!recruiterExists)
            {
                return new RecruiterApplicantListDto
                {
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize
                };
            }

            var applicantsQuery =
                from application in _context.Applications

                join candidate in _context.Users
                    on application.CandidateId equals candidate.Id

                join job in _context.Jobs
                    on application.JobId equals job.Id

                where job.RecruiterId == recruiterId

                select new
                {
                    Application = application,
                    Candidate = candidate,
                    Job = job
                };

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                applicantsQuery = applicantsQuery.Where(x =>
                    x.Candidate.FullName.Contains(search) ||
                    x.Candidate.Email.Contains(search) ||
                    x.Job.Title.Contains(search));
            }

            if (query.JobId.HasValue)
            {
                applicantsQuery = applicantsQuery.Where(x =>
                    x.Application.JobId == query.JobId.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.CurrentStage))
            {
                applicantsQuery = applicantsQuery.Where(x =>
                    x.Application.CurrentStage ==
                    query.CurrentStage);
            }

            if (query.IsActive.HasValue)
            {
                applicantsQuery = applicantsQuery.Where(x =>
                    x.Application.IsActive ==
                    query.IsActive.Value);
            }

            var totalRecords =
                await applicantsQuery.CountAsync();

            var pageNumber =
                query.PageNumber < 1
                    ? 1
                    : query.PageNumber;

            var pageSize =
                query.PageSize < 1
                    ? 10
                    : query.PageSize;

            var applicants = await applicantsQuery
                .OrderByDescending(x =>
                    x.Application.AppliedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new RecruiterApplicantDto
                {
                    ApplicationId = x.Application.Id,

                    CandidateId = x.Application.CandidateId,

                    CandidateName = x.Candidate.FullName,

                    CandidateEmail = x.Candidate.Email,

                    JobId = x.Application.JobId,

                    JobTitle = x.Job.Title,

                    CurrentStage = x.Application.CurrentStage,

                    CoverLetter = x.Application.CoverLetter,

                    AppliedAt = x.Application.AppliedAt,

                    UpdatedAt = x.Application.UpdatedAt,

                    IsActive = x.Application.IsActive
                })
                .ToListAsync();

            var totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize);

            return new RecruiterApplicantListDto
            {
                Applicants = applicants,

                TotalRecords = totalRecords,

                PageNumber = pageNumber,

                PageSize = pageSize,

                TotalPages = totalPages
            };
        }

        public async Task<RecruiterApplicantDto?> GetApplicantByIdAsync(
            int recruiterId,
            int applicationId)
        {
            var applicant =
                await (
                    from application in _context.Applications

                    join candidate in _context.Users
                        on application.CandidateId equals candidate.Id

                    join job in _context.Jobs
                        on application.JobId equals job.Id

                    where application.Id == applicationId
                          && job.RecruiterId == recruiterId

                    select new RecruiterApplicantDto
                    {
                        ApplicationId = application.Id,

                        CandidateId = application.CandidateId,

                        CandidateName = candidate.FullName,

                        CandidateEmail = candidate.Email,

                        JobId = application.JobId,

                        JobTitle = job.Title,

                        CurrentStage = application.CurrentStage,

                        CoverLetter = application.CoverLetter,

                        AppliedAt = application.AppliedAt,

                        UpdatedAt = application.UpdatedAt,

                        IsActive = application.IsActive
                    }
                )
                .FirstOrDefaultAsync();

            return applicant;
        }

        public async Task<bool> UpdateApplicationStageAsync(
            int recruiterId,
            int applicationId,
            string stage)
        {
            var allowedStages = new[]
            {
                "Applied",
                "Screening",
                "Shortlisted",
                "Assessment",
                "Interview",
                "Selected",
                "Offer",
                "Hired",
                "Rejected"
            };

            if (string.IsNullOrWhiteSpace(stage) ||
                !allowedStages.Contains(stage))
            {
                throw new InvalidOperationException(
                    "Invalid application stage.");
            }

            var application =
                await (
                    from app in _context.Applications

                    join job in _context.Jobs
                        on app.JobId equals job.Id

                    where app.Id == applicationId
                          && job.RecruiterId == recruiterId

                    select app
                )
                .FirstOrDefaultAsync();

            if (application == null)
            {
                return false;
            }

            application.CurrentStage = stage.Trim();

            application.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}