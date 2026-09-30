using HiringProjectNew.Server.DTOs.Admin;
using HiringProjectNew.Server.DTOs.Admin.Candidates;
using HiringProjectNew.Server.DTOs.Admin.Departments;
using HiringProjectNew.Server.DTOs.Admin.JobCategories;
using HiringProjectNew.Server.DTOs.Admin.Recruiters;
using HiringProjectNew.Server.DTOs.Admin.Skills;
using HiringProjectNew.Server.DTOs.Admin.Users;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IAdminService
    {
        // Dashboard
        Task<AdminDashboardDto> GetDashboardAsync();


        // Users
        Task<AdminUserListDto> GetUsersAsync(
            AdminUserQueryDto query);

        Task<AdminUserDto?> GetUserByIdAsync(int id);

        Task<bool> UpdateUserStatusAsync(
            int id,
            bool isActive);


        // Recruiters
        Task<AdminRecruiterListDto> GetRecruitersAsync(
            AdminRecruiterQueryDto query);

        Task<AdminRecruiterDto?> GetRecruiterByIdAsync(
            int id);

        Task<AdminRecruiterDto> CreateRecruiterAsync(
            CreateRecruiterDto request);

        Task<AdminRecruiterDto?> EditRecruiterAsync(
            int id,
            EditRecruiterDto request);

        Task<bool> DeleteRecruiterAsync(
            int id);

        Task<bool> UpdateRecruiterStatusAsync(
            int id,
            bool isActive);


        // Candidates
        Task<AdminCandidateListDto> GetCandidatesAsync(
            AdminCandidateQueryDto query);

        Task<AdminCandidateDto?> GetCandidateByIdAsync(
            int id);

        Task<AdminCandidateDto> CreateCandidateAsync(
            CreateCandidateDto request);

        Task<AdminCandidateDto?> EditCandidateAsync(
            int id,
            EditCandidateDto request);

        Task<bool> DeleteCandidateAsync(
            int id);

        Task<bool> UpdateCandidateStatusAsync(
            int id,
            bool isActive);


        // Departments
        Task<AdminDepartmentListDto> GetDepartmentsAsync(
            AdminDepartmentQueryDto query);

        Task<AdminDepartmentDto?> GetDepartmentByIdAsync(
            int id);

        Task<AdminDepartmentDto> CreateDepartmentAsync(
            CreateDepartmentDto request);

        Task<AdminDepartmentDto?> EditDepartmentAsync(
            int id,
            EditDepartmentDto request);

        Task<bool> DeleteDepartmentAsync(
            int id);

        Task<bool> UpdateDepartmentStatusAsync(
            int id,
            bool isActive);


        // Skills
        Task<AdminSkillListDto> GetSkillsAsync(
            AdminSkillQueryDto query);

        Task<AdminSkillDto?> GetSkillByIdAsync(
            int id);

        Task<AdminSkillDto> CreateSkillAsync(
            CreateSkillDto request);

        Task<AdminSkillDto?> EditSkillAsync(
            int id,
            EditSkillDto request);

        Task<bool> DeleteSkillAsync(
            int id);

        Task<bool> UpdateSkillStatusAsync(
            int id,
            bool isActive);


        // Job Categories
        Task<AdminJobCategoryListDto> GetJobCategoriesAsync(
            AdminJobCategoryQueryDto query);

        Task<AdminJobCategoryDto?> GetJobCategoryByIdAsync(
            int id);

        Task<AdminJobCategoryDto> CreateJobCategoryAsync(
            CreateJobCategoryDto request);

        Task<AdminJobCategoryDto?> EditJobCategoryAsync(
            int id,
            EditJobCategoryDto request);

        Task<bool> DeleteJobCategoryAsync(
            int id);

        Task<bool> UpdateJobCategoryStatusAsync(
            int id,
            bool isActive);
    }
}