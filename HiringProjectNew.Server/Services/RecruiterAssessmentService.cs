using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Assessments;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterAssessmentService
        : IRecruiterAssessmentService
    {
        private readonly ApplicationDbContext _context;

        public RecruiterAssessmentService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecruiterAssessmentListDto>
            GetAssessmentsAsync(
                int recruiterId,
                RecruiterAssessmentQueryDto query)
        {
            var assessmentsQuery =
                from assessment in _context.Assessments

                join job in _context.Jobs
                    on assessment.JobId equals job.Id

                join recruiter in _context.Users
                    on assessment.RecruiterId equals recruiter.Id

                where assessment.RecruiterId == recruiterId

                select new
                {
                    Assessment = assessment,
                    Job = job,
                    Recruiter = recruiter
                };

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                assessmentsQuery =
                    assessmentsQuery.Where(x =>
                        x.Assessment.Title.Contains(search) ||
                        x.Assessment.Description.Contains(search) ||
                        x.Job.Title.Contains(search));
            }

            if (query.JobId.HasValue)
            {
                assessmentsQuery =
                    assessmentsQuery.Where(x =>
                        x.Assessment.JobId ==
                        query.JobId.Value);
            }

            if (query.IsActive.HasValue)
            {
                assessmentsQuery =
                    assessmentsQuery.Where(x =>
                        x.Assessment.IsActive ==
                        query.IsActive.Value);
            }

            var totalRecords =
                await assessmentsQuery.CountAsync();

            var pageNumber =
                query.PageNumber < 1
                    ? 1
                    : query.PageNumber;

            var pageSize =
                query.PageSize < 1
                    ? 10
                    : query.PageSize;

            var assessments =
                await assessmentsQuery
                    .OrderByDescending(x =>
                        x.Assessment.CreatedAt)
                    .Skip(
                        (pageNumber - 1) *
                        pageSize)
                    .Take(pageSize)
                    .Select(x =>
                        new RecruiterAssessmentDto
                        {
                            Id =
                                x.Assessment.Id,

                            Title =
                                x.Assessment.Title,

                            Description =
                                x.Assessment.Description,

                            JobId =
                                x.Assessment.JobId,

                            JobTitle =
                                x.Job.Title,

                            RecruiterId =
                                x.Assessment.RecruiterId,

                            RecruiterName =
                                x.Recruiter.FullName,

                            DurationMinutes =
                                x.Assessment.DurationMinutes,

                            PassingScore =
                                x.Assessment.PassingScore,

                            IsActive =
                                x.Assessment.IsActive,

                            CreatedAt =
                                x.Assessment.CreatedAt,

                            UpdatedAt =
                                x.Assessment.UpdatedAt
                        })
                    .ToListAsync();

            var totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize);

            return new RecruiterAssessmentListDto
            {
                Assessments = assessments,

                TotalRecords = totalRecords,

                PageNumber = pageNumber,

                PageSize = pageSize,

                TotalPages = totalPages
            };
        }

        public async Task<RecruiterAssessmentDto?>
            GetAssessmentByIdAsync(
                int recruiterId,
                int id)
        {
            var assessment =
                await (
                    from a in _context.Assessments

                    join job in _context.Jobs
                        on a.JobId equals job.Id

                    join recruiter in _context.Users
                        on a.RecruiterId equals recruiter.Id

                    where a.Id == id &&
                          a.RecruiterId == recruiterId

                    select new RecruiterAssessmentDto
                    {
                        Id = a.Id,

                        Title = a.Title,

                        Description = a.Description,

                        JobId = a.JobId,

                        JobTitle = job.Title,

                        RecruiterId = a.RecruiterId,

                        RecruiterName =
                            recruiter.FullName,

                        DurationMinutes =
                            a.DurationMinutes,

                        PassingScore =
                            a.PassingScore,

                        IsActive =
                            a.IsActive,

                        CreatedAt =
                            a.CreatedAt,

                        UpdatedAt =
                            a.UpdatedAt
                    }
                )
                .FirstOrDefaultAsync();

            return assessment;
        }

        public async Task<RecruiterAssessmentDto>
            CreateAssessmentAsync(
                int recruiterId,
                CreateAssessmentDto request)
        {
            var recruiter =
                await _context.Users
                    .FirstOrDefaultAsync(u =>
                        u.Id == recruiterId &&
                        u.Role == "Recruiter" &&
                        u.IsActive);

            if (recruiter == null)
            {
                throw new InvalidOperationException(
                    "Recruiter account is not active or does not exist.");
            }

            var job =
                await _context.Jobs
                    .FirstOrDefaultAsync(j =>
                        j.Id == request.JobId &&
                        j.RecruiterId == recruiterId &&
                        j.IsActive);

            if (job == null)
            {
                throw new InvalidOperationException(
                    "Job not found, inactive, or does not belong to this recruiter.");
            }

            if (request.PassingScore > 100)
            {
                throw new InvalidOperationException(
                    "Passing score cannot be greater than 100.");
            }

            var assessment = new Assessment
            {
                Title = request.Title.Trim(),

                Description =
                    request.Description?.Trim() ??
                    string.Empty,

                JobId = request.JobId,

                RecruiterId = recruiterId,

                DurationMinutes =
                    request.DurationMinutes,

                PassingScore =
                    request.PassingScore,

                IsActive = true,

                CreatedAt = DateTime.UtcNow
            };

            _context.Assessments.Add(assessment);

            await _context.SaveChangesAsync();

            return new RecruiterAssessmentDto
            {
                Id = assessment.Id,

                Title = assessment.Title,

                Description = assessment.Description,

                JobId = assessment.JobId,

                JobTitle = job.Title,

                RecruiterId =
                    assessment.RecruiterId,

                RecruiterName =
                    recruiter.FullName,

                DurationMinutes =
                    assessment.DurationMinutes,

                PassingScore =
                    assessment.PassingScore,

                IsActive =
                    assessment.IsActive,

                CreatedAt =
                    assessment.CreatedAt,

                UpdatedAt =
                    assessment.UpdatedAt
            };
        }

        public async Task<RecruiterAssessmentDto?>
            EditAssessmentAsync(
                int recruiterId,
                int id,
                EditAssessmentDto request)
        {
            var assessment =
                await _context.Assessments
                    .FirstOrDefaultAsync(a =>
                        a.Id == id &&
                        a.RecruiterId == recruiterId);

            if (assessment == null)
            {
                return null;
            }

            var job =
                await _context.Jobs
                    .FirstOrDefaultAsync(j =>
                        j.Id == request.JobId &&
                        j.RecruiterId == recruiterId &&
                        j.IsActive);

            if (job == null)
            {
                throw new InvalidOperationException(
                    "Job not found, inactive, or does not belong to this recruiter.");
            }

            if (request.PassingScore > 100)
            {
                throw new InvalidOperationException(
                    "Passing score cannot be greater than 100.");
            }

            assessment.Title =
                request.Title.Trim();

            assessment.Description =
                request.Description?.Trim() ??
                string.Empty;

            assessment.JobId =
                request.JobId;

            assessment.DurationMinutes =
                request.DurationMinutes;

            assessment.PassingScore =
                request.PassingScore;

            assessment.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var recruiter =
                await _context.Users
                    .FirstAsync(u =>
                        u.Id == recruiterId);

            return new RecruiterAssessmentDto
            {
                Id = assessment.Id,

                Title = assessment.Title,

                Description =
                    assessment.Description,

                JobId = assessment.JobId,

                JobTitle = job.Title,

                RecruiterId =
                    assessment.RecruiterId,

                RecruiterName =
                    recruiter.FullName,

                DurationMinutes =
                    assessment.DurationMinutes,

                PassingScore =
                    assessment.PassingScore,

                IsActive =
                    assessment.IsActive,

                CreatedAt =
                    assessment.CreatedAt,

                UpdatedAt =
                    assessment.UpdatedAt
            };
        }

        public async Task<bool>
            DeleteAssessmentAsync(
                int recruiterId,
                int id)
        {
            var assessment =
                await _context.Assessments
                    .FirstOrDefaultAsync(a =>
                        a.Id == id &&
                        a.RecruiterId == recruiterId);

            if (assessment == null)
            {
                return false;
            }

            _context.Assessments.Remove(assessment);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool>
            UpdateAssessmentStatusAsync(
                int recruiterId,
                int id,
                bool isActive)
        {
            var assessment =
                await _context.Assessments
                    .FirstOrDefaultAsync(a =>
                        a.Id == id &&
                        a.RecruiterId == recruiterId);

            if (assessment == null)
            {
                return false;
            }

            assessment.IsActive = isActive;

            assessment.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}