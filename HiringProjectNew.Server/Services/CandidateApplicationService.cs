using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Candidate.Applications;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class CandidateApplicationService
        : ICandidateApplicationService
    {
        private readonly ApplicationDbContext _context;

        public CandidateApplicationService(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // =====================================================
        // APPLY FOR JOB
        // =====================================================

        public async Task<bool> ApplyForJobAsync(
            int candidateId,
            CreateApplicationDto request)
        {
            if (request == null)
            {
                throw new InvalidOperationException(
                    "Application details are required.");
            }

            if (request.JobId <= 0)
            {
                throw new InvalidOperationException(
                    "A valid job is required.");
            }


            // -------------------------------------------------
            // CHECK CANDIDATE
            // -------------------------------------------------

            var candidate =
                await _context.Users
                    .FirstOrDefaultAsync(u =>
                        u.Id == candidateId &&
                        u.Role == "Candidate" &&
                        u.IsActive);

            if (candidate == null)
            {
                throw new InvalidOperationException(
                    "Candidate account is not active or does not exist.");
            }


            // -------------------------------------------------
            // CHECK JOB
            // -------------------------------------------------

            var job =
                await _context.Jobs
                    .FirstOrDefaultAsync(j =>
                        j.Id == request.JobId &&
                        j.IsActive);

            if (job == null)
            {
                throw new InvalidOperationException(
                    "Job not found or is no longer active.");
            }


            // -------------------------------------------------
            // CHECK APPLICATION DEADLINE
            // -------------------------------------------------

            if (job.ApplicationDeadline < DateTime.UtcNow)
            {
                throw new InvalidOperationException(
                    "The application deadline for this job has passed.");
            }


            // -------------------------------------------------
            // CHECK DUPLICATE APPLICATION
            // -------------------------------------------------

            var alreadyApplied =
                await _context.Applications
                    .AnyAsync(a =>
                        a.CandidateId == candidateId &&
                        a.JobId == request.JobId &&
                        a.IsActive);

            if (alreadyApplied)
            {
                throw new InvalidOperationException(
                    "You have already applied for this job.");
            }


            // -------------------------------------------------
            // VALIDATE COVER LETTER
            // -------------------------------------------------

            var coverLetter =
                request.CoverLetter?.Trim();

            if (coverLetter != null &&
                coverLetter.Length > 1000)
            {
                throw new InvalidOperationException(
                    "Cover letter cannot exceed 1000 characters.");
            }


            // -------------------------------------------------
            // CREATE APPLICATION
            // -------------------------------------------------

            var application = new Application
            {
                CandidateId = candidateId,

                JobId = request.JobId,

                CurrentStage = "Applied",

                CoverLetter =
                    string.IsNullOrWhiteSpace(coverLetter)
                        ? null
                        : coverLetter,

                AppliedAt = DateTime.UtcNow,

                UpdatedAt = null,

                IsActive = true
            };

            _context.Applications.Add(application);

            await _context.SaveChangesAsync();

            return true;
        }


        // =====================================================
        // GET CANDIDATE APPLICATIONS
        // =====================================================

        public async Task<List<CandidateApplicationListDto>>
            GetCandidateApplicationsAsync(
                int candidateId)
        {
            // -------------------------------------------------
            // CHECK CANDIDATE
            // -------------------------------------------------

            var candidateExists =
                await _context.Users
                    .AnyAsync(u =>
                        u.Id == candidateId &&
                        u.Role == "Candidate" &&
                        u.IsActive);

            if (!candidateExists)
            {
                throw new InvalidOperationException(
                    "Candidate account is not active or does not exist.");
            }


            // -------------------------------------------------
            // GET APPLICATIONS
            // -------------------------------------------------

            var applications =
                await _context.Applications
                    .Where(a =>
                        a.CandidateId == candidateId &&
                        a.IsActive)

                    // -------------------------------------------------
                    // JOIN JOB
                    // -------------------------------------------------

                    .Join(
                        _context.Jobs,

                        application =>
                            application.JobId,

                        job =>
                            job.Id,

                        (application, job) => new
                        {
                            Application = application,
                            Job = job
                        })

                    // -------------------------------------------------
                    // JOIN DEPARTMENT
                    // -------------------------------------------------

                    .Join(
                        _context.Departments,

                        combined =>
                            combined.Job.DepartmentId,

                        department =>
                            department.Id,

                        (combined, department) => new
                        {
                            combined.Application,
                            combined.Job,
                            Department = department
                        })

                    // -------------------------------------------------
                    // JOIN JOB CATEGORY
                    // -------------------------------------------------

                    .Join(
                        _context.JobCategories,

                        combined =>
                            combined.Job.JobCategoryId,

                        category =>
                            category.Id,

                        (combined, category) =>
                            new CandidateApplicationListDto
                            {
                                ApplicationId =
                                    combined.Application.Id,

                                JobId =
                                    combined.Job.Id,

                                JobTitle =
                                    combined.Job.Title,

                                DepartmentName =
                                    combined.Department.Name,

                                JobCategoryName =
                                    category.Name,

                                Location =
                                    combined.Job.Location,

                                EmploymentType =
                                    combined.Job.EmploymentType,

                                ExperienceLevel =
                                    combined.Job.ExperienceLevel,

                                MinimumSalary =
                                    combined.Job.MinimumSalary,

                                MaximumSalary =
                                    combined.Job.MaximumSalary,

                                CurrentStage =
                                    combined.Application.CurrentStage,

                                CoverLetter =
                                    combined.Application.CoverLetter,

                                AppliedAt =
                                    combined.Application.AppliedAt,

                                UpdatedAt =
                                    combined.Application.UpdatedAt,

                                IsActive =
                                    combined.Application.IsActive,

                                ApplicationDeadline =
                                    combined.Job.ApplicationDeadline
                            })

                    // -------------------------------------------------
                    // NEWEST APPLICATION FIRST
                    // -------------------------------------------------

                    .OrderByDescending(a =>
                        a.AppliedAt)

                    .ToListAsync();

            return applications;
        }
    }
}