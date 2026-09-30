using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<Skill> Skills { get; set; }

        public DbSet<JobCategory> JobCategories { get; set; }

        public DbSet<Job> Jobs { get; set; }

        public DbSet<Application> Applications { get; set; }

        public DbSet<Assessment> Assessments { get; set; }

        public DbSet<AssessmentQuestion> AssessmentQuestions { get; set; }

        public DbSet<AssessmentResult> AssessmentResults { get; set; }

        public DbSet<Interview> Interviews { get; set; }

        public DbSet<Offer> Offers { get; set; }

        // Candidate Profile
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }

        // Interview Evaluation
        public DbSet<InterviewEvaluation> InterviewEvaluations { get; set; }
    }
}