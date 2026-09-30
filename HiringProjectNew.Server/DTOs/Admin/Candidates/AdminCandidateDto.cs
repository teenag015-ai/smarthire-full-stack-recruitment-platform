namespace HiringProjectNew.Server.DTOs.Admin.Candidates
{
    public class AdminCandidateDto
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = "Candidate";

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}