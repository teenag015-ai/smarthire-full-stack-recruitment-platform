using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Jobs;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterJobService : IRecruiterJobService
    {
        private readonly ApplicationDbContext _context;

        public RecruiterJobService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RecruiterJobListDto> GetJobsAsync(
            int recruiterId,
            RecruiterJobQueryDto query)
        {
            var jobsQuery = _context.Jobs
                .AsNoTracking()
                .Where(j => j.RecruiterId == recruiterId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                jobsQuery = jobsQuery.Where(j =>
                    j.Title.Contains(search) ||
                    j.Location.Contains(search) ||
                    j.Description.Contains(search));
            }

            if (query.DepartmentId.HasValue)
            {
                jobsQuery = jobsQuery.Where(j =>
                    j.DepartmentId == query.DepartmentId.Value);
            }

            if (query.JobCategoryId.HasValue)
            {
                jobsQuery = jobsQuery.Where(j =>
                    j.JobCategoryId == query.JobCategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.EmploymentType))
            {
                jobsQuery = jobsQuery.Where(j =>
                    j.EmploymentType == query.EmploymentType);
            }

            if (query.IsActive.HasValue)
            {
                jobsQuery = jobsQuery.Where(j =>
                    j.IsActive == query.IsActive.Value);
            }

            var totalRecords = await jobsQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var jobs = await jobsQuery
                .OrderByDescending(j => j.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new RecruiterJobDto
                {
                    Id = j.Id,
                    Title = j.Title,

                    DepartmentId = j.DepartmentId,
                    DepartmentName = _context.Departments
                        .Where(d => d.Id == j.DepartmentId)
                        .Select(d => d.Name)
                        .FirstOrDefault() ?? string.Empty,

                    JobCategoryId = j.JobCategoryId,
                    JobCategoryName = _context.JobCategories
                        .Where(c => c.Id == j.JobCategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault() ?? string.Empty,

                    RecruiterId = j.RecruiterId,
                    RecruiterName = _context.Users
                        .Where(u => u.Id == j.RecruiterId)
                        .Select(u => u.FullName)
                        .FirstOrDefault() ?? string.Empty,

                    Location = j.Location,
                    EmploymentType = j.EmploymentType,
                    ExperienceLevel = j.ExperienceLevel,

                    MinimumSalary = j.MinimumSalary,
                    MaximumSalary = j.MaximumSalary,

                    RequiredSkills = j.RequiredSkills,
                    Description = j.Description,
                    Responsibilities = j.Responsibilities,
                    Requirements = j.Requirements,

                    ApplicationDeadline = j.ApplicationDeadline,

                    IsActive = j.IsActive,
                    CreatedAt = j.CreatedAt,
                    UpdatedAt = j.UpdatedAt
                })
                .ToListAsync();

            return new RecruiterJobListDto
            {
                Jobs = jobs,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<RecruiterJobDto?> GetJobByIdAsync(
            int recruiterId,
            int id)
        {
            var job = await _context.Jobs
                .AsNoTracking()
                .FirstOrDefaultAsync(j =>
                    j.Id == id &&
                    j.RecruiterId == recruiterId);

            if (job == null)
            {
                return null;
            }

            return await MapToDtoAsync(job);
        }

        public async Task<RecruiterJobDto> CreateJobAsync(
            int recruiterId,
            CreateJobDto request)
        {
            var recruiter = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == recruiterId &&
                    u.Role == "Recruiter" &&
                    u.IsActive);

            if (recruiter == null)
            {
                throw new InvalidOperationException(
                    "Recruiter account was not found or is inactive.");
            }

            var departmentExists = await _context.Departments
                .AnyAsync(d =>
                    d.Id == request.DepartmentId &&
                    d.IsActive);

            if (!departmentExists)
            {
                throw new InvalidOperationException(
                    "Selected department was not found or is inactive.");
            }

            var categoryExists = await _context.JobCategories
                .AnyAsync(c =>
                    c.Id == request.JobCategoryId &&
                    c.IsActive);

            if (!categoryExists)
            {
                throw new InvalidOperationException(
                    "Selected job category was not found or is inactive.");
            }

            if (request.ApplicationDeadline.Date < DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Application deadline cannot be in the past.");
            }

            if (request.MinimumSalary.HasValue &&
                request.MaximumSalary.HasValue &&
                request.MinimumSalary.Value >
                request.MaximumSalary.Value)
            {
                throw new InvalidOperationException(
                    "Minimum salary cannot be greater than maximum salary.");
            }

            var job = new Job
            {
                Title = request.Title.Trim(),

                DepartmentId = request.DepartmentId,

                JobCategoryId = request.JobCategoryId,

                RecruiterId = recruiterId,

                Location = request.Location.Trim(),

                EmploymentType =
                    request.EmploymentType.Trim(),

                ExperienceLevel =
                    request.ExperienceLevel?.Trim() ?? string.Empty,

                MinimumSalary = request.MinimumSalary,

                MaximumSalary = request.MaximumSalary,

                RequiredSkills =
                    request.RequiredSkills?.Trim() ?? string.Empty,

                Description = request.Description.Trim(),

                Responsibilities =
                    request.Responsibilities?.Trim() ?? string.Empty,

                Requirements =
                    request.Requirements?.Trim() ?? string.Empty,

                ApplicationDeadline =
                    request.ApplicationDeadline,

                IsActive = true,

                CreatedAt = DateTime.UtcNow
            };

            _context.Jobs.Add(job);

            await _context.SaveChangesAsync();

            return await MapToDtoAsync(job);
        }

        public async Task<RecruiterJobDto?> EditJobAsync(
            int recruiterId,
            int id,
            EditJobDto request)
        {
            var job = await _context.Jobs
                .FirstOrDefaultAsync(j =>
                    j.Id == id &&
                    j.RecruiterId == recruiterId);

            if (job == null)
            {
                return null;
            }

            var departmentExists = await _context.Departments
                .AnyAsync(d =>
                    d.Id == request.DepartmentId &&
                    d.IsActive);

            if (!departmentExists)
            {
                throw new InvalidOperationException(
                    "Selected department was not found or is inactive.");
            }

            var categoryExists = await _context.JobCategories
                .AnyAsync(c =>
                    c.Id == request.JobCategoryId &&
                    c.IsActive);

            if (!categoryExists)
            {
                throw new InvalidOperationException(
                    "Selected job category was not found or is inactive.");
            }

            if (request.ApplicationDeadline.Date < DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Application deadline cannot be in the past.");
            }

            if (request.MinimumSalary.HasValue &&
                request.MaximumSalary.HasValue &&
                request.MinimumSalary.Value >
                request.MaximumSalary.Value)
            {
                throw new InvalidOperationException(
                    "Minimum salary cannot be greater than maximum salary.");
            }

            job.Title = request.Title.Trim();

            job.DepartmentId = request.DepartmentId;

            job.JobCategoryId = request.JobCategoryId;

            job.Location = request.Location.Trim();

            job.EmploymentType =
                request.EmploymentType.Trim();

            job.ExperienceLevel =
                request.ExperienceLevel?.Trim() ?? string.Empty;

            job.MinimumSalary = request.MinimumSalary;

            job.MaximumSalary = request.MaximumSalary;

            job.RequiredSkills =
                request.RequiredSkills?.Trim() ?? string.Empty;

            job.Description =
                request.Description.Trim();

            job.Responsibilities =
                request.Responsibilities?.Trim() ?? string.Empty;

            job.Requirements =
                request.Requirements?.Trim() ?? string.Empty;

            job.ApplicationDeadline =
                request.ApplicationDeadline;

            job.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await MapToDtoAsync(job);
        }

        public async Task<bool> DeleteJobAsync(
            int recruiterId,
            int id)
        {
            var job = await _context.Jobs
                .FirstOrDefaultAsync(j =>
                    j.Id == id &&
                    j.RecruiterId == recruiterId);

            if (job == null)
            {
                return false;
            }

            _context.Jobs.Remove(job);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateJobStatusAsync(
            int recruiterId,
            int id,
            bool isActive)
        {
            var job = await _context.Jobs
                .FirstOrDefaultAsync(j =>
                    j.Id == id &&
                    j.RecruiterId == recruiterId);

            if (job == null)
            {
                return false;
            }

            job.IsActive = isActive;

            job.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<RecruiterJobDto> MapToDtoAsync(
            Job job)
        {
            var departmentName = await _context.Departments
                .Where(d => d.Id == job.DepartmentId)
                .Select(d => d.Name)
                .FirstOrDefaultAsync();

            var categoryName = await _context.JobCategories
                .Where(c => c.Id == job.JobCategoryId)
                .Select(c => c.Name)
                .FirstOrDefaultAsync();

            var recruiterName = await _context.Users
                .Where(u => u.Id == job.RecruiterId)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync();

            return new RecruiterJobDto
            {
                Id = job.Id,

                Title = job.Title,

                DepartmentId = job.DepartmentId,

                DepartmentName =
                    departmentName ?? string.Empty,

                JobCategoryId = job.JobCategoryId,

                JobCategoryName =
                    categoryName ?? string.Empty,

                RecruiterId = job.RecruiterId,

                RecruiterName =
                    recruiterName ?? string.Empty,

                Location = job.Location,

                EmploymentType =
                    job.EmploymentType,

                ExperienceLevel =
                    job.ExperienceLevel,

                MinimumSalary =
                    job.MinimumSalary,

                MaximumSalary =
                    job.MaximumSalary,

                RequiredSkills =
                    job.RequiredSkills,

                Description =
                    job.Description,

                Responsibilities =
                    job.Responsibilities,

                Requirements =
                    job.Requirements,

                ApplicationDeadline =
                    job.ApplicationDeadline,

                IsActive =
                    job.IsActive,

                CreatedAt =
                    job.CreatedAt,

                UpdatedAt =
                    job.UpdatedAt
            };
        }
    }
}