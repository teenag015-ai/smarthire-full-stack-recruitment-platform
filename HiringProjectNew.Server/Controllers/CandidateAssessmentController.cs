using System.Security.Claims;
using HiringProjectNew.Server.DTOs.Candidate.Assessments;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Candidate")]
    public class CandidateAssessmentController : ControllerBase
    {
        private readonly ICandidateAssessmentService _assessmentService;
        private readonly ILogger<CandidateAssessmentController> _logger;

        public CandidateAssessmentController(
            ICandidateAssessmentService assessmentService,
            ILogger<CandidateAssessmentController> logger)
        {
            _assessmentService = assessmentService;
            _logger = logger;
        }


        // =========================================================
        // GET AVAILABLE ASSESSMENTS
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAvailableAssessments()
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                _logger.LogWarning(
                    "CandidateAssessment: Unable to get candidate ID from JWT."
                );

                return Unauthorized(new
                {
                    message = "Invalid candidate authentication."
                });
            }

            try
            {
                _logger.LogInformation(
                    "Loading assessments for candidate ID: {CandidateId}",
                    candidateId.Value
                );

                var assessments =
                    await _assessmentService
                        .GetAvailableAssessmentsAsync(
                            candidateId.Value
                        );

                _logger.LogInformation(
                    "Loaded {Count} assessments for candidate ID: {CandidateId}",
                    assessments.Count,
                    candidateId.Value
                );

                return Ok(assessments);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while loading assessments for candidate ID: {CandidateId}",
                    candidateId.Value
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while loading assessments.",
                        detail =
                            "Check the backend console for the actual error."
                    }
                );
            }
        }


        // =========================================================
        // GET ASSESSMENT DETAILS
        // =========================================================

        [HttpGet("{assessmentId:int}")]
        public async Task<IActionResult> GetAssessmentDetails(
            int assessmentId)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid candidate authentication."
                });
            }

            try
            {
                _logger.LogInformation(
                    "Loading assessment {AssessmentId} for candidate {CandidateId}",
                    assessmentId,
                    candidateId.Value
                );

                var assessment =
                    await _assessmentService
                        .GetAssessmentDetailsAsync(
                            candidateId.Value,
                            assessmentId
                        );

                if (assessment == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Assessment not found or you are not eligible for this assessment."
                    });
                }

                return Ok(assessment);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while loading assessment {AssessmentId} for candidate {CandidateId}",
                    assessmentId,
                    candidateId.Value
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while loading the assessment.",
                        detail =
                            "Check the backend console for the actual error."
                    }
                );
            }
        }


        // =========================================================
        // START ASSESSMENT
        // =========================================================

        [HttpPost("{assessmentId:int}/start")]
        public async Task<IActionResult> StartAssessment(
            int assessmentId)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid candidate authentication."
                });
            }

            try
            {
                _logger.LogInformation(
                    "Candidate {CandidateId} starting assessment {AssessmentId}",
                    candidateId.Value,
                    assessmentId
                );

                var assessment =
                    await _assessmentService
                        .StartAssessmentAsync(
                            candidateId.Value,
                            assessmentId
                        );

                if (assessment == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Assessment not found or you are not eligible for this assessment."
                    });
                }

                return Ok(assessment);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Invalid assessment start request. Candidate: {CandidateId}, Assessment: {AssessmentId}",
                    candidateId.Value,
                    assessmentId
                );

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while starting assessment {AssessmentId} for candidate {CandidateId}",
                    assessmentId,
                    candidateId.Value
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while starting the assessment.",
                        detail =
                            "Check the backend console for the actual error."
                    }
                );
            }
        }


        // =========================================================
        // SUBMIT ASSESSMENT
        // =========================================================

        [HttpPost("{assessmentId:int}/submit")]
        public async Task<IActionResult> SubmitAssessment(
            int assessmentId,
            [FromBody] SubmitAssessmentDto request)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid candidate authentication."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _logger.LogInformation(
                    "Candidate {CandidateId} submitting assessment {AssessmentId}",
                    candidateId.Value,
                    assessmentId
                );

                var result =
                    await _assessmentService
                        .SubmitAssessmentAsync(
                            candidateId.Value,
                            assessmentId,
                            request
                        );

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Invalid assessment submission. Candidate: {CandidateId}, Assessment: {AssessmentId}",
                    candidateId.Value,
                    assessmentId
                );

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while submitting assessment {AssessmentId} for candidate {CandidateId}",
                    assessmentId,
                    candidateId.Value
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while submitting the assessment.",
                        detail =
                            "Check the backend console for the actual error."
                    }
                );
            }
        }


        // =========================================================
        // GET ASSESSMENT RESULT
        // =========================================================

        [HttpGet("{assessmentId:int}/result")]
        public async Task<IActionResult> GetAssessmentResult(
            int assessmentId)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid candidate authentication."
                });
            }

            try
            {
                _logger.LogInformation(
                    "Loading result for assessment {AssessmentId}, candidate {CandidateId}",
                    assessmentId,
                    candidateId.Value
                );

                var result =
                    await _assessmentService
                        .GetAssessmentResultAsync(
                            candidateId.Value,
                            assessmentId
                        );

                if (result == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Assessment result not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while loading result for assessment {AssessmentId}, candidate {CandidateId}",
                    assessmentId,
                    candidateId.Value
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while loading the assessment result.",
                        detail =
                            "Check the backend console for the actual error."
                    }
                );
            }
        }

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