using System.Security.Claims;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Candidate")]
    public class CandidateInterviewController : ControllerBase
    {
        private readonly ICandidateInterviewService _interviewService;

        public CandidateInterviewController(
            ICandidateInterviewService interviewService)
        {
            _interviewService = interviewService;
        }


        // ==================================================
        // GET MY INTERVIEWS
        // GET: api/CandidateInterview
        // ==================================================

        [HttpGet]
        public async Task<IActionResult> GetMyInterviews()
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid candidate authentication."
                });
            }

            try
            {
                var interviews =
                    await _interviewService
                        .GetMyInterviewsAsync(
                            candidateId.Value);

                return Ok(interviews);
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while loading your interviews."
                    });
            }
        }


        // ==================================================
        // GET INTERVIEW DETAILS
        // GET: api/CandidateInterview/{interviewId}
        // ==================================================

        [HttpGet("{interviewId:int}")]
        public async Task<IActionResult>
            GetInterviewDetails(int interviewId)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid candidate authentication."
                });
            }

            try
            {
                var interview =
                    await _interviewService
                        .GetInterviewDetailsAsync(
                            candidateId.Value,
                            interviewId);

                if (interview == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Interview not found."
                    });
                }

                return Ok(interview);
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while loading the interview details."
                    });
            }
        }


        // ==================================================
        // GET CANDIDATE ID FROM JWT
        // ==================================================

        private int? GetCandidateId()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

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