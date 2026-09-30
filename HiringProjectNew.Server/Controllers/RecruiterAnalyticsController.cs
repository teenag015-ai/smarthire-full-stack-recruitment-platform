using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Recruiter")]
    public class RecruiterAnalyticsController : ControllerBase
    {
        private readonly IRecruiterAnalyticsService _analyticsService;

        public RecruiterAnalyticsController(
            IRecruiterAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        // =====================================================
        // GET RECRUITER ANALYTICS
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetAnalytics()
        {
            var recruiterIdClaim =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (!int.TryParse(
                    recruiterIdClaim,
                    out var recruiterId))
            {
                return Unauthorized(
                    new
                    {
                        message =
                            "Invalid recruiter authentication."
                    }
                );
            }

            try
            {
                var analytics =
                    await _analyticsService
                        .GetAnalyticsAsync(
                            recruiterId
                        );

                return Ok(analytics);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Failed to load recruiter analytics."
                    }
                );
            }
        }
    }
}