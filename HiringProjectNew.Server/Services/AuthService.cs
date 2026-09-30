using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Auth;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HiringProjectNew.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;

            _passwordHasher = new PasswordHasher<User>();
        }

        // ==================================================
        // REGISTER
        // ==================================================

        public async Task<RegisterResponseDto> RegisterAsync(
            RegisterDto request)
        {
            // Check whether email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == request.Email.Trim().ToLower());

            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "An account with this email already exists."
                );
            }

            // Create Candidate account
            var user = new User
            {
                FullName = request.FullName.Trim(),

                Email = request.Email
                    .Trim()
                    .ToLower(),

                Role = "Candidate",

                IsActive = true,

                CreatedAt = DateTime.UtcNow
            };

            // Hash password
            user.PasswordHash =
                _passwordHasher.HashPassword(
                    user,
                    request.Password
                );

            // Save user
            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return new RegisterResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Message = "Registration successful."
            };
        }

        // ==================================================
        // LOGIN
        // ==================================================

        public async Task<LoginResponseDto> LoginAsync(
            LoginDto request)
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == request.Email.Trim().ToLower());

            // User does not exist
            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password."
                );
            }

            // Check account status
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "Your account is inactive."
                );
            }

            // Verify password
            var passwordResult =
                _passwordHasher.VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    request.Password
                );

            if (passwordResult ==
                PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password."
                );
            }

            // Generate JWT
            var token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                Id = user.Id,

                FullName = user.FullName,

                Email = user.Email,

                Role = user.Role,

                Token = token,

                Message = "Login successful."
            };
        }

        // ==================================================
        // JWT TOKEN GENERATION
        // ==================================================

        private string GenerateJwtToken(User user)
        {
            var jwtKey =
                _configuration["Jwt:Key"];

            var jwtIssuer =
                _configuration["Jwt:Issuer"];

            var jwtAudience =
                _configuration["Jwt:Audience"];

            var expiryMinutes =
                int.Parse(
                    _configuration["Jwt:ExpiryMinutes"]
                    ?? "60"
                );

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!)
            );

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );

            // Claims stored inside JWT
            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()
                ),

                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                ),

                new Claim(
                    ClaimTypes.Email,
                    user.Email
                ),

                new Claim(
                    ClaimTypes.Role,
                    user.Role
                )
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,

                audience: jwtAudience,

                claims: claims,

                expires: DateTime.UtcNow.AddMinutes(
                    expiryMinutes
                ),

                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}