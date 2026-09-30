using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Candidate.Interviews;
using HiringProjectNew.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class CandidateInterviewService
        : ICandidateInterviewService
    {
        private readonly ApplicationDbContext _context;

        public CandidateInterviewService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // ==================================================
        // GET MY INTERVIEWS
        // ==================================================

        public async Task<List<CandidateInterviewDto>>
            GetMyInterviewsAsync(int candidateId)
        {
            var interviews =
                await (
                    from interview in _context.Interviews

                    join application in
                        _context.Applications
                        on interview.ApplicationId
                        equals application.Id

                    join job in
                        _context.Jobs
                        on application.JobId
                        equals job.Id

                    where application.CandidateId ==
                          candidateId

                    orderby interview.ScheduledAt

                    select new CandidateInterviewDto
                    {
                        Id = interview.Id,

                        ApplicationId =
                            interview.ApplicationId,

                        JobId =
                            job.Id,

                        JobTitle =
                            job.Title,

                        InterviewType =
                            interview.InterviewType,

                        ScheduledAt =
                            interview.ScheduledAt,

                        DurationMinutes =
                            interview.DurationMinutes,

                        MeetingLink =
                            interview.MeetingLink,

                        Location =
                            interview.Location,

                        InterviewerName =
                            interview.InterviewerName,

                        InterviewerEmail =
                            interview.InterviewerEmail,

                        Status =
                            interview.Status,

                        Notes =
                            interview.Notes,

                        CreatedAt =
                            interview.CreatedAt,

                        UpdatedAt =
                            interview.UpdatedAt
                    }
                ).ToListAsync();

            return interviews;
        }


        // ==================================================
        // GET INTERVIEW DETAILS
        // ==================================================

        public async Task<CandidateInterviewDto?>
            GetInterviewDetailsAsync(
                int candidateId,
                int interviewId)
        {
            var interview =
                await (
                    from interviewRecord in
                        _context.Interviews

                    join application in
                        _context.Applications
                        on interviewRecord.ApplicationId
                        equals application.Id

                    join job in
                        _context.Jobs
                        on application.JobId
                        equals job.Id

                    where
                        interviewRecord.Id ==
                        interviewId

                        &&
                        application.CandidateId ==
                        candidateId

                    select new CandidateInterviewDto
                    {
                        Id =
                            interviewRecord.Id,

                        ApplicationId =
                            interviewRecord.ApplicationId,

                        JobId =
                            job.Id,

                        JobTitle =
                            job.Title,

                        InterviewType =
                            interviewRecord.InterviewType,

                        ScheduledAt =
                            interviewRecord.ScheduledAt,

                        DurationMinutes =
                            interviewRecord.DurationMinutes,

                        MeetingLink =
                            interviewRecord.MeetingLink,

                        Location =
                            interviewRecord.Location,

                        InterviewerName =
                            interviewRecord.InterviewerName,

                        InterviewerEmail =
                            interviewRecord.InterviewerEmail,

                        Status =
                            interviewRecord.Status,

                        Notes =
                            interviewRecord.Notes,

                        CreatedAt =
                            interviewRecord.CreatedAt,

                        UpdatedAt =
                            interviewRecord.UpdatedAt
                    }
                ).FirstOrDefaultAsync();

            return interview;
        }
    }
}