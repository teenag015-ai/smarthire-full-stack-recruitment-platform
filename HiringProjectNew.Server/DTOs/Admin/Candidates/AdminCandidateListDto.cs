using System.Collections.Generic;

namespace HiringProjectNew.Server.DTOs.Admin.Candidates
{
    public class AdminCandidateListDto
    {
        public List<AdminCandidateDto> Candidates { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }
    }
}