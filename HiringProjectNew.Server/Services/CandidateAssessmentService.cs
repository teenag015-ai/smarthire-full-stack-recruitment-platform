using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Candidate.Assessments;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class CandidateAssessmentService
        : ICandidateAssessmentService
    {
        private readonly ApplicationDbContext _context;

        public CandidateAssessmentService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CandidateAssessmentDto>>
            GetAvailableAssessmentsAsync(
                int candidateId)
        {
            var assessments =
                await _context.Assessments
                    .Where(a =>
                        a.IsActive &&
                        _context.Applications.Any(app =>
                            app.CandidateId == candidateId &&
                            app.JobId == a.JobId &&
                            app.IsActive))
                    .Select(a => new CandidateAssessmentDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Description = a.Description,
                        JobId = a.JobId,
                        JobTitle = _context.Jobs
                            .Where(j => j.Id == a.JobId)
                            .Select(j => j.Title)
                            .FirstOrDefault() ?? string.Empty,
                        DurationMinutes = a.DurationMinutes,
                        PassingScore = a.PassingScore,
                        TotalQuestions = _context.AssessmentQuestions
                            .Count(q =>
                                q.AssessmentId == a.Id &&
                                q.IsActive),
                        IsActive = a.IsActive,
                        CreatedAt = a.CreatedAt
                    })
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

            return assessments;
        }

        public async Task<CandidateAssessmentDetailsDto?>
            GetAssessmentDetailsAsync(
                int candidateId,
                int assessmentId)
        {
            var assessment =
                await GetCandidateAssessmentAsync(
                    candidateId,
                    assessmentId);

            if (assessment == null)
            {
                return null;
            }

            var questions =
                await _context.AssessmentQuestions
                    .Where(q =>
                        q.AssessmentId == assessmentId &&
                        q.IsActive)
                    .OrderBy(q => q.Id)
                    .Select(q => new CandidateAssessmentQuestionDto
                    {
                        Id = q.Id,
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        Marks = q.Marks
                    })
                    .ToListAsync();

            return new CandidateAssessmentDetailsDto
            {
                Id = assessment.Id,
                Title = assessment.Title,
                Description = assessment.Description,
                JobId = assessment.JobId,
                JobTitle =
                    await _context.Jobs
                        .Where(j => j.Id == assessment.JobId)
                        .Select(j => j.Title)
                        .FirstOrDefaultAsync()
                    ?? string.Empty,
                DurationMinutes = assessment.DurationMinutes,
                PassingScore = assessment.PassingScore,
                TotalQuestions = questions.Count,
                Questions = questions
            };
        }

        public async Task<CandidateAssessmentDetailsDto?>
            StartAssessmentAsync(
                int candidateId,
                int assessmentId)
        {
            var assessment =
                await GetCandidateAssessmentAsync(
                    candidateId,
                    assessmentId);

            if (assessment == null)
            {
                return null;
            }

            var existingResult =
                await _context.AssessmentResults
                    .FirstOrDefaultAsync(r =>
                        r.AssessmentId == assessmentId &&
                        r.CandidateId == candidateId);

            if (existingResult != null &&
                existingResult.IsCompleted)
            {
                throw new InvalidOperationException(
                    "You have already completed this assessment.");
            }

            if (existingResult == null)
            {
                var questionsCount =
                    await _context.AssessmentQuestions
                        .CountAsync(q =>
                            q.AssessmentId == assessmentId &&
                            q.IsActive);

                var totalMarks =
                    await _context.AssessmentQuestions
                        .Where(q =>
                            q.AssessmentId == assessmentId &&
                            q.IsActive)
                        .SumAsync(q => q.Marks);

                var result = new AssessmentResult
                {
                    AssessmentId = assessmentId,
                    CandidateId = candidateId,
                    TotalQuestions = questionsCount,
                    CorrectAnswers = 0,
                    TotalMarks = totalMarks,
                    ObtainedMarks = 0,
                    Percentage = 0,
                    IsPassed = false,
                    StartedAt = DateTime.UtcNow,
                    IsCompleted = false
                };

                _context.AssessmentResults.Add(result);

                await _context.SaveChangesAsync();
            }

            return await GetAssessmentDetailsAsync(
                candidateId,
                assessmentId);
        }

        public async Task<CandidateAssessmentResultDto>
            SubmitAssessmentAsync(
                int candidateId,
                int assessmentId,
                SubmitAssessmentDto request)
        {
            var assessment =
                await GetCandidateAssessmentAsync(
                    candidateId,
                    assessmentId);

            if (assessment == null)
            {
                throw new InvalidOperationException(
                    "Assessment not found or you are not eligible for this assessment.");
            }

            var result =
                await _context.AssessmentResults
                    .FirstOrDefaultAsync(r =>
                        r.AssessmentId == assessmentId &&
                        r.CandidateId == candidateId);

            if (result == null)
            {
                throw new InvalidOperationException(
                    "Please start the assessment before submitting it.");
            }

            if (result.IsCompleted)
            {
                throw new InvalidOperationException(
                    "This assessment has already been submitted.");
            }

            var questions =
                await _context.AssessmentQuestions
                    .Where(q =>
                        q.AssessmentId == assessmentId &&
                        q.IsActive)
                    .ToListAsync();

            var correctAnswers = 0;
            var obtainedMarks = 0;

            foreach (var answer in request.Answers)
            {
                var question =
                    questions.FirstOrDefault(q =>
                        q.Id == answer.QuestionId);

                if (question == null)
                {
                    continue;
                }

                var selectedAnswer =
                    answer.SelectedAnswer
                        .Trim()
                        .ToUpper();

                var correctAnswer =
                    question.CorrectAnswer
                        .Trim()
                        .ToUpper();

                if (selectedAnswer == correctAnswer)
                {
                    correctAnswers++;
                    obtainedMarks += question.Marks;
                }
            }

            var totalMarks =
                questions.Sum(q => q.Marks);

            decimal percentage = 0;

            if (totalMarks > 0)
            {
                percentage =
                    Math.Round(
                        (decimal)obtainedMarks /
                        totalMarks *
                        100,
                        2);
            }

            result.TotalQuestions =
                questions.Count;

            result.CorrectAnswers =
                correctAnswers;

            result.TotalMarks =
                totalMarks;

            result.ObtainedMarks =
                obtainedMarks;

            result.Percentage =
                percentage;

            result.IsPassed =
                percentage >= assessment.PassingScore;

            result.CompletedAt =
                DateTime.UtcNow;

            result.IsCompleted =
                true;

            await _context.SaveChangesAsync();

            return new CandidateAssessmentResultDto
            {
                Id = result.Id,
                AssessmentId = result.AssessmentId,
                AssessmentTitle = assessment.Title,
                TotalQuestions = result.TotalQuestions,
                CorrectAnswers = result.CorrectAnswers,
                TotalMarks = result.TotalMarks,
                ObtainedMarks = result.ObtainedMarks,
                Percentage = result.Percentage,
                IsPassed = result.IsPassed,
                StartedAt = result.StartedAt,
                CompletedAt = result.CompletedAt,
                IsCompleted = result.IsCompleted
            };
        }

        public async Task<CandidateAssessmentResultDto?>
            GetAssessmentResultAsync(
                int candidateId,
                int assessmentId)
        {
            var result =
                await _context.AssessmentResults
                    .Where(r =>
                        r.AssessmentId == assessmentId &&
                        r.CandidateId == candidateId &&
                        r.IsCompleted)
                    .FirstOrDefaultAsync();

            if (result == null)
            {
                return null;
            }

            var assessmentTitle =
                await _context.Assessments
                    .Where(a => a.Id == assessmentId)
                    .Select(a => a.Title)
                    .FirstOrDefaultAsync();

            return new CandidateAssessmentResultDto
            {
                Id = result.Id,
                AssessmentId = result.AssessmentId,
                AssessmentTitle =
                    assessmentTitle ?? string.Empty,
                TotalQuestions =
                    result.TotalQuestions,
                CorrectAnswers =
                    result.CorrectAnswers,
                TotalMarks =
                    result.TotalMarks,
                ObtainedMarks =
                    result.ObtainedMarks,
                Percentage =
                    result.Percentage,
                IsPassed =
                    result.IsPassed,
                StartedAt =
                    result.StartedAt,
                CompletedAt =
                    result.CompletedAt,
                IsCompleted =
                    result.IsCompleted
            };
        }

        private async Task<Assessment?>
            GetCandidateAssessmentAsync(
                int candidateId,
                int assessmentId)
        {
            return await _context.Assessments
                .Where(a =>
                    a.Id == assessmentId &&
                    a.IsActive &&
                    _context.Applications.Any(app =>
                        app.CandidateId == candidateId &&
                        app.JobId == a.JobId &&
                        app.IsActive))
                .FirstOrDefaultAsync();
        }
    }
}