using System.Security.Claims;
using HiringProjectNew.Server.DTOs.Candidate.Applications;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Candidate")]
    public class CandidateApplicationController : ControllerBase
    {
        private readonly ICandidateApplicationService _applicationService;

        public CandidateApplicationController(
            ICandidateApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        // =====================================================
        // APPLY FOR JOB
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> ApplyForJob(
            [FromBody] CreateApplicationDto request)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized();
            }

            try
            {
                await _applicationService.ApplyForJobAsync(
                    candidateId.Value,
                    request);

                return Ok(new
                {
                    message = "Job application submitted successfully."
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

        // =====================================================
        // GET MY APPLICATIONS
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetMyApplications()
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized();
            }

            try
            {
                var applications =
                    await _applicationService
                        .GetCandidateApplicationsAsync(
                            candidateId.Value);

                return Ok(applications);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // GET CANDIDATE ID FROM JWT
        // =====================================================

        private int? GetCandidateId()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(
                userIdClaim,
                out var candidateId))
            {
                return candidateId;
            }

            return null;
        }
    }
}