namespace HiringProjectNew.Server.DTOs.Recruiter.Analytics
{
    public class RecruiterAnalyticsDto
    {
        // ================================
        // OVERVIEW
        // ================================

        public int TotalJobs { get; set; }

        public int ActiveJobs { get; set; }

        public int TotalApplicants { get; set; }

        public int TotalInterviews { get; set; }

        public int TotalOffers { get; set; }

        public int TotalHired { get; set; }


        // ================================
        // APPLICATION STAGES
        // ================================

        public int AppliedCount { get; set; }

        public int ScreeningCount { get; set; }

        public int ShortlistedCount { get; set; }

        public int AssessmentCount { get; set; }

        public int InterviewCount { get; set; }

        public int SelectedCount { get; set; }

        public int OfferCount { get; set; }

        public int HiredCount { get; set; }

        public int RejectedCount { get; set; }


        // ================================
        // INTERVIEW STATISTICS
        // ================================

        public int ScheduledInterviews { get; set; }

        public int CompletedInterviews { get; set; }

        public int CancelledInterviews { get; set; }

        public int RescheduledInterviews { get; set; }

        public int NoShowInterviews { get; set; }


        // ================================
        // OFFER STATISTICS
        // ================================

        public int DraftOffers { get; set; }

        public int SentOffers { get; set; }

        public int AcceptedOffers { get; set; }

        public int RejectedOffers { get; set; }

        public int ExpiredOffers { get; set; }

        public int WithdrawnOffers { get; set; }


        // ================================
        // CONVERSION METRICS
        // ================================

        public decimal ApplicationToInterviewRate { get; set; }

        public decimal InterviewToOfferRate { get; set; }

        public decimal OfferAcceptanceRate { get; set; }

        public decimal HiringRate { get; set; }
    }
}