using System.ComponentModel.DataAnnotations;

namespace HiringProjectNew.Server.DTOs.Admin.Departments
{
    public class CreateDepartmentDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }
}