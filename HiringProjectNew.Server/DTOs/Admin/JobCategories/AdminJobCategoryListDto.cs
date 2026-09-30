namespace HiringProjectNew.Server.DTOs.Admin.JobCategories
{
    public class AdminJobCategoryListDto
    {
        public List<AdminJobCategoryDto> JobCategories { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}