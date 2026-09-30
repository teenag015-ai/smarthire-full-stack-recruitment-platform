namespace HiringProjectNew.Server.DTOs.Interviewer
{
    public class InterviewerDashboardDto
    {
        public int TotalInterviews { get; set; }

        public int UpcomingInterviews { get; set; }

        public int TodayInterviews { get; set; }

        public int CompletedInterviews { get; set; }

        public int CancelledInterviews { get; set; }

        public int RescheduledInterviews { get; set; }

        public List<InterviewerInterviewDto> UpcomingInterviewList { get; set; }
            = new();
    }
}