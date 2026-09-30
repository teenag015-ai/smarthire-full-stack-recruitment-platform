using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Admin.Skills
{
    public class EditSkillDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }
}