using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Recruiter.Assessments;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class RecruiterAssessmentQuestionService
        : IRecruiterAssessmentQuestionService
    {
        private readonly ApplicationDbContext _context;

        public RecruiterAssessmentQuestionService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AssessmentQuestionDto>>
            GetQuestionsAsync(
                int recruiterId,
                int assessmentId)
        {
            var assessmentExists =
                await _context.Assessments.AnyAsync(a =>
                    a.Id == assessmentId &&
                    a.RecruiterId == recruiterId);

            if (!assessmentExists)
            {
                return new List<AssessmentQuestionDto>();
            }

            return await _context.AssessmentQuestions
                .Where(q =>
                    q.AssessmentId == assessmentId)
                .OrderBy(q => q.Id)
                .Select(q => new AssessmentQuestionDto
                {
                    Id = q.Id,

                    AssessmentId =
                        q.AssessmentId,

                    QuestionText =
                        q.QuestionText,

                    OptionA =
                        q.OptionA,

                    OptionB =
                        q.OptionB,

                    OptionC =
                        q.OptionC,

                    OptionD =
                        q.OptionD,

                    CorrectAnswer =
                        q.CorrectAnswer,

                    Marks =
                        q.Marks,

                    IsActive =
                        q.IsActive,

                    CreatedAt =
                        q.CreatedAt,

                    UpdatedAt =
                        q.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<AssessmentQuestionDto?>
            GetQuestionByIdAsync(
                int recruiterId,
                int questionId)
        {
            var question =
                await (
                    from q in _context.AssessmentQuestions

                    join assessment in _context.Assessments
                        on q.AssessmentId equals assessment.Id

                    where q.Id == questionId &&
                          assessment.RecruiterId == recruiterId

                    select new AssessmentQuestionDto
                    {
                        Id = q.Id,

                        AssessmentId =
                            q.AssessmentId,

                        QuestionText =
                            q.QuestionText,

                        OptionA =
                            q.OptionA,

                        OptionB =
                            q.OptionB,

                        OptionC =
                            q.OptionC,

                        OptionD =
                            q.OptionD,

                        CorrectAnswer =
                            q.CorrectAnswer,

                        Marks =
                            q.Marks,

                        IsActive =
                            q.IsActive,

                        CreatedAt =
                            q.CreatedAt,

                        UpdatedAt =
                            q.UpdatedAt
                    }
                )
                .FirstOrDefaultAsync();

            return question;
        }

        public async Task<AssessmentQuestionDto>
            CreateQuestionAsync(
                int recruiterId,
                CreateAssessmentQuestionDto request)
        {
            var assessment =
                await _context.Assessments
                    .FirstOrDefaultAsync(a =>
                        a.Id == request.AssessmentId &&
                        a.RecruiterId == recruiterId &&
                        a.IsActive);

            if (assessment == null)
            {
                throw new InvalidOperationException(
                    "Assessment not found, inactive, or does not belong to this recruiter.");
            }

            var correctAnswer =
                request.CorrectAnswer
                    .Trim()
                    .ToUpper();

            var allowedAnswers =
                new[] { "A", "B", "C", "D" };

            if (!allowedAnswers.Contains(correctAnswer))
            {
                throw new InvalidOperationException(
                    "Correct answer must be A, B, C, or D.");
            }

            var question = new AssessmentQuestion
            {
                AssessmentId =
                    request.AssessmentId,

                QuestionText =
                    request.QuestionText.Trim(),

                OptionA =
                    request.OptionA.Trim(),

                OptionB =
                    request.OptionB.Trim(),

                OptionC =
                    request.OptionC.Trim(),

                OptionD =
                    request.OptionD.Trim(),

                CorrectAnswer =
                    correctAnswer,

                Marks =
                    request.Marks,

                IsActive = true,

                CreatedAt =
                    DateTime.UtcNow
            };

            _context.AssessmentQuestions.Add(question);

            await _context.SaveChangesAsync();

            return new AssessmentQuestionDto
            {
                Id = question.Id,

                AssessmentId =
                    question.AssessmentId,

                QuestionText =
                    question.QuestionText,

                OptionA =
                    question.OptionA,

                OptionB =
                    question.OptionB,

                OptionC =
                    question.OptionC,

                OptionD =
                    question.OptionD,

                CorrectAnswer =
                    question.CorrectAnswer,

                Marks =
                    question.Marks,

                IsActive =
                    question.IsActive,

                CreatedAt =
                    question.CreatedAt,

                UpdatedAt =
                    question.UpdatedAt
            };
        }

        public async Task<AssessmentQuestionDto?>
            EditQuestionAsync(
                int recruiterId,
                int questionId,
                EditAssessmentQuestionDto request)
        {
            var question =
                await (
                    from q in _context.AssessmentQuestions

                    join assessment in _context.Assessments
                        on q.AssessmentId equals assessment.Id

                    where q.Id == questionId &&
                          assessment.RecruiterId == recruiterId

                    select q
                )
                .FirstOrDefaultAsync();

            if (question == null)
            {
                return null;
            }

            var correctAnswer =
                request.CorrectAnswer
                    .Trim()
                    .ToUpper();

            var allowedAnswers =
                new[] { "A", "B", "C", "D" };

            if (!allowedAnswers.Contains(correctAnswer))
            {
                throw new InvalidOperationException(
                    "Correct answer must be A, B, C, or D.");
            }

            question.QuestionText =
                request.QuestionText.Trim();

            question.OptionA =
                request.OptionA.Trim();

            question.OptionB =
                request.OptionB.Trim();

            question.OptionC =
                request.OptionC.Trim();

            question.OptionD =
                request.OptionD.Trim();

            question.CorrectAnswer =
                correctAnswer;

            question.Marks =
                request.Marks;

            question.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AssessmentQuestionDto
            {
                Id = question.Id,

                AssessmentId =
                    question.AssessmentId,

                QuestionText =
                    question.QuestionText,

                OptionA =
                    question.OptionA,

                OptionB =
                    question.OptionB,

                OptionC =
                    question.OptionC,

                OptionD =
                    question.OptionD,

                CorrectAnswer =
                    question.CorrectAnswer,

                Marks =
                    question.Marks,

                IsActive =
                    question.IsActive,

                CreatedAt =
                    question.CreatedAt,

                UpdatedAt =
                    question.UpdatedAt
            };
        }

        public async Task<bool>
            DeleteQuestionAsync(
                int recruiterId,
                int questionId)
        {
            var question =
                await (
                    from q in _context.AssessmentQuestions

                    join assessment in _context.Assessments
                        on q.AssessmentId equals assessment.Id

                    where q.Id == questionId &&
                          assessment.RecruiterId == recruiterId

                    select q
                )
                .FirstOrDefaultAsync();

            if (question == null)
            {
                return false;
            }

            _context.AssessmentQuestions.Remove(question);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool>
            UpdateQuestionStatusAsync(
                int recruiterId,
                int questionId,
                bool isActive)
        {
            var question =
                await (
                    from q in _context.AssessmentQuestions

                    join assessment in _context.Assessments
                        on q.AssessmentId equals assessment.Id

                    where q.Id == questionId &&
                          assessment.RecruiterId == recruiterId

                    select q
                )
                .FirstOrDefaultAsync();

            if (question == null)
            {
                return false;
            }

            question.IsActive =
                isActive;

            question.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}