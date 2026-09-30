using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Interviewer.Evaluation;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;

using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class InterviewerEvaluationService
        : IInterviewerEvaluationService
    {
        private readonly ApplicationDbContext _context;

        public InterviewerEvaluationService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET EVALUATION
        // =========================================================

        public async Task<InterviewEvaluationDto?> GetEvaluationAsync(
            string interviewerEmail,
            int interviewId)
        {
            // -----------------------------------------------------
            // Find logged-in interviewer
            // -----------------------------------------------------

            var interviewer = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user =>
                    user.Email == interviewerEmail &&
                    user.Role == "Interviewer" &&
                    user.IsActive);

            if (interviewer == null)
            {
                return null;
            }

            // -----------------------------------------------------
            // Find evaluation belonging to this interviewer
            // -----------------------------------------------------

            var evaluation = await _context
                .Set<InterviewEvaluation>()
                .AsNoTracking()
                .FirstOrDefaultAsync(item =>
                    item.InterviewId == interviewId &&
                    item.InterviewerId == interviewer.Id);

            if (evaluation == null)
            {
                return null;
            }

            // -----------------------------------------------------
            // Find interview
            // -----------------------------------------------------

            var interview = await _context.Interviews
                .AsNoTracking()
                .FirstOrDefaultAsync(item =>
                    item.Id == interviewId &&
                    item.InterviewerEmail == interviewerEmail);

            if (interview == null)
            {
                return null;
            }

            // -----------------------------------------------------
            // Find application
            // -----------------------------------------------------

            var application = await _context.Applications
                .AsNoTracking()
                .FirstOrDefaultAsync(item =>
                    item.Id == interview.ApplicationId);

            if (application == null)
            {
                return null;
            }

            // -----------------------------------------------------
            // Find candidate
            // -----------------------------------------------------

            var candidate = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user =>
                    user.Id == application.CandidateId);

            // -----------------------------------------------------
            // Find job
            // -----------------------------------------------------

            var job = await _context.Jobs
                .AsNoTracking()
                .FirstOrDefaultAsync(item =>
                    item.Id == application.JobId);

            // -----------------------------------------------------
            // Return DTO
            // -----------------------------------------------------

            return new InterviewEvaluationDto
            {
                Id = evaluation.Id,

                InterviewId = evaluation.InterviewId,

                InterviewerId = evaluation.InterviewerId,

                CandidateId =
                    application.CandidateId,

                CandidateName =
                    candidate?.FullName ?? string.Empty,

                CandidateEmail =
                    candidate?.Email ?? string.Empty,

                JobId =
                    application.JobId,

                JobTitle =
                    job?.Title ?? string.Empty,

                InterviewType =
                    interview.InterviewType,

                ScheduledAt =
                    interview.ScheduledAt,

                InterviewStatus =
                    interview.Status,

                TechnicalSkills =
                    evaluation.TechnicalSkills,

                ProblemSolving =
                    evaluation.ProblemSolving,

                Communication =
                    evaluation.Communication,

                JobKnowledge =
                    evaluation.JobKnowledge,

                OverallRating =
                    evaluation.OverallRating,

                Strengths =
                    evaluation.Strengths,

                Weaknesses =
                    evaluation.Weaknesses,

                Comments =
                    evaluation.Comments,

                Recommendation =
                    evaluation.Recommendation,

                CreatedAt =
                    evaluation.CreatedAt,

                UpdatedAt =
                    evaluation.UpdatedAt
            };
        }

        // =========================================================
        // CREATE EVALUATION
        // =========================================================

        public async Task<InterviewEvaluationDto>
            CreateEvaluationAsync(
                string interviewerEmail,
                CreateInterviewEvaluationDto request)
        {
            // -----------------------------------------------------
            // Find interviewer
            // -----------------------------------------------------

            var interviewer = await _context.Users
                .FirstOrDefaultAsync(user =>
                    user.Email == interviewerEmail &&
                    user.Role == "Interviewer" &&
                    user.IsActive);

            if (interviewer == null)
            {
                throw new UnauthorizedAccessException(
                    "Interviewer account not found."
                );
            }

            // -----------------------------------------------------
            // Find assigned interview
            // -----------------------------------------------------

            var interview = await _context.Interviews
                .FirstOrDefaultAsync(item =>
                    item.Id == request.InterviewId &&
                    item.InterviewerEmail == interviewerEmail);

            if (interview == null)
            {
                throw new KeyNotFoundException(
                    "Interview not found."
                );
            }

            // -----------------------------------------------------
            // Only completed interviews can be evaluated
            // -----------------------------------------------------

            if (!string.Equals(
                    interview.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Evaluation can only be submitted for completed interviews."
                );
            }

            // -----------------------------------------------------
            // Check existing evaluation
            // -----------------------------------------------------

            var existingEvaluation = await _context
                .Set<InterviewEvaluation>()
                .FirstOrDefaultAsync(item =>
                    item.InterviewId == request.InterviewId &&
                    item.InterviewerId == interviewer.Id);

            if (existingEvaluation != null)
            {
                throw new InvalidOperationException(
                    "An evaluation has already been submitted for this interview."
                );
            }

            // -----------------------------------------------------
            // Validate recommendation
            // -----------------------------------------------------

            var recommendation =
                NormalizeRecommendation(
                    request.Recommendation);

            // -----------------------------------------------------
            // Create evaluation
            // -----------------------------------------------------

            var evaluation =
                new InterviewEvaluation
                {
                    InterviewId =
                        request.InterviewId,

                    InterviewerId =
                        interviewer.Id,

                    TechnicalSkills =
                        request.TechnicalSkills,

                    ProblemSolving =
                        request.ProblemSolving,

                    Communication =
                        request.Communication,

                    JobKnowledge =
                        request.JobKnowledge,

                    OverallRating =
                        request.OverallRating,

                    Strengths =
                        request.Strengths?.Trim() ?? string.Empty,

                    Weaknesses =
                        request.Weaknesses?.Trim() ?? string.Empty,

                    Comments =
                        request.Comments?.Trim() ?? string.Empty,

                    Recommendation =
                        recommendation,

                    CreatedAt =
                        DateTime.UtcNow,

                    UpdatedAt = null
                };

            _context
                .Set<InterviewEvaluation>()
                .Add(evaluation);

            await _context.SaveChangesAsync();

            // -----------------------------------------------------
            // Return created evaluation
            // -----------------------------------------------------

            var result =
                await GetEvaluationAsync(
                    interviewerEmail,
                    request.InterviewId);

            if (result == null)
            {
                throw new InvalidOperationException(
                    "Evaluation was created but could not be retrieved."
                );
            }

            return result;
        }

        // =========================================================
        // UPDATE EVALUATION
        // =========================================================

        public async Task<InterviewEvaluationDto?>
            UpdateEvaluationAsync(
                string interviewerEmail,
                int interviewId,
                UpdateInterviewEvaluationDto request)
        {
            // -----------------------------------------------------
            // Find logged-in interviewer
            // -----------------------------------------------------

            var interviewer = await _context.Users
                .FirstOrDefaultAsync(user =>
                    user.Email == interviewerEmail &&
                    user.Role == "Interviewer" &&
                    user.IsActive);

            if (interviewer == null)
            {
                throw new UnauthorizedAccessException(
                    "Interviewer account not found."
                );
            }

            // -----------------------------------------------------
            // Find assigned interview
            // -----------------------------------------------------

            var interview = await _context.Interviews
                .FirstOrDefaultAsync(item =>
                    item.Id == interviewId &&
                    item.InterviewerEmail == interviewerEmail);

            if (interview == null)
            {
                throw new KeyNotFoundException(
                    "Interview not found."
                );
            }

            // -----------------------------------------------------
            // Only completed interviews can be evaluated
            // -----------------------------------------------------

            if (!string.Equals(
                    interview.Status,
                    "Completed",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Only completed interviews can have an evaluation."
                );
            }

            // -----------------------------------------------------
            // Find evaluation belonging to interviewer
            // -----------------------------------------------------

            var evaluation = await _context
                .Set<InterviewEvaluation>()
                .FirstOrDefaultAsync(item =>
                    item.InterviewId == interviewId &&
                    item.InterviewerId == interviewer.Id);

            if (evaluation == null)
            {
                throw new KeyNotFoundException(
                    "Evaluation not found."
                );
            }

            // -----------------------------------------------------
            // Validate recommendation
            // -----------------------------------------------------

            var recommendation =
                NormalizeRecommendation(
                    request.Recommendation);

            // -----------------------------------------------------
            // Update evaluation
            // -----------------------------------------------------

            evaluation.TechnicalSkills =
                request.TechnicalSkills;

            evaluation.ProblemSolving =
                request.ProblemSolving;

            evaluation.Communication =
                request.Communication;

            evaluation.JobKnowledge =
                request.JobKnowledge;

            evaluation.OverallRating =
                request.OverallRating;

            evaluation.Strengths =
                request.Strengths?.Trim() ?? string.Empty;

            evaluation.Weaknesses =
                request.Weaknesses?.Trim() ?? string.Empty;

            evaluation.Comments =
                request.Comments?.Trim() ?? string.Empty;

            evaluation.Recommendation =
                recommendation;

            evaluation.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // -----------------------------------------------------
            // Return updated evaluation
            // -----------------------------------------------------

            return await GetEvaluationAsync(
                interviewerEmail,
                interviewId);
        }

        // =========================================================
        // RECOMMENDATION VALIDATION
        // =========================================================

        private static string NormalizeRecommendation(
            string recommendation)
        {
            if (string.IsNullOrWhiteSpace(
                    recommendation))
            {
                throw new ArgumentException(
                    "Recommendation is required."
                );
            }

            var normalized =
                recommendation.Trim();

            if (string.Equals(
                    normalized,
                    "Reject",
                    StringComparison.OrdinalIgnoreCase))
            {
                return "Reject";
            }

            if (string.Equals(
                    normalized,
                    "Next Round",
                    StringComparison.OrdinalIgnoreCase))
            {
                return "Next Round";
            }

            if (string.Equals(
                    normalized,
                    "Hire",
                    StringComparison.OrdinalIgnoreCase))
            {
                return "Hire";
            }

            throw new ArgumentException(
                "Recommendation must be Reject, Next Round, or Hire."
            );
        }
    }
}