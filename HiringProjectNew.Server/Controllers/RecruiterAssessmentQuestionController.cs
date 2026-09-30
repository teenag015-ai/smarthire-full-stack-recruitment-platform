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
    public class RecruiterAssessmentQuestionController : ControllerBase
    {
        private readonly IRecruiterAssessmentQuestionService _questionService;

        public RecruiterAssessmentQuestionController(
            IRecruiterAssessmentQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpGet("assessment/{assessmentId:int}")]
        public async Task<IActionResult> GetQuestions(
            int assessmentId)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _questionService.GetQuestionsAsync(
                    recruiterId.Value,
                    assessmentId);

            return Ok(result);
        }

        [HttpGet("{questionId:int}")]
        public async Task<IActionResult> GetQuestionById(
            int questionId)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var result =
                await _questionService.GetQuestionByIdAsync(
                    recruiterId.Value,
                    questionId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Assessment question not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuestion(
            [FromBody] CreateAssessmentQuestionDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _questionService.CreateQuestionAsync(
                        recruiterId.Value,
                        request);

                return CreatedAtAction(
                    nameof(GetQuestionById),
                    new { questionId = result.Id },
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

        [HttpPut("{questionId:int}")]
        public async Task<IActionResult> EditQuestion(
            int questionId,
            [FromBody] EditAssessmentQuestionDto request)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result =
                    await _questionService.EditQuestionAsync(
                        recruiterId.Value,
                        questionId,
                        request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Assessment question not found."
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

        [HttpDelete("{questionId:int}")]
        public async Task<IActionResult> DeleteQuestion(
            int questionId)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var deleted =
                await _questionService.DeleteQuestionAsync(
                    recruiterId.Value,
                    questionId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Assessment question not found."
                });
            }

            return Ok(new
            {
                message =
                    "Assessment question deleted successfully."
            });
        }

        [HttpPut("{questionId:int}/status")]
        public async Task<IActionResult> UpdateQuestionStatus(
            int questionId,
            [FromBody] bool isActive)
        {
            var recruiterId = GetRecruiterId();

            if (recruiterId == null)
            {
                return Unauthorized();
            }

            var updated =
                await _questionService.UpdateQuestionStatusAsync(
                    recruiterId.Value,
                    questionId,
                    isActive);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Assessment question not found."
                });
            }

            return Ok(new
            {
                message = isActive
                    ? "Question activated successfully."
                    : "Question deactivated successfully."
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