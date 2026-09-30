using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Helpers
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminAsync(
            ApplicationDbContext context)
        {
            // Check whether Admin already exists
            var existingAdmin = await context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == "admin@smarthire.com");

            // Admin already exists
            if (existingAdmin != null)
            {
                return;
            }

            // Create Admin user
            var admin = new User
            {
                FullName = "SmartHire Admin",
                Email = "admin@smarthire.com",
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Hash Admin password
            var passwordHasher = new PasswordHasher<User>();

            admin.PasswordHash =
                passwordHasher.HashPassword(
                    admin,
                    "Admin@12345"
                );

            // Add Admin to database
            context.Users.Add(admin);

            await context.SaveChangesAsync();
        }
    }
}