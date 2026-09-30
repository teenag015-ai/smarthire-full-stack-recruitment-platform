using System.Security.Claims;

using HiringProjectNew.Server.DTOs.Recruiter.Interviews;
using HiringProjectNew.Server.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Recruiter")]
    public class RecruiterInterviewController : ControllerBase
    {
        private readonly IRecruiterInterviewService _interviewService;

        public RecruiterInterviewController(
            IRecruiterInterviewService interviewService)
        {
            _interviewService = interviewService;
        }


        // =====================================================
        // GET ALL INTERVIEWS
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetInterviews(
            [FromQuery] RecruiterInterviewQueryDto query)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _interviewService.GetInterviewsAsync(
                        recruiterId.Value,
                        query
                    );

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


        // =====================================================
        // GET INTERVIEW BY ID
        // =====================================================

        [HttpGet("{interviewId:int}")]
        public async Task<IActionResult> GetInterviewById(
            int interviewId)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _interviewService.GetInterviewByIdAsync(
                    recruiterId.Value,
                    interviewId
                );

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Interview not found."
                });
            }

            return Ok(result);
        }


        // =====================================================
        // CREATE / SCHEDULE INTERVIEW
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> CreateInterview(
            [FromBody] CreateInterviewDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _interviewService.CreateInterviewAsync(
                        recruiterId.Value,
                        request
                    );

                return CreatedAtAction(
                    nameof(GetInterviewById),
                    new
                    {
                        interviewId = result.Id
                    },
                    result
                );
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
        // EDIT / RESCHEDULE INTERVIEW
        // =====================================================

        [HttpPut("{interviewId:int}")]
        public async Task<IActionResult> EditInterview(
            int interviewId,
            [FromBody] EditInterviewDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _interviewService.EditInterviewAsync(
                        recruiterId.Value,
                        interviewId,
                        request
                    );

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Interview not found."
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


        // =====================================================
        // DELETE INTERVIEW
        // =====================================================

        [HttpDelete("{interviewId:int}")]
        public async Task<IActionResult> DeleteInterview(
            int interviewId)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var deleted =
                    await _interviewService.DeleteInterviewAsync(
                        recruiterId.Value,
                        interviewId
                    );

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Interview not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Interview deleted successfully."
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
        // UPDATE INTERVIEW STATUS
        // =====================================================

        [HttpPut("{interviewId:int}/status")]
        public async Task<IActionResult> UpdateInterviewStatus(
            int interviewId,
            [FromBody] string status)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var updated =
                    await _interviewService
                        .UpdateInterviewStatusAsync(
                            recruiterId.Value,
                            interviewId,
                            status
                        );

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Interview not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Interview status updated successfully."
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
        // GET RECRUITER ID FROM JWT
        // =====================================================

        private int? GetRecruiterId()
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

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