using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Candidate.Profile
{
    public class UpdateCandidateProfileDto
    {
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(150)]
        public string ProfessionalHeadline { get; set; } = string.Empty;

        [MaxLength(150)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string About { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Skills { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Education { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Experience { get; set; } = string.Empty;
    }
}