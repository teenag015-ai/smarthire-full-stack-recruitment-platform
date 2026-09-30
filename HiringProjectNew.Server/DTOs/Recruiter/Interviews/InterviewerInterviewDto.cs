namespace HiringProjectNew.Server.DTOs.Interviewer
{
    public class InterviewerInterviewDto
    {
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        public int CandidateId { get; set; }

        public string CandidateName { get; set; } = string.Empty;

        public string CandidateEmail { get; set; } = string.Empty;

        public int JobId { get; set; }

        public string JobTitle { get; set; } = string.Empty;

        public string InterviewType { get; set; } = string.Empty;

        public DateTime ScheduledAt { get; set; }

        public int DurationMinutes { get; set; }

        public string MeetingLink { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string InterviewerName { get; set; } = string.Empty;

        public string InterviewerEmail { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;
    }
}