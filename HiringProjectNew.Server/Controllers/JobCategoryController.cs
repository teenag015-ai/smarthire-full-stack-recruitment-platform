using HiringProjectNew.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Recruiter")]
    public class JobCategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobCategoryController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/JobCategory
        [HttpGet]
        public async Task<IActionResult> GetJobCategories()
        {
            var categories = await _context.JobCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}