using System.Security.Claims;
using HiringProjectNew.Server.DTOs.Recruiter.Applicants;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Recruiter")]
    public class RecruiterApplicantController : ControllerBase
    {
        private readonly IRecruiterApplicantService _applicantService;

        public RecruiterApplicantController(
            IRecruiterApplicantService applicantService)
        {
            _applicantService = applicantService;
        }

        [HttpGet]
        public async Task<IActionResult> GetApplicants(
            [FromQuery] RecruiterApplicantQueryDto query)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _applicantService.GetApplicantsAsync(
                    recruiterId.Value,
                    query);

            return Ok(result);
        }

        [HttpGet("{applicationId:int}")]
        public async Task<IActionResult> GetApplicantById(
            int applicationId)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _applicantService.GetApplicantByIdAsync(
                    recruiterId.Value,
                    applicationId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Applicant application not found."
                });
            }

            return Ok(result);
        }

        [HttpPut("{applicationId:int}/stage")]
        public async Task<IActionResult> UpdateApplicationStage(
            int applicationId,
            [FromBody] string stage)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var updated =
                    await _applicantService
                        .UpdateApplicationStageAsync(
                            recruiterId.Value,
                            applicationId,
                            stage);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Applicant application not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Application stage updated successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
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