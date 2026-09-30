using System.Security.Claims;
using HiringProjectNew.Server.DTOs.Candidate.Profile;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Candidate")]
    public class CandidateProfileController : ControllerBase
    {
        private readonly ICandidateProfileService _profileService;

        public CandidateProfileController(
            ICandidateProfileService profileService)
        {
            _profileService = profileService;
        }


        // ----------------------------------------------------
        // GET: api/CandidateProfile
        // ----------------------------------------------------

        [HttpGet]
        public async Task<IActionResult> GetProfile()
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
                var profile =
                    await _profileService.GetProfileAsync(
                        candidateId.Value);

                if (profile == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Candidate profile not found."
                    });
                }

                return Ok(profile);
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while loading the candidate profile."
                    });
            }
        }


        // ----------------------------------------------------
        // PUT: api/CandidateProfile
        // ----------------------------------------------------

        [HttpPut]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateCandidateProfileDto request)
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

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var profile =
                    await _profileService.UpdateProfileAsync(
                        candidateId.Value,
                        request);

                return Ok(new
                {
                    message =
                        "Candidate profile updated successfully.",

                    profile
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while updating the candidate profile."
                    });
            }
        }


        // ----------------------------------------------------
        // POST: api/CandidateProfile/resume
        // ----------------------------------------------------

        [HttpPost("resume")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UploadResume(
            IFormFile resumeFile)
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

            if (resumeFile == null ||
                resumeFile.Length == 0)
            {
                return BadRequest(new
                {
                    message =
                        "Please select a resume file."
                });
            }

            try
            {
                var profile =
                    await _profileService.UploadResumeAsync(
                        candidateId.Value,
                        resumeFile);

                return Ok(new
                {
                    message =
                        "Resume uploaded successfully.",

                    profile
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred while uploading the resume."
                    });
            }
        }


        // ----------------------------------------------------
        // Get Candidate ID from JWT
        // ----------------------------------------------------

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