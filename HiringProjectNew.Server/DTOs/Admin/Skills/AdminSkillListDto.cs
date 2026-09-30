namespace HiringProjectNew.Server.DTOs.Admin.Skills
{
    public class AdminSkillListDto
    {
        public List<AdminSkillDto> Skills { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}