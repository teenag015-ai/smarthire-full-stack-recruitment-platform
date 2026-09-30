using System.Security.Claims;

using HiringProjectNew.Server.DTOs.Interviewer.Evaluation;
using HiringProjectNew.Server.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Interviewer")]
    public class InterviewerEvaluationController
        : ControllerBase
    {
        private readonly IInterviewerEvaluationService
            _evaluationService;

        public InterviewerEvaluationController(
            IInterviewerEvaluationService evaluationService)
        {
            _evaluationService =
                evaluationService;
        }

        // =====================================================
        // GET EVALUATION
        // =====================================================

        [HttpGet("{interviewId:int}")]
        public async Task<IActionResult> GetEvaluation(
            int interviewId)
        {
            var interviewerEmail =
                User.FindFirstValue(
                    ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(
                    interviewerEmail))
            {
                return Unauthorized(
                    new
                    {
                        message =
                            "Interviewer email not found in token."
                    });
            }

            var evaluation =
                await _evaluationService
                    .GetEvaluationAsync(
                        interviewerEmail,
                        interviewId);

            if (evaluation == null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Evaluation not found."
                    });
            }

            return Ok(evaluation);
        }

        // =====================================================
        // CREATE EVALUATION
        // =====================================================

        [HttpPost]
        public async Task<IActionResult>
            CreateEvaluation(
                [FromBody]
                CreateInterviewEvaluationDto request)
        {
            var interviewerEmail =
                User.FindFirstValue(
                    ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(
                    interviewerEmail))
            {
                return Unauthorized(
                    new
                    {
                        message =
                            "Interviewer email not found in token."
                    });
            }

            try
            {
                var evaluation =
                    await _evaluationService
                        .CreateEvaluationAsync(
                            interviewerEmail,
                            request);

                return CreatedAtAction(
                    nameof(GetEvaluation),
                    new
                    {
                        interviewId =
                            request.InterviewId
                    },
                    evaluation);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        // =====================================================
        // UPDATE EVALUATION
        // =====================================================

        [HttpPut("{interviewId:int}")]
        public async Task<IActionResult>
            UpdateEvaluation(
                int interviewId,
                [FromBody]
                UpdateInterviewEvaluationDto request)
        {
            var interviewerEmail =
                User.FindFirstValue(
                    ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(
                    interviewerEmail))
            {
                return Unauthorized(
                    new
                    {
                        message =
                            "Interviewer email not found in token."
                    });
            }

            try
            {
                var evaluation =
                    await _evaluationService
                        .UpdateEvaluationAsync(
                            interviewerEmail,
                            interviewId,
                            request);

                if (evaluation == null)
                {
                    return NotFound(
                        new
                        {
                            message =
                                "Evaluation not found."
                        });
                }

                return Ok(evaluation);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
        }
    }
}