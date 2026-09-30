using System.Security.Claims;
using HiringProjectNew.Server.DTOs.Recruiter.Jobs;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Recruiter")]
    public class RecruiterJobController : ControllerBase
    {
        private readonly IRecruiterJobService _jobService;

        public RecruiterJobController(
            IRecruiterJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpGet]
        public async Task<IActionResult> GetJobs(
            [FromQuery] RecruiterJobQueryDto query)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result = await _jobService.GetJobsAsync(
                recruiterId.Value,
                query);

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetJobById(
            int id)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result = await _jobService.GetJobByIdAsync(
                recruiterId.Value,
                id);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Job not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateJob(
            [FromBody] CreateJobDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result = await _jobService.CreateJobAsync(
                    recruiterId.Value,
                    request);

                return CreatedAtAction(
                    nameof(GetJobById),
                    new { id = result.Id },
                    result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> EditJob(
            int id,
            [FromBody] EditJobDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result = await _jobService.EditJobAsync(
                    recruiterId.Value,
                    id,
                    request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Job not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteJob(
            int id)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var deleted = await _jobService.DeleteJobAsync(
                recruiterId.Value,
                id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Job not found."
                });
            }

            return Ok(new
            {
                message = "Job deleted successfully."
            });
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateJobStatus(
            int id,
            [FromBody] bool isActive)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var updated = await _jobService.UpdateJobStatusAsync(
                recruiterId.Value,
                id,
                isActive);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Job not found."
                });
            }

            return Ok(new
            {
                message = isActive
                    ? "Job activated successfully."
                    : "Job deactivated successfully."
            });
        }

        private int? GetRecruiterId()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var recruiterId))
            {
                return recruiterId;
            }

            return null;
        }
    }
}