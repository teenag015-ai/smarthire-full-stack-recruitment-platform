using HiringProjectNew.Server.DTOs.Auth;
using HiringProjectNew.Server.Interfaces;

using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ==================================================
        // REGISTER
        // POST: api/Auth/register
        // ==================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterDto request)
        {
            try
            {
                var result =
                    await _authService.RegisterAsync(request);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message =
                        "An unexpected error occurred while registering the user."
                });
            }
        }

        // ==================================================
        // LOGIN
        // POST: api/Auth/login
        // ==================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginDto request)
        {
            try
            {
                var result =
                    await _authService.LoginAsync(request);

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message =
                        "An unexpected error occurred while logging in."
                });
            }
        }
    }
}