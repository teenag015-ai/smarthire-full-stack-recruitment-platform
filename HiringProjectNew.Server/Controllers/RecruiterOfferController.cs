using HiringProjectNew.Server.DTOs.Recruiter.Offers;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Recruiter")]
    public class RecruiterOfferController : ControllerBase
    {
        private readonly IRecruiterOfferService _offerService;

        public RecruiterOfferController(
            IRecruiterOfferService offerService)
        {
            _offerService = offerService;
        }

        private int GetRecruiterId()
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException(
                    "Recruiter identity could not be determined.");
            }

            return int.Parse(userIdClaim.Value);
        }

        // GET: api/RecruiterOffer
        [HttpGet]
        public async Task<IActionResult> GetOffers(
            [FromQuery] RecruiterOfferQueryDto query)
        {
            try
            {
                var recruiterId = GetRecruiterId();

                var result =
                    await _offerService.GetOffersAsync(
                        recruiterId,
                        query);

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
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

        // GET: api/RecruiterOffer/{offerId}
        [HttpGet("{offerId}")]
        public async Task<IActionResult> GetOfferById(
            int offerId)
        {
            try
            {
                var recruiterId = GetRecruiterId();

                var result =
                    await _offerService.GetOfferByIdAsync(
                        recruiterId,
                        offerId);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Offer not found."
                    });
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
                });
            }
        }

        // POST: api/RecruiterOffer
        [HttpPost]
        public async Task<IActionResult> CreateOffer(
            [FromBody] CreateOfferDto request)
        {
            try
            {
                var recruiterId = GetRecruiterId();

                var result =
                    await _offerService.CreateOfferAsync(
                        recruiterId,
                        request);

                return CreatedAtAction(
                    nameof(GetOfferById),
                    new
                    {
                        offerId = result.Id
                    },
                    result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
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

        // PUT: api/RecruiterOffer/{offerId}
        [HttpPut("{offerId}")]
        public async Task<IActionResult> EditOffer(
            int offerId,
            [FromBody] EditOfferDto request)
        {
            try
            {
                var recruiterId = GetRecruiterId();

                var result =
                    await _offerService.EditOfferAsync(
                        recruiterId,
                        offerId,
                        request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Offer not found."
                    });
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
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

        // DELETE: api/RecruiterOffer/{offerId}
        [HttpDelete("{offerId}")]
        public async Task<IActionResult> DeleteOffer(
            int offerId)
        {
            try
            {
                var recruiterId = GetRecruiterId();

                var result =
                    await _offerService.DeleteOfferAsync(
                        recruiterId,
                        offerId);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Offer not found."
                    });
                }

                return Ok(new
                {
                    message = "Offer deleted successfully."
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
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

        // PUT: api/RecruiterOffer/{offerId}/status
        [HttpPut("{offerId}/status")]
        public async Task<IActionResult> UpdateOfferStatus(
            int offerId,
            [FromBody] string status)
        {
            try
            {
                var recruiterId = GetRecruiterId();

                var result =
                    await _offerService.UpdateOfferStatusAsync(
                        recruiterId,
                        offerId,
                        status);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Offer not found."
                    });
                }

                return Ok(new
                {
                    message = "Offer status updated successfully."
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
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
    }
}