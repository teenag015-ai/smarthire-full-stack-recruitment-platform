namespace HiringProjectNew.Server.DTOs.Admin.Departments
{
    public class AdminDepartmentListDto
    {
        public List<AdminDepartmentDto> Departments { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}