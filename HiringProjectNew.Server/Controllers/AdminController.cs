using HiringProjectNew.Server.DTOs.Admin;
using HiringProjectNew.Server.DTOs.Admin.Candidates;
using HiringProjectNew.Server.DTOs.Admin.Departments;
using HiringProjectNew.Server.DTOs.Admin.JobCategories;
using HiringProjectNew.Server.DTOs.Admin.Recruiters;
using HiringProjectNew.Server.DTOs.Admin.Skills;
using HiringProjectNew.Server.DTOs.Admin.Users;
using HiringProjectNew.Server.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiringProjectNew.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }


        // =========================================================
        // DASHBOARD
        // =========================================================

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var result =
                    await _adminService.GetDashboardAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        // =========================================================
        // USERS
        // =========================================================

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] AdminUserQueryDto query)
        {
            try
            {
                var result =
                    await _adminService.GetUsersAsync(query);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var result =
                    await _adminService.GetUserByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "User not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            int id,
            [FromBody] bool isActive)
        {
            try
            {
                var result =
                    await _adminService
                        .UpdateUserStatusAsync(
                            id,
                            isActive);

                if (!result)
                {
                    return BadRequest(new
                    {
                        message =
                            "User not found or admin account cannot be deactivated."
                    });
                }

                return Ok(new
                {
                    message =
                        isActive
                            ? "User activated successfully."
                            : "User deactivated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        // =========================================================
        // RECRUITERS
        // =========================================================

        [HttpGet("recruiters")]
        public async Task<IActionResult> GetRecruiters(
            [FromQuery] AdminRecruiterQueryDto query)
        {
            try
            {
                var result =
                    await _adminService
                        .GetRecruitersAsync(query);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpGet("recruiters/{id}")]
        public async Task<IActionResult> GetRecruiterById(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .GetRecruiterByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Recruiter not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPost("recruiters")]
        public async Task<IActionResult> CreateRecruiter(
            [FromBody] CreateRecruiterDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .CreateRecruiterAsync(request);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("recruiters/{id}")]
        public async Task<IActionResult> EditRecruiter(
            int id,
            [FromBody] EditRecruiterDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .EditRecruiterAsync(
                            id,
                            request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Recruiter not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpDelete("recruiters/{id}")]
        public async Task<IActionResult> DeleteRecruiter(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .DeleteRecruiterAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Recruiter not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Recruiter deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("recruiters/{id}/status")]
        public async Task<IActionResult> UpdateRecruiterStatus(
            int id,
            [FromBody] bool isActive)
        {
            try
            {
                var result =
                    await _adminService
                        .UpdateRecruiterStatusAsync(
                            id,
                            isActive);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Recruiter not found."
                    });
                }

                return Ok(new
                {
                    message =
                        isActive
                            ? "Recruiter activated successfully."
                            : "Recruiter deactivated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        // =========================================================
        // CANDIDATES
        // =========================================================

        [HttpGet("candidates")]
        public async Task<IActionResult> GetCandidates(
            [FromQuery] AdminCandidateQueryDto query)
        {
            try
            {
                var result =
                    await _adminService
                        .GetCandidatesAsync(query);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpGet("candidates/{id}")]
        public async Task<IActionResult> GetCandidateById(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .GetCandidateByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Candidate not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPost("candidates")]
        public async Task<IActionResult> CreateCandidate(
            [FromBody] CreateCandidateDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .CreateCandidateAsync(request);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("candidates/{id}")]
        public async Task<IActionResult> EditCandidate(
            int id,
            [FromBody] EditCandidateDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .EditCandidateAsync(
                            id,
                            request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Candidate not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpDelete("candidates/{id}")]
        public async Task<IActionResult> DeleteCandidate(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .DeleteCandidateAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Candidate not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Candidate deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("candidates/{id}/status")]
        public async Task<IActionResult> UpdateCandidateStatus(
            int id,
            [FromBody] bool isActive)
        {
            try
            {
                var result =
                    await _adminService
                        .UpdateCandidateStatusAsync(
                            id,
                            isActive);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Candidate not found."
                    });
                }

                return Ok(new
                {
                    message =
                        isActive
                            ? "Candidate activated successfully."
                            : "Candidate deactivated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        // =========================================================
        // DEPARTMENTS
        // =========================================================

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments(
            [FromQuery] AdminDepartmentQueryDto query)
        {
            try
            {
                var result =
                    await _adminService
                        .GetDepartmentsAsync(query);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpGet("departments/{id}")]
        public async Task<IActionResult> GetDepartmentById(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .GetDepartmentByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Department not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment(
            [FromBody] CreateDepartmentDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .CreateDepartmentAsync(request);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("departments/{id}")]
        public async Task<IActionResult> EditDepartment(
            int id,
            [FromBody] EditDepartmentDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .EditDepartmentAsync(
                            id,
                            request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Department not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .DeleteDepartmentAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Department not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Department deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("departments/{id}/status")]
        public async Task<IActionResult> UpdateDepartmentStatus(
            int id,
            [FromBody] bool isActive)
        {
            try
            {
                var result =
                    await _adminService
                        .UpdateDepartmentStatusAsync(
                            id,
                            isActive);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Department not found."
                    });
                }

                return Ok(new
                {
                    message =
                        isActive
                            ? "Department activated successfully."
                            : "Department deactivated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        // =========================================================
        // SKILLS
        // =========================================================

        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills(
            [FromQuery] AdminSkillQueryDto query)
        {
            try
            {
                var result =
                    await _adminService
                        .GetSkillsAsync(query);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpGet("skills/{id}")]
        public async Task<IActionResult> GetSkillById(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .GetSkillByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Skill not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPost("skills")]
        public async Task<IActionResult> CreateSkill(
            [FromBody] CreateSkillDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .CreateSkillAsync(request);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("skills/{id}")]
        public async Task<IActionResult> EditSkill(
            int id,
            [FromBody] EditSkillDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .EditSkillAsync(
                            id,
                            request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Skill not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpDelete("skills/{id}")]
        public async Task<IActionResult> DeleteSkill(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .DeleteSkillAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Skill not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Skill deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("skills/{id}/status")]
        public async Task<IActionResult> UpdateSkillStatus(
            int id,
            [FromBody] bool isActive)
        {
            try
            {
                var result =
                    await _adminService
                        .UpdateSkillStatusAsync(
                            id,
                            isActive);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Skill not found."
                    });
                }

                return Ok(new
                {
                    message =
                        isActive
                            ? "Skill activated successfully."
                            : "Skill deactivated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        // =========================================================
        // JOB CATEGORIES
        // =========================================================

        [HttpGet("job-categories")]
        public async Task<IActionResult> GetJobCategories(
            [FromQuery] AdminJobCategoryQueryDto query)
        {
            try
            {
                var result =
                    await _adminService
                        .GetJobCategoriesAsync(query);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpGet("job-categories/{id}")]
        public async Task<IActionResult> GetJobCategoryById(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .GetJobCategoryByIdAsync(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Job category not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPost("job-categories")]
        public async Task<IActionResult> CreateJobCategory(
            [FromBody] CreateJobCategoryDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .CreateJobCategoryAsync(request);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("job-categories/{id}")]
        public async Task<IActionResult> EditJobCategory(
            int id,
            [FromBody] EditJobCategoryDto request)
        {
            try
            {
                var result =
                    await _adminService
                        .EditJobCategoryAsync(
                            id,
                            request);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = "Job category not found."
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpDelete("job-categories/{id}")]
        public async Task<IActionResult> DeleteJobCategory(
            int id)
        {
            try
            {
                var result =
                    await _adminService
                        .DeleteJobCategoryAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Job category not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Job category deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }


        [HttpPut("job-categories/{id}/status")]
        public async Task<IActionResult> UpdateJobCategoryStatus(
            int id,
            [FromBody] bool isActive)
        {
            try
            {
                var result =
                    await _adminService
                        .UpdateJobCategoryStatusAsync(
                            id,
                            isActive);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Job category not found."
                    });
                }

                return Ok(new
                {
                    message =
                        isActive
                            ? "Job category activated successfully."
                            : "Job category deactivated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message = ex.Message
                    });
            }
        }
    }
}