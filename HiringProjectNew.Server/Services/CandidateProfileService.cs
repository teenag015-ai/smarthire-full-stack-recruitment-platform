using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Candidate.Profile;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class CandidateProfileService : ICandidateProfileService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        private const long MaxResumeSize = 5 * 1024 * 1024;

        private static readonly string[] AllowedExtensions =
        {
            ".pdf",
            ".doc",
            ".docx"
        };

        public CandidateProfileService(
            ApplicationDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }


        // ----------------------------------------------------
        // Get Candidate Profile
        // ----------------------------------------------------

        public async Task<CandidateProfileDto?> GetProfileAsync(
            int candidateId)
        {
            var candidate = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == candidateId &&
                    u.Role == "Candidate" &&
                    u.IsActive);

            if (candidate == null)
            {
                return null;
            }

            var profile = await _context.CandidateProfiles
                .FirstOrDefaultAsync(p =>
                    p.CandidateId == candidateId);

            if (profile == null)
            {
                profile = new CandidateProfile
                {
                    CandidateId = candidateId,
                    ProfileCompletionPercentage = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CandidateProfiles.Add(profile);

                await _context.SaveChangesAsync();
            }

            return MapToDto(candidate, profile);
        }


        // ----------------------------------------------------
        // Update Candidate Profile
        // ----------------------------------------------------

        public async Task<CandidateProfileDto> UpdateProfileAsync(
            int candidateId,
            UpdateCandidateProfileDto request)
        {
            var candidate = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == candidateId &&
                    u.Role == "Candidate" &&
                    u.IsActive);

            if (candidate == null)
            {
                throw new InvalidOperationException(
                    "Candidate not found or inactive.");
            }

            var profile = await _context.CandidateProfiles
                .FirstOrDefaultAsync(p =>
                    p.CandidateId == candidateId);

            if (profile == null)
            {
                profile = new CandidateProfile
                {
                    CandidateId = candidateId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CandidateProfiles.Add(profile);
            }

            profile.PhoneNumber =
                request.PhoneNumber?.Trim()
                ?? string.Empty;

            profile.ProfessionalHeadline =
                request.ProfessionalHeadline?.Trim()
                ?? string.Empty;

            profile.Location =
                request.Location?.Trim()
                ?? string.Empty;

            profile.About =
                request.About?.Trim()
                ?? string.Empty;

            profile.Skills =
                request.Skills?.Trim()
                ?? string.Empty;

            profile.Education =
                request.Education?.Trim()
                ?? string.Empty;

            profile.Experience =
                request.Experience?.Trim()
                ?? string.Empty;

            profile.ProfileCompletionPercentage =
                CalculateProfileCompletion(profile);

            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(candidate, profile);
        }


        // ----------------------------------------------------
        // Upload Resume
        // ----------------------------------------------------

        public async Task<CandidateProfileDto> UploadResumeAsync(
            int candidateId,
            IFormFile resumeFile)
        {
            var candidate = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == candidateId &&
                    u.Role == "Candidate" &&
                    u.IsActive);

            if (candidate == null)
            {
                throw new InvalidOperationException(
                    "Candidate not found or inactive.");
            }

            if (resumeFile == null ||
                resumeFile.Length == 0)
            {
                throw new InvalidOperationException(
                    "Please select a resume file.");
            }

            if (resumeFile.Length > MaxResumeSize)
            {
                throw new InvalidOperationException(
                    "Resume file size cannot exceed 5 MB.");
            }

            var extension =
                Path.GetExtension(
                    resumeFile.FileName)
                    .ToLowerInvariant();

            if (!AllowedExtensions.Contains(extension))
            {
                throw new InvalidOperationException(
                    "Only PDF, DOC, and DOCX resume files are allowed.");
            }


            // ------------------------------------------------
            // Get Candidate Profile
            // ------------------------------------------------

            var profile = await _context.CandidateProfiles
                .FirstOrDefaultAsync(p =>
                    p.CandidateId == candidateId);

            if (profile == null)
            {
                profile = new CandidateProfile
                {
                    CandidateId = candidateId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CandidateProfiles.Add(profile);
            }


            // ------------------------------------------------
            // Explicit wwwroot Path
            // ------------------------------------------------

            var webRootPath =
                _environment.WebRootPath;

            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot");
            }


            // ------------------------------------------------
            // Resume Upload Folder
            // ------------------------------------------------

            var uploadsFolder = Path.Combine(
                webRootPath,
                "uploads",
                "resumes");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(
                    uploadsFolder);
            }


            // ------------------------------------------------
            // Delete Previous Resume
            // ------------------------------------------------

            if (!string.IsNullOrWhiteSpace(
                profile.ResumeFilePath))
            {
                var previousRelativePath =
                    profile.ResumeFilePath
                        .TrimStart('/')
                        .Replace(
                            '/',
                            Path.DirectorySeparatorChar);

                var previousFilePath =
                    Path.Combine(
                        webRootPath,
                        previousRelativePath);

                if (File.Exists(previousFilePath))
                {
                    File.Delete(previousFilePath);
                }
            }


            // ------------------------------------------------
            // Generate Unique File Name
            // ------------------------------------------------

            var uniqueFileName =
                $"{Guid.NewGuid()}{extension}";

            var physicalFilePath =
                Path.Combine(
                    uploadsFolder,
                    uniqueFileName);


            // ------------------------------------------------
            // Save Resume
            // ------------------------------------------------

            using (
                var stream =
                    new FileStream(
                        physicalFilePath,
                        FileMode.Create)
            )
            {
                await resumeFile.CopyToAsync(
                    stream);
            }


            // ------------------------------------------------
            // Store Resume Information
            // ------------------------------------------------

            profile.ResumeFileName =
                Path.GetFileName(
                    resumeFile.FileName);

            profile.ResumeFilePath =
                $"/uploads/resumes/{uniqueFileName}";

            profile.ProfileCompletionPercentage =
                CalculateProfileCompletion(profile);

            profile.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(
                candidate,
                profile);
        }


        // ----------------------------------------------------
        // Map Entity To DTO
        // ----------------------------------------------------

        private static CandidateProfileDto MapToDto(
            User candidate,
            CandidateProfile profile)
        {
            return new CandidateProfileDto
            {
                Id = profile.Id,

                CandidateId =
                    profile.CandidateId,

                FullName =
                    candidate.FullName,

                Email =
                    candidate.Email,

                PhoneNumber =
                    profile.PhoneNumber,

                ProfessionalHeadline =
                    profile.ProfessionalHeadline,

                Location =
                    profile.Location,

                About =
                    profile.About,

                Skills =
                    profile.Skills,

                Education =
                    profile.Education,

                Experience =
                    profile.Experience,

                ResumeFileName =
                    profile.ResumeFileName,

                ResumeFilePath =
                    profile.ResumeFilePath,

                ProfileCompletionPercentage =
                    profile.ProfileCompletionPercentage,

                CreatedAt =
                    profile.CreatedAt,

                UpdatedAt =
                    profile.UpdatedAt
            };
        }


        // ----------------------------------------------------
        // Calculate Profile Completion
        // ----------------------------------------------------

        private static int CalculateProfileCompletion(
            CandidateProfile profile)
        {
            int completedFields = 0;

            int totalFields = 8;


            if (!string.IsNullOrWhiteSpace(
                profile.PhoneNumber))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.ProfessionalHeadline))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.Location))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.About))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.Skills))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.Education))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.Experience))
            {
                completedFields++;
            }

            if (!string.IsNullOrWhiteSpace(
                profile.ResumeFileName))
            {
                completedFields++;
            }


            return (int)Math.Round(
                (double)completedFields /
                totalFields *
                100);
        }
    }
}