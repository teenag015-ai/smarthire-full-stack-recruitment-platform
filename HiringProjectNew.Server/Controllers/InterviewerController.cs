using System.Security.Claims;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Interviewer")]
    public class InterviewerController : ControllerBase
    {
        private readonly IInterviewerService _interviewerService;

        public InterviewerController(
            IInterviewerService interviewerService)
        {
            _interviewerService = interviewerService;
        }


        // =========================================================
        // GET: api/Interviewer/dashboard
        // =========================================================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var interviewerEmail =
                User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(interviewerEmail))
            {
                return Unauthorized(new
                {
                    message = "Interviewer email not found in token."
                });
            }

            var dashboard =
                await _interviewerService.GetDashboardAsync(
                    interviewerEmail
                );

            if (dashboard == null)
            {
                return NotFound(new
                {
                    message = "Interviewer dashboard not found."
                });
            }

            return Ok(dashboard);
        }


        // =========================================================
        // GET: api/Interviewer/interviews
        // =========================================================
        [HttpGet("interviews")]
        public async Task<IActionResult> GetInterviews()
        {
            var interviewerEmail =
                User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(interviewerEmail))
            {
                return Unauthorized(new
                {
                    message = "Interviewer email not found in token."
                });
            }

            var interviews =
                await _interviewerService.GetInterviewsAsync(
                    interviewerEmail
                );

            return Ok(interviews);
        }


        // =========================================================
        // GET: api/Interviewer/interviews/{id}
        // =========================================================
        [HttpGet("interviews/{id:int}")]
        public async Task<IActionResult> GetInterviewById(
            int id)
        {
            var interviewerEmail =
                User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(interviewerEmail))
            {
                return Unauthorized(new
                {
                    message = "Interviewer email not found in token."
                });
            }

            var interview =
                await _interviewerService.GetInterviewByIdAsync(
                    interviewerEmail,
                    id
                );

            if (interview == null)
            {
                return NotFound(new
                {
                    message = "Interview not found."
                });
            }

            return Ok(interview);
        }
    }
}