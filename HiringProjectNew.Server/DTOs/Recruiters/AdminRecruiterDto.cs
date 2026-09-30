namespace HiringProjectNew.Server.DTOs.Admin.Recruiters
{
    public class AdminRecruiterDto
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = "Recruiter";

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}