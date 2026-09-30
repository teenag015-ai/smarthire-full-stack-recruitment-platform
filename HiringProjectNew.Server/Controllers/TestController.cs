using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        // ================================================
        // Any logged-in user
        // ================================================

        [HttpGet("authenticated")]
        [Authorize]
        public IActionResult Authenticated()
        {
            return Ok(new
            {
                message = "You are authenticated.",
                user = User.Identity?.Name,
                role = User.FindFirst(
                    System.Security.Claims.ClaimTypes.Role
                )?.Value
            });
        }

        // ================================================
        // Admin only
        // ================================================

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
        {
            return Ok(new
            {
                message = "Admin authorization successful.",
                user = User.Identity?.Name,
                role = User.FindFirst(
                    System.Security.Claims.ClaimTypes.Role
                )?.Value
            });
        }
    }
}