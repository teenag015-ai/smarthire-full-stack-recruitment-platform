using HiringProjectNew.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Candidate")]
    public class CandidateJobController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidateJobController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // GET ALL ACTIVE JOBS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetJobs()
        {
            var jobs = await _context.Jobs
                .Where(j =>
                    j.IsActive &&
                    j.ApplicationDeadline >= DateTime.UtcNow
                )
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => new
                {
                    j.Id,
                    j.Title,

                    j.DepartmentId,
                    DepartmentName =
                        _context.Departments
                            .Where(d => d.Id == j.DepartmentId)
                            .Select(d => d.Name)
                            .FirstOrDefault(),

                    j.JobCategoryId,
                    JobCategoryName =
                        _context.JobCategories
                            .Where(c => c.Id == j.JobCategoryId)
                            .Select(c => c.Name)
                            .FirstOrDefault(),

                    j.Location,
                    j.EmploymentType,
                    j.ExperienceLevel,

                    j.MinimumSalary,
                    j.MaximumSalary,

                    j.RequiredSkills,
                    j.Description,
                    j.Responsibilities,
                    j.Requirements,

                    j.ApplicationDeadline,
                    j.CreatedAt
                })
                .ToListAsync();

            return Ok(jobs);
        }


        // ==========================================
        // GET JOB BY ID
        // ==========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJob(int id)
        {
            var job = await _context.Jobs
                .Where(j =>
                    j.Id == id &&
                    j.IsActive
                )
                .Select(j => new
                {
                    j.Id,
                    j.Title,

                    j.DepartmentId,
                    DepartmentName =
                        _context.Departments
                            .Where(d => d.Id == j.DepartmentId)
                            .Select(d => d.Name)
                            .FirstOrDefault(),

                    j.JobCategoryId,
                    JobCategoryName =
                        _context.JobCategories
                            .Where(c => c.Id == j.JobCategoryId)
                            .Select(c => c.Name)
                            .FirstOrDefault(),

                    j.Location,
                    j.EmploymentType,
                    j.ExperienceLevel,

                    j.MinimumSalary,
                    j.MaximumSalary,

                    j.RequiredSkills,
                    j.Description,
                    j.Responsibilities,
                    j.Requirements,

                    j.ApplicationDeadline,
                    j.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (job == null)
            {
                return NotFound(new
                {
                    message = "Job not found or no longer available."
                });
            }

            return Ok(job);
        }
    }
}