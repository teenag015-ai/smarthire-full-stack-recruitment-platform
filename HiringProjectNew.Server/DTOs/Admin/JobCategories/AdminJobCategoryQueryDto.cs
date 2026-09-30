namespace HiringProjectNew.Server.DTOs.Admin.JobCategories
{
    public class AdminJobCategoryQueryDto
    {
        public string? Search { get; set; }

        public bool? IsActive { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}