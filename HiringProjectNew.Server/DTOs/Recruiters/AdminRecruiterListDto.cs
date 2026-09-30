using System.Collections.Generic;

namespace HiringProjectNew.Server.DTOs.Admin.Recruiters
{
    public class AdminRecruiterListDto
    {
        public List<AdminRecruiterDto> Recruiters { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}