using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.DTOs.Admin;
using HiringProjectNew.Server.DTOs.Admin.Candidates;
using HiringProjectNew.Server.DTOs.Admin.Departments;
using HiringProjectNew.Server.DTOs.Admin.JobCategories;
using HiringProjectNew.Server.DTOs.Admin.Recruiters;
using HiringProjectNew.Server.DTOs.Admin.Skills;
using HiringProjectNew.Server.DTOs.Admin.Users;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Models;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
        }


        // =========================================================
        // DASHBOARD
        // =========================================================

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            return new AdminDashboardDto
            {
                TotalUsers = await _context.Users.CountAsync(),

                TotalCandidates = await _context.Users
                    .CountAsync(u => u.Role == "Candidate"),

                TotalRecruiters = await _context.Users
                    .CountAsync(u => u.Role == "Recruiter"),

                TotalAdmins = await _context.Users
                    .CountAsync(u => u.Role == "Admin")
            };
        }


        // =========================================================
        // USERS
        // =========================================================

        public async Task<AdminUserListDto> GetUsersAsync(
            AdminUserQueryDto query)
        {
            var usersQuery = _context.Users
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                usersQuery = usersQuery.Where(u =>
                    u.FullName.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Role))
            {
                usersQuery = usersQuery.Where(u =>
                    u.Role == query.Role);
            }

            if (query.IsActive.HasValue)
            {
                usersQuery = usersQuery.Where(u =>
                    u.IsActive == query.IsActive.Value);
            }

            var totalRecords = await usersQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var users = await usersQuery
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return new AdminUserListDto
            {
                Users = users,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }


        public async Task<AdminUserDto?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == id)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<bool> UpdateUserStatusAsync(
            int id,
            bool isActive)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return false;
            }

            if (user.Role == "Admin" && !isActive)
            {
                return false;
            }

            user.IsActive = isActive;

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // RECRUITERS
        // =========================================================

        public async Task<AdminRecruiterListDto> GetRecruitersAsync(
            AdminRecruiterQueryDto query)
        {
            var recruitersQuery = _context.Users
                .AsNoTracking()
                .Where(u => u.Role == "Recruiter")
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                recruitersQuery = recruitersQuery.Where(u =>
                    u.FullName.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (query.IsActive.HasValue)
            {
                recruitersQuery = recruitersQuery.Where(u =>
                    u.IsActive == query.IsActive.Value);
            }

            var totalRecords =
                await recruitersQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var recruiters = await recruitersQuery
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminRecruiterDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return new AdminRecruiterListDto
            {
                Recruiters = recruiters,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }


        public async Task<AdminRecruiterDto?> GetRecruiterByIdAsync(
            int id)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u =>
                    u.Id == id &&
                    u.Role == "Recruiter")
                .Select(u => new AdminRecruiterDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<AdminRecruiterDto> CreateRecruiterAsync(
            CreateRecruiterDto request)
        {
            var email = request.Email.Trim().ToLower();

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == email);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            var recruiter = new User
            {
                FullName = request.FullName.Trim(),
                Email = email,
                Role = "Recruiter",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            recruiter.PasswordHash =
                _passwordHasher.HashPassword(
                    recruiter,
                    request.Password);

            _context.Users.Add(recruiter);

            await _context.SaveChangesAsync();

            return new AdminRecruiterDto
            {
                Id = recruiter.Id,
                FullName = recruiter.FullName,
                Email = recruiter.Email,
                Role = recruiter.Role,
                IsActive = recruiter.IsActive,
                CreatedAt = recruiter.CreatedAt
            };
        }


        public async Task<AdminRecruiterDto?> EditRecruiterAsync(
            int id,
            EditRecruiterDto request)
        {
            var recruiter = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == id &&
                    u.Role == "Recruiter");

            if (recruiter == null)
            {
                return null;
            }

            var email = request.Email.Trim().ToLower();

            var emailExists = await _context.Users
                .AnyAsync(u =>
                    u.Email == email &&
                    u.Id != id);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            recruiter.FullName = request.FullName.Trim();
            recruiter.Email = email;

            await _context.SaveChangesAsync();

            return new AdminRecruiterDto
            {
                Id = recruiter.Id,
                FullName = recruiter.FullName,
                Email = recruiter.Email,
                Role = recruiter.Role,
                IsActive = recruiter.IsActive,
                CreatedAt = recruiter.CreatedAt
            };
        }


        public async Task<bool> DeleteRecruiterAsync(int id)
        {
            var recruiter = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == id &&
                    u.Role == "Recruiter");

            if (recruiter == null)
            {
                return false;
            }

            _context.Users.Remove(recruiter);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> UpdateRecruiterStatusAsync(
            int id,
            bool isActive)
        {
            var recruiter = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == id &&
                    u.Role == "Recruiter");

            if (recruiter == null)
            {
                return false;
            }

            recruiter.IsActive = isActive;

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // CANDIDATES
        // =========================================================

        public async Task<AdminCandidateListDto> GetCandidatesAsync(
            AdminCandidateQueryDto query)
        {
            var candidatesQuery = _context.Users
                .AsNoTracking()
                .Where(u => u.Role == "Candidate")
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                candidatesQuery = candidatesQuery.Where(u =>
                    u.FullName.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (query.IsActive.HasValue)
            {
                candidatesQuery = candidatesQuery.Where(u =>
                    u.IsActive == query.IsActive.Value);
            }

            var totalRecords =
                await candidatesQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var candidates = await candidatesQuery
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminCandidateDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return new AdminCandidateListDto
            {
                Candidates = candidates,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }


        public async Task<AdminCandidateDto?> GetCandidateByIdAsync(
            int id)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u =>
                    u.Id == id &&
                    u.Role == "Candidate")
                .Select(u => new AdminCandidateDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<AdminCandidateDto> CreateCandidateAsync(
            CreateCandidateDto request)
        {
            var email = request.Email.Trim().ToLower();

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == email);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            var candidate = new User
            {
                FullName = request.FullName.Trim(),
                Email = email,
                Role = "Candidate",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            candidate.PasswordHash =
                _passwordHasher.HashPassword(
                    candidate,
                    request.Password);

            _context.Users.Add(candidate);

            await _context.SaveChangesAsync();

            return new AdminCandidateDto
            {
                Id = candidate.Id,
                FullName = candidate.FullName,
                Email = candidate.Email,
                Role = candidate.Role,
                IsActive = candidate.IsActive,
                CreatedAt = candidate.CreatedAt
            };
        }


        public async Task<AdminCandidateDto?> EditCandidateAsync(
            int id,
            EditCandidateDto request)
        {
            var candidate = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == id &&
                    u.Role == "Candidate");

            if (candidate == null)
            {
                return null;
            }

            var email = request.Email.Trim().ToLower();

            var emailExists = await _context.Users
                .AnyAsync(u =>
                    u.Email == email &&
                    u.Id != id);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            candidate.FullName = request.FullName.Trim();
            candidate.Email = email;

            await _context.SaveChangesAsync();

            return new AdminCandidateDto
            {
                Id = candidate.Id,
                FullName = candidate.FullName,
                Email = candidate.Email,
                Role = candidate.Role,
                IsActive = candidate.IsActive,
                CreatedAt = candidate.CreatedAt
            };
        }


        public async Task<bool> DeleteCandidateAsync(int id)
        {
            var candidate = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == id &&
                    u.Role == "Candidate");

            if (candidate == null)
            {
                return false;
            }

            _context.Users.Remove(candidate);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> UpdateCandidateStatusAsync(
            int id,
            bool isActive)
        {
            var candidate = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == id &&
                    u.Role == "Candidate");

            if (candidate == null)
            {
                return false;
            }

            candidate.IsActive = isActive;

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // DEPARTMENTS
        // =========================================================

        public async Task<AdminDepartmentListDto> GetDepartmentsAsync(
            AdminDepartmentQueryDto query)
        {
            var departmentsQuery = _context.Departments
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                departmentsQuery = departmentsQuery.Where(d =>
                    d.Name.Contains(search) ||
                    d.Description.Contains(search));
            }

            if (query.IsActive.HasValue)
            {
                departmentsQuery = departmentsQuery.Where(d =>
                    d.IsActive == query.IsActive.Value);
            }

            var totalRecords =
                await departmentsQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var departments = await departmentsQuery
                .OrderByDescending(d => d.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new AdminDepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .ToListAsync();

            return new AdminDepartmentListDto
            {
                Departments = departments,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }


        public async Task<AdminDepartmentDto?> GetDepartmentByIdAsync(
            int id)
        {
            return await _context.Departments
                .AsNoTracking()
                .Where(d => d.Id == id)
                .Select(d => new AdminDepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<AdminDepartmentDto> CreateDepartmentAsync(
            CreateDepartmentDto request)
        {
            var name = request.Name.Trim();

            var nameExists = await _context.Departments
                .AnyAsync(d => d.Name == name);

            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A department with this name already exists.");
            }

            var department = new Department
            {
                Name = name,
                Description = request.Description.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(department);

            await _context.SaveChangesAsync();

            return new AdminDepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            };
        }


        public async Task<AdminDepartmentDto?> EditDepartmentAsync(
            int id,
            EditDepartmentDto request)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return null;
            }

            var name = request.Name.Trim();

            var nameExists = await _context.Departments
                .AnyAsync(d =>
                    d.Name == name &&
                    d.Id != id);

            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A department with this name already exists.");
            }

            department.Name = name;

            department.Description =
                request.Description.Trim();

            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AdminDepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            };
        }


        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return false;
            }

            _context.Departments.Remove(department);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> UpdateDepartmentStatusAsync(
            int id,
            bool isActive)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return false;
            }

            department.IsActive = isActive;
            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // SKILLS
        // =========================================================

        public async Task<AdminSkillListDto> GetSkillsAsync(
            AdminSkillQueryDto query)
        {
            var skillsQuery = _context.Skills
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                skillsQuery = skillsQuery.Where(s =>
                    s.Name.Contains(search) ||
                    s.Description.Contains(search));
            }

            if (query.IsActive.HasValue)
            {
                skillsQuery = skillsQuery.Where(s =>
                    s.IsActive == query.IsActive.Value);
            }

            var totalRecords =
                await skillsQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var skills = await skillsQuery
                .OrderByDescending(s => s.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new AdminSkillDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            return new AdminSkillListDto
            {
                Skills = skills,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }


        public async Task<AdminSkillDto?> GetSkillByIdAsync(
            int id)
        {
            return await _context.Skills
                .AsNoTracking()
                .Where(s => s.Id == id)
                .Select(s => new AdminSkillDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<AdminSkillDto> CreateSkillAsync(
            CreateSkillDto request)
        {
            var name = request.Name.Trim();

            var nameExists = await _context.Skills
                .AnyAsync(s => s.Name == name);

            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A skill with this name already exists.");
            }

            var skill = new Skill
            {
                Name = name,
                Description = request.Description.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Skills.Add(skill);

            await _context.SaveChangesAsync();

            return new AdminSkillDto
            {
                Id = skill.Id,
                Name = skill.Name,
                Description = skill.Description,
                IsActive = skill.IsActive,
                CreatedAt = skill.CreatedAt,
                UpdatedAt = skill.UpdatedAt
            };
        }


        public async Task<AdminSkillDto?> EditSkillAsync(
            int id,
            EditSkillDto request)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null)
            {
                return null;
            }

            var name = request.Name.Trim();

            var nameExists = await _context.Skills
                .AnyAsync(s =>
                    s.Name == name &&
                    s.Id != id);

            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A skill with this name already exists.");
            }

            skill.Name = name;

            skill.Description =
                request.Description.Trim();

            skill.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AdminSkillDto
            {
                Id = skill.Id,
                Name = skill.Name,
                Description = skill.Description,
                IsActive = skill.IsActive,
                CreatedAt = skill.CreatedAt,
                UpdatedAt = skill.UpdatedAt
            };
        }


        public async Task<bool> DeleteSkillAsync(int id)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null)
            {
                return false;
            }

            _context.Skills.Remove(skill);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> UpdateSkillStatusAsync(
            int id,
            bool isActive)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null)
            {
                return false;
            }

            skill.IsActive = isActive;
            skill.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // JOB CATEGORIES
        // =========================================================

        public async Task<AdminJobCategoryListDto>
            GetJobCategoriesAsync(
                AdminJobCategoryQueryDto query)
        {
            var jobCategoriesQuery = _context.JobCategories
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                jobCategoriesQuery =
                    jobCategoriesQuery.Where(j =>
                        j.Name.Contains(search) ||
                        j.Description.Contains(search));
            }

            if (query.IsActive.HasValue)
            {
                jobCategoriesQuery =
                    jobCategoriesQuery.Where(j =>
                        j.IsActive == query.IsActive.Value);
            }

            var totalRecords =
                await jobCategoriesQuery.CountAsync();

            var pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber;

            var pageSize = query.PageSize <= 0
                ? 10
                : query.PageSize;

            var totalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize);

            var jobCategories =
                await jobCategoriesQuery
                    .OrderByDescending(j => j.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(j => new AdminJobCategoryDto
                    {
                        Id = j.Id,
                        Name = j.Name,
                        Description = j.Description,
                        IsActive = j.IsActive,
                        CreatedAt = j.CreatedAt,
                        UpdatedAt = j.UpdatedAt
                    })
                    .ToListAsync();

            return new AdminJobCategoryListDto
            {
                JobCategories = jobCategories,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }


        public async Task<AdminJobCategoryDto?>
            GetJobCategoryByIdAsync(int id)
        {
            return await _context.JobCategories
                .AsNoTracking()
                .Where(j => j.Id == id)
                .Select(j => new AdminJobCategoryDto
                {
                    Id = j.Id,
                    Name = j.Name,
                    Description = j.Description,
                    IsActive = j.IsActive,
                    CreatedAt = j.CreatedAt,
                    UpdatedAt = j.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<AdminJobCategoryDto>
            CreateJobCategoryAsync(
                CreateJobCategoryDto request)
        {
            var name = request.Name.Trim();

            var nameExists = await _context.JobCategories
                .AnyAsync(j => j.Name == name);

            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A job category with this name already exists.");
            }

            var jobCategory = new JobCategory
            {
                Name = name,
                Description = request.Description.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.JobCategories.Add(jobCategory);

            await _context.SaveChangesAsync();

            return new AdminJobCategoryDto
            {
                Id = jobCategory.Id,
                Name = jobCategory.Name,
                Description = jobCategory.Description,
                IsActive = jobCategory.IsActive,
                CreatedAt = jobCategory.CreatedAt,
                UpdatedAt = jobCategory.UpdatedAt
            };
        }


        public async Task<AdminJobCategoryDto?>
            EditJobCategoryAsync(
                int id,
                EditJobCategoryDto request)
        {
            var jobCategory =
                await _context.JobCategories
                    .FirstOrDefaultAsync(j => j.Id == id);

            if (jobCategory == null)
            {
                return null;
            }

            var name = request.Name.Trim();

            var nameExists =
                await _context.JobCategories
                    .AnyAsync(j =>
                        j.Name == name &&
                        j.Id != id);

            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A job category with this name already exists.");
            }

            jobCategory.Name = name;

            jobCategory.Description =
                request.Description.Trim();

            jobCategory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AdminJobCategoryDto
            {
                Id = jobCategory.Id,
                Name = jobCategory.Name,
                Description = jobCategory.Description,
                IsActive = jobCategory.IsActive,
                CreatedAt = jobCategory.CreatedAt,
                UpdatedAt = jobCategory.UpdatedAt
            };
        }


        public async Task<bool> DeleteJobCategoryAsync(int id)
        {
            var jobCategory =
                await _context.JobCategories
                    .FirstOrDefaultAsync(j => j.Id == id);

            if (jobCategory == null)
            {
                return false;
            }

            _context.JobCategories.Remove(jobCategory);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> UpdateJobCategoryStatusAsync(
            int id,
            bool isActive)
        {
            var jobCategory =
                await _context.JobCategories
                    .FirstOrDefaultAsync(j => j.Id == id);

            if (jobCategory == null)
            {
                return false;
            }

            jobCategory.IsActive = isActive;
            jobCategory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}