using System.Security.Claims;
using HiringProjectNew.Server.DTOs.CandidateOffer;
using HiringProjectNew.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Candidate")]
    public class CandidateOfferController : ControllerBase
    {
        private readonly ICandidateOfferService _candidateOfferService;

        public CandidateOfferController(
            ICandidateOfferService candidateOfferService)
        {
            _candidateOfferService = candidateOfferService;
        }

        // ============================================================
        // GET: api/CandidateOffer
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> GetCandidateOffers()
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Candidate information could not be found."
                });
            }

            var offers = await _candidateOfferService
                .GetCandidateOffersAsync(candidateId.Value);

            return Ok(offers);
        }

        // ============================================================
        // GET: api/CandidateOffer/{id}
        // ============================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCandidateOffer(int id)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Candidate information could not be found."
                });
            }

            var offer = await _candidateOfferService
                .GetCandidateOfferByIdAsync(
                    candidateId.Value,
                    id);

            if (offer == null)
            {
                return NotFound(new
                {
                    message = "Offer not found."
                });
            }

            return Ok(offer);
        }

        // ============================================================
        // POST: api/CandidateOffer/{id}/respond
        // ============================================================
        [HttpPost("{id:int}/respond")]
        public async Task<IActionResult> RespondToOffer(
            int id,
            [FromBody] CandidateOfferResponseDto request)
        {
            var candidateId = GetCandidateId();

            if (candidateId == null)
            {
                return Unauthorized(new
                {
                    message = "Candidate information could not be found."
                });
            }

            if (request == null ||
                string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest(new
                {
                    message = "Response status is required."
                });
            }

            if (!string.Equals(
                    request.Status,
                    "Accepted",
                    StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    request.Status,
                    "Rejected",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Only Accepted or Rejected responses are allowed."
                });
            }

            var result = await _candidateOfferService
                .RespondToOfferAsync(
                    candidateId.Value,
                    id,
                    request);

            if (result == null)
            {
                return BadRequest(new
                {
                    message =
                        "The offer cannot be responded to. " +
                        "It may not exist, may not belong to you, " +
                        "may already have a response, or may have expired."
                });
            }

            return Ok(result);
        }

        // ============================================================
        // GET CANDIDATE ID FROM JWT
        // ============================================================
        private int? GetCandidateId()
        {
            var candidateIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(candidateIdClaim))
            {
                return null;
            }

            if (!int.TryParse(candidateIdClaim, out var candidateId))
            {
                return null;
            }

            return candidateId;
        }
    }
}