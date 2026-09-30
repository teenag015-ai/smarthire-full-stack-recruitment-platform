using System.Security.Claims;
using HiringProjectNew.Server.DTOs.Recruiter.Assessments;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Recruiter")]
    public class RecruiterAssessmentController : ControllerBase
    {
        private readonly IRecruiterAssessmentService _assessmentService;

        public RecruiterAssessmentController(
            IRecruiterAssessmentService assessmentService)
        {
            _assessmentService = assessmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAssessments(
            [FromQuery] RecruiterAssessmentQueryDto query)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _assessmentService.GetAssessmentsAsync(
                    recruiterId.Value,
                    query);

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAssessmentById(
            int id)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _assessmentService.GetAssessmentByIdAsync(
                    recruiterId.Value,
                    id);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Assessment not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAssessment(
            [FromBody] CreateAssessmentDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _assessmentService.CreateAssessmentAsync(
                        recruiterId.Value,
                        request);

                return CreatedAtAction(
                    nameof(GetAssessmentById),
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
        public async Task<IActionResult> EditAssessment(
            int id,
            [FromBody] EditAssessmentDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _assessmentService.EditAssessmentAsync(
                        recruiterId.Value,
                        id,
                        request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Assessment not found."
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
        public async Task<IActionResult> DeleteAssessment(
            int id)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var deleted =
                await _assessmentService.DeleteAssessmentAsync(
                    recruiterId.Value,
                    id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Assessment not found."
                });
            }

            return Ok(new
            {
                message = "Assessment deleted successfully."
            });
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateAssessmentStatus(
            int id,
            [FromBody] bool isActive)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var updated =
                await _assessmentService
                    .UpdateAssessmentStatusAsync(
                        recruiterId.Value,
                        id,
                        isActive);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Assessment not found."
                });
            }

            return Ok(new
            {
                message = isActive
                    ? "Assessment activated successfully."
                    : "Assessment deactivated successfully."
            });
        }

        private int? GetRecruiterId()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(
                userIdClaim,
                out var recruiterId))
            {
                return recruiterId;
            }

            return null;
        }
    }
}