using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Data
{
    public static class AnanyaTestDataSeeder
    {
        private const int AnanyaRecruiterId = 12;

        public static async Task ResetAndSeedAsync(
            ApplicationDbContext context)
        {
            Console.WriteLine(
                "==============================================");

            Console.WriteLine(
                "ANANYA RECRUITER DATA RESET + SEED STARTED");

            Console.WriteLine(
                "==============================================");


            // =========================================================
            // 1. VERIFY ANANYA
            // =========================================================

            var recruiterExists =
                await context.Users.AnyAsync(u =>
                    u.Id == AnanyaRecruiterId &&
                    u.Role == "Recruiter");

            if (!recruiterExists)
            {
                throw new InvalidOperationException(
                    $"Recruiter with ID {AnanyaRecruiterId} was not found."
                );
            }


            // =========================================================
            // 2. GET ANANYA'S EXISTING JOB IDS
            // =========================================================

            var oldJobIds =
                await context.Jobs
                    .Where(j =>
                        j.RecruiterId == AnanyaRecruiterId)
                    .Select(j => j.Id)
                    .ToListAsync();


            // =========================================================
            // 3. GET ANANYA'S EXISTING ASSESSMENT IDS
            // =========================================================

            var oldAssessmentIds =
                await context.Assessments
                    .Where(a =>
                        a.RecruiterId == AnanyaRecruiterId)
                    .Select(a => a.Id)
                    .ToListAsync();


            // =========================================================
            // 4. DELETE OLD OFFERS
            // =========================================================

            await context.Offers
                .Where(o =>
                    o.RecruiterId == AnanyaRecruiterId ||
                    oldJobIds.Contains(o.JobId))
                .ExecuteDeleteAsync();


            // =========================================================
            // 5. DELETE OLD INTERVIEWS
            // =========================================================

            await context.Interviews
                .Where(i =>
                    i.RecruiterId == AnanyaRecruiterId ||
                    context.Applications
                        .Where(a =>
                            oldJobIds.Contains(a.JobId))
                        .Select(a => a.Id)
                        .Contains(i.ApplicationId))
                .ExecuteDeleteAsync();


            // =========================================================
            // 6. DELETE OLD ASSESSMENT RESULTS
            // =========================================================

            if (oldAssessmentIds.Count > 0)
            {
                var oldAssessmentQuestionIds =
                    await context.AssessmentQuestions
                        .Where(q =>
                            oldAssessmentIds.Contains(q.AssessmentId))
                        .Select(q => q.Id)
                        .ToListAsync();

                if (oldAssessmentQuestionIds.Count > 0)
                {
                    await context.AssessmentResults
                        .Where(r =>
                            oldAssessmentIds.Contains(r.AssessmentId))
                        .ExecuteDeleteAsync();
                }
            }


            // =========================================================
            // 7. DELETE OLD ASSESSMENT QUESTIONS
            // =========================================================

            if (oldAssessmentIds.Count > 0)
            {
                await context.AssessmentQuestions
                    .Where(q =>
                        oldAssessmentIds.Contains(q.AssessmentId))
                    .ExecuteDeleteAsync();
            }


            // =========================================================
            // 8. DELETE OLD ASSESSMENTS
            // =========================================================

            await context.Assessments
                .Where(a =>
                    a.RecruiterId == AnanyaRecruiterId)
                .ExecuteDeleteAsync();


            // =========================================================
            // 9. DELETE OLD APPLICATIONS
            // =========================================================

            if (oldJobIds.Count > 0)
            {
                await context.Applications
                    .Where(a =>
                        oldJobIds.Contains(a.JobId))
                    .ExecuteDeleteAsync();
            }


            // =========================================================
            // 10. DELETE OLD JOBS
            // =========================================================

            await context.Jobs
                .Where(j =>
                    j.RecruiterId == AnanyaRecruiterId)
                .ExecuteDeleteAsync();


            Console.WriteLine(
                "Old Ananya recruiter data deleted.");


            // =========================================================
            // 11. GET DEPARTMENTS
            // =========================================================

            var departments =
                await context.Departments
                    .Where(d => d.IsActive)
                    .OrderBy(d => d.Id)
                    .ToListAsync();

            if (departments.Count == 0)
            {
                departments =
                    await context.Departments
                        .OrderBy(d => d.Id)
                        .ToListAsync();
            }

            if (departments.Count == 0)
            {
                throw new InvalidOperationException(
                    "No departments exist in the database. " +
                    "Please create at least one department first."
                );
            }


            // =========================================================
            // 12. GET JOB CATEGORIES
            // =========================================================

            var categories =
                await context.JobCategories
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Id)
                    .ToListAsync();

            if (categories.Count == 0)
            {
                categories =
                    await context.JobCategories
                        .OrderBy(c => c.Id)
                        .ToListAsync();
            }

            if (categories.Count == 0)
            {
                throw new InvalidOperationException(
                    "No job categories exist in the database. " +
                    "Please create at least one job category first."
                );
            }


            // =========================================================
            // 13. GET 15 EXISTING ACTIVE CANDIDATES
            // =========================================================

            var candidates =
                await context.Users
                    .Where(u =>
                        u.Role == "Candidate" &&
                        u.IsActive)
                    .OrderBy(u => u.Id)
                    .Take(15)
                    .ToListAsync();

            if (candidates.Count < 15)
            {
                throw new InvalidOperationException(
                    $"At least 15 active Candidate users are required. " +
                    $"Currently only {candidates.Count} exist."
                );
            }


            // =========================================================
            // 14. CREATE 15 JOBS
            // =========================================================

            var now = DateTime.UtcNow;

            var jobs = new List<Job>
            {
                new Job
                {
                    Title = "React Frontend Developer",
                    DepartmentId = departments[0 % departments.Count].Id,
                    JobCategoryId = categories[0 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "React, JavaScript, HTML, CSS, REST API, Git",
                    Description =
                        "We are looking for a React Frontend Developer " +
                        "to build responsive and user-friendly web applications.",
                    Responsibilities =
                        "Develop React components, integrate APIs, " +
                        "fix UI issues and collaborate with backend developers.",
                    Requirements =
                        "Strong JavaScript fundamentals, React knowledge, " +
                        "problem solving and basic Git knowledge.",
                    ApplicationDeadline = now.AddDays(45),
                    IsActive = true,
                    CreatedAt = now.AddDays(-20)
                },

                new Job
                {
                    Title = ".NET Full Stack Developer",
                    DepartmentId = departments[1 % departments.Count].Id,
                    JobCategoryId = categories[1 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 450000,
                    MaximumSalary = 800000,
                    RequiredSkills =
                        "C#, ASP.NET Core, React, SQL Server, Entity Framework",
                    Description =
                        "Join our development team as a .NET Full Stack Developer " +
                        "working on scalable enterprise applications.",
                    Responsibilities =
                        "Develop APIs, React interfaces, database queries " +
                        "and maintain application features.",
                    Requirements =
                        "Knowledge of C#, ASP.NET Core, React and SQL Server.",
                    ApplicationDeadline = now.AddDays(40),
                    IsActive = true,
                    CreatedAt = now.AddDays(-18)
                },

                new Job
                {
                    Title = "Java Backend Developer",
                    DepartmentId = departments[2 % departments.Count].Id,
                    JobCategoryId = categories[2 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 450000,
                    MaximumSalary = 750000,
                    RequiredSkills =
                        "Java, Spring Boot, REST API, MySQL, Git",
                    Description =
                        "Work with our backend engineering team to build " +
                        "secure and scalable Java services.",
                    Responsibilities =
                        "Develop REST APIs, implement business logic " +
                        "and optimize database operations.",
                    Requirements =
                        "Strong Java fundamentals and understanding of REST APIs.",
                    ApplicationDeadline = now.AddDays(35),
                    IsActive = true,
                    CreatedAt = now.AddDays(-17)
                },

                new Job
                {
                    Title = "Python Developer",
                    DepartmentId = departments[0 % departments.Count].Id,
                    JobCategoryId = categories[3 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "Python, Django, REST API, SQL, Git",
                    Description =
                        "Looking for a Python Developer to contribute " +
                        "to web applications and backend services.",
                    Responsibilities =
                        "Build backend modules, APIs and database integrations.",
                    Requirements =
                        "Good Python knowledge and understanding of web development.",
                    ApplicationDeadline = now.AddDays(50),
                    IsActive = true,
                    CreatedAt = now.AddDays(-15)
                },

                new Job
                {
                    Title = "Node.js Developer",
                    DepartmentId = departments[1 % departments.Count].Id,
                    JobCategoryId = categories[4 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "HSR Layout, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 400000,
                    MaximumSalary = 750000,
                    RequiredSkills =
                        "Node.js, Express, MongoDB, REST API, JavaScript",
                    Description =
                        "Develop backend services using Node.js and Express.",
                    Responsibilities =
                        "Build APIs, integrate databases and troubleshoot backend issues.",
                    Requirements =
                        "JavaScript, Node.js and REST API knowledge.",
                    ApplicationDeadline = now.AddDays(30),
                    IsActive = true,
                    CreatedAt = now.AddDays(-14)
                },

                new Job
                {
                    Title = "Angular Developer",
                    DepartmentId = departments[2 % departments.Count].Id,
                    JobCategoryId = categories[5 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Whitefield, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "Angular, TypeScript, HTML, CSS, REST API",
                    Description =
                        "Build modern enterprise interfaces using Angular.",
                    Responsibilities =
                        "Create reusable Angular components and integrate APIs.",
                    Requirements =
                        "TypeScript, Angular and frontend development fundamentals.",
                    ApplicationDeadline = now.AddDays(42),
                    IsActive = true,
                    CreatedAt = now.AddDays(-13)
                },

                new Job
                {
                    Title = "QA Automation Engineer",
                    DepartmentId = departments[0 % departments.Count].Id,
                    JobCategoryId = categories[6 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bellandur, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 350000,
                    MaximumSalary = 650000,
                    RequiredSkills =
                        "Selenium, Java, API Testing, SQL, Git",
                    Description =
                        "Join our QA team to automate functional and regression testing.",
                    Responsibilities =
                        "Create automated tests, report defects and validate releases.",
                    Requirements =
                        "Testing fundamentals and basic programming knowledge.",
                    ApplicationDeadline = now.AddDays(38),
                    IsActive = true,
                    CreatedAt = now.AddDays(-12)
                },

                new Job
                {
                    Title = "DevOps Engineer",
                    DepartmentId = departments[1 % departments.Count].Id,
                    JobCategoryId = categories[7 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Marathahalli, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 500000,
                    MaximumSalary = 900000,
                    RequiredSkills =
                        "AWS, Docker, GitHub Actions, Linux, CI/CD",
                    Description =
                        "Support application deployments and cloud infrastructure.",
                    Responsibilities =
                        "Maintain CI/CD pipelines, deployments and cloud environments.",
                    Requirements =
                        "Basic cloud, Linux and deployment knowledge.",
                    ApplicationDeadline = now.AddDays(55),
                    IsActive = true,
                    CreatedAt = now.AddDays(-11)
                },

                new Job
                {
                    Title = "Data Analyst",
                    DepartmentId = departments[2 % departments.Count].Id,
                    JobCategoryId = categories[8 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Koramangala, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "SQL, Excel, Python, Power BI, Data Analysis",
                    Description =
                        "Analyze business data and create actionable reports.",
                    Responsibilities =
                        "Prepare reports, analyze datasets and create dashboards.",
                    Requirements =
                        "SQL, Excel and analytical problem-solving skills.",
                    ApplicationDeadline = now.AddDays(32),
                    IsActive = true,
                    CreatedAt = now.AddDays(-10)
                },

                new Job
                {
                    Title = "Cloud Engineer",
                    DepartmentId = departments[0 % departments.Count].Id,
                    JobCategoryId = categories[9 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Electronic City, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 500000,
                    MaximumSalary = 850000,
                    RequiredSkills =
                        "AWS, Azure, Linux, Networking, Docker",
                    Description =
                        "Assist in designing and maintaining cloud infrastructure.",
                    Responsibilities =
                        "Monitor cloud resources and support deployment activities.",
                    Requirements =
                        "Basic cloud computing and networking knowledge.",
                    ApplicationDeadline = now.AddDays(48),
                    IsActive = true,
                    CreatedAt = now.AddDays(-9)
                },

                new Job
                {
                    Title = "UI UX Designer",
                    DepartmentId = departments[1 % departments.Count].Id,
                    JobCategoryId = categories[10 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "HSR Layout, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 350000,
                    MaximumSalary = 650000,
                    RequiredSkills =
                        "Figma, Wireframing, Prototyping, UI Design",
                    Description =
                        "Design intuitive and modern interfaces for web applications.",
                    Responsibilities =
                        "Create wireframes, prototypes and design systems.",
                    Requirements =
                        "Strong visual design and Figma skills.",
                    ApplicationDeadline = now.AddDays(37),
                    IsActive = true,
                    CreatedAt = now.AddDays(-8)
                },

                new Job
                {
                    Title = "Software Engineer",
                    DepartmentId = departments[2 % departments.Count].Id,
                    JobCategoryId = categories[11 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 450000,
                    MaximumSalary = 800000,
                    RequiredSkills =
                        "Java, C#, SQL, React, REST API",
                    Description =
                        "General software engineering position for fresh graduates.",
                    Responsibilities =
                        "Develop application features and fix software issues.",
                    Requirements =
                        "Programming fundamentals and problem-solving skills.",
                    ApplicationDeadline = now.AddDays(60),
                    IsActive = true,
                    CreatedAt = now.AddDays(-7)
                },

                new Job
                {
                    Title = "Mobile App Developer",
                    DepartmentId = departments[0 % departments.Count].Id,
                    JobCategoryId = categories[12 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bellandur, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 400000,
                    MaximumSalary = 750000,
                    RequiredSkills =
                        "Flutter, Dart, REST API, Firebase",
                    Description =
                        "Develop cross-platform mobile applications.",
                    Responsibilities =
                        "Build mobile interfaces and integrate backend APIs.",
                    Requirements =
                        "Flutter/Dart fundamentals and API integration knowledge.",
                    ApplicationDeadline = now.AddDays(43),
                    IsActive = true,
                    CreatedAt = now.AddDays(-6)
                },

                new Job
                {
                    Title = "Business Analyst",
                    DepartmentId = departments[1 % departments.Count].Id,
                    JobCategoryId = categories[13 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Outer Ring Road, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "SQL, Excel, Requirements Analysis, Documentation",
                    Description =
                        "Work with business teams to analyze requirements " +
                        "and document software solutions.",
                    Responsibilities =
                        "Gather requirements and prepare functional documents.",
                    Requirements =
                        "Strong communication and analytical skills.",
                    ApplicationDeadline = now.AddDays(46),
                    IsActive = true,
                    CreatedAt = now.AddDays(-5)
                },

                new Job
                {
                    Title = "Machine Learning Engineer",
                    DepartmentId = departments[2 % departments.Count].Id,
                    JobCategoryId = categories[14 % categories.Count].Id,
                    RecruiterId = AnanyaRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 500000,
                    MaximumSalary = 950000,
                    RequiredSkills =
                        "Python, Machine Learning, Pandas, NumPy, Scikit-learn",
                    Description =
                        "Build and experiment with machine learning solutions.",
                    Responsibilities =
                        "Prepare datasets, train models and evaluate results.",
                    Requirements =
                        "Python and machine learning fundamentals.",
                    ApplicationDeadline = now.AddDays(52),
                    IsActive = true,
                    CreatedAt = now.AddDays(-4)
                }
            };


            context.Jobs.AddRange(jobs);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {jobs.Count} jobs.");


            // =========================================================
            // 15. CREATE 15 APPLICATIONS
            // =========================================================

            /*
             * The stages below are aligned with the seeded offer workflow.
             *
             * 5 early/mid pipeline applications
             * 10 advanced applications
             *
             * Advanced applications are also used for offers.
             */

            var stages = new[]
            {
                "Applied",
                "Applied",
                "Screening",
                "Screening",
                "Shortlisted",

                // Offer-related applications
                "Selected",
                "Offer",
                "Hired",
                "Rejected",
                "Offer",
                "Offer",
                "Offer",
                "Selected",
                "Offer",
                "Offer"
            };


            var coverLetters = new[]
            {
                "I am interested in this opportunity and believe my technical skills match the role.",
                "I recently completed my degree and have hands-on experience with full stack development.",
                "I am excited to apply and contribute to your engineering team.",
                "My academic projects and internship experience have prepared me for this role.",
                "I have strong programming fundamentals and enjoy building real-world applications.",
                "I have experience developing REST APIs and frontend applications.",
                "I am particularly interested in this role because of the technology stack.",
                "My project experience closely matches the requirements mentioned in the job description.",
                "I would be excited to contribute to your product development team.",
                "I am confident that my technical and problem-solving skills will add value to the team.",
                "I have completed relevant projects and am ready to begin my professional career.",
                "I am interested in growing as a software engineer while contributing to the organization.",
                "My experience with React, .NET and SQL makes this opportunity a strong match.",
                "I am looking forward to discussing my technical experience during the recruitment process.",
                "I would be happy to contribute to the team and learn from experienced developers."
            };


            var applications = new List<Application>();

            for (int i = 0; i < 15; i++)
            {
                applications.Add(
                    new Application
                    {
                        CandidateId = candidates[i].Id,
                        JobId = jobs[i].Id,
                        CurrentStage = stages[i],
                        CoverLetter = coverLetters[i],
                        AppliedAt = now.AddDays(-(15 - i)),
                        UpdatedAt = now.AddDays(-(10 - i)),
                        IsActive = true
                    });
            }


            context.Applications.AddRange(applications);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {applications.Count} applications.");


            // =========================================================
            // 16. CREATE 10 ASSESSMENTS
            // =========================================================

            var assessmentData = new[]
            {
                new
                {
                    Title = "React Frontend Technical Assessment",
                    Description = "Technical assessment covering React, JavaScript and frontend fundamentals.",
                    JobIndex = 0,
                    Duration = 45,
                    Passing = 65
                },

                new
                {
                    Title = ".NET Full Stack Assessment",
                    Description = "Assessment covering C#, ASP.NET Core, EF Core, REST APIs and SQL.",
                    JobIndex = 1,
                    Duration = 50,
                    Passing = 65
                },

                new
                {
                    Title = "Java Backend Assessment",
                    Description = "Assessment covering Java, OOP, Spring Boot and REST APIs.",
                    JobIndex = 2,
                    Duration = 45,
                    Passing = 60
                },

                new
                {
                    Title = "Python Developer Assessment",
                    Description = "Assessment covering Python programming, APIs and backend concepts.",
                    JobIndex = 3,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title = "Node.js Developer Assessment",
                    Description = "Assessment covering Node.js, Express, JavaScript and APIs.",
                    JobIndex = 4,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title = "Angular Developer Assessment",
                    Description = "Assessment covering Angular, TypeScript and frontend development.",
                    JobIndex = 5,
                    Duration = 45,
                    Passing = 65
                },

                new
                {
                    Title = "QA Automation Assessment",
                    Description = "Assessment covering software testing, automation and API testing.",
                    JobIndex = 6,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title = "DevOps Fundamentals Assessment",
                    Description = "Assessment covering cloud, Docker, CI/CD and Linux fundamentals.",
                    JobIndex = 7,
                    Duration = 45,
                    Passing = 60
                },

                new
                {
                    Title = "Data Analyst Assessment",
                    Description = "Assessment covering SQL, Excel, data analysis and basic Python.",
                    JobIndex = 8,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title = "Cloud Engineering Assessment",
                    Description = "Assessment covering cloud computing, networking and deployment concepts.",
                    JobIndex = 9,
                    Duration = 45,
                    Passing = 65
                }
            };


            var assessments = new List<Assessment>();

            foreach (var item in assessmentData)
            {
                assessments.Add(
                    new Assessment
                    {
                        Title = item.Title,
                        Description = item.Description,
                        JobId = jobs[item.JobIndex].Id,
                        RecruiterId = AnanyaRecruiterId,
                        DurationMinutes = item.Duration,
                        PassingScore = item.Passing,
                        IsActive = true,
                        CreatedAt = now.AddDays(-7)
                    });
            }


            context.Assessments.AddRange(assessments);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {assessments.Count} assessments.");


            // =========================================================
            // 17. CREATE 40 ASSESSMENT QUESTIONS
            // =========================================================

            var questionSets =
                new List<
                    List<
                        (
                            string Question,
                            string A,
                            string B,
                            string C,
                            string D,
                            string Correct
                        )
                    >
                >
            {
                // =====================================================
                // REACT
                // =====================================================

                new()
                {
                    (
                        "Which hook is commonly used to manage local state in React?",
                        "useState",
                        "useRoute",
                        "useClass",
                        "useValue",
                        "A"
                    ),

                    (
                        "Which prop is used to uniquely identify list elements in React?",
                        "id",
                        "key",
                        "unique",
                        "indexKey",
                        "B"
                    ),

                    (
                        "Which language is primarily used with React?",
                        "Python",
                        "Java",
                        "JavaScript",
                        "C#",
                        "C"
                    ),

                    (
                        "What does JSX allow developers to write?",
                        "SQL queries",
                        "HTML-like syntax inside JavaScript",
                        "C# classes",
                        "Database schemas",
                        "B"
                    )
                },


                // =====================================================
                // .NET
                // =====================================================

                new()
                {
                    (
                        "Which framework is commonly used to build REST APIs with C#?",
                        "ASP.NET Core",
                        "Django",
                        "Laravel",
                        "Express",
                        "A"
                    ),

                    (
                        "Which ORM is commonly used with ASP.NET Core?",
                        "Hibernate",
                        "Entity Framework Core",
                        "Sequelize",
                        "Mongoose",
                        "B"
                    ),

                    (
                        "Which HTTP method is normally used to create a resource?",
                        "GET",
                        "POST",
                        "DELETE",
                        "HEAD",
                        "B"
                    ),

                    (
                        "Which class commonly represents the EF Core database session?",
                        "DbContext",
                        "DbSession",
                        "SqlContext",
                        "DatabaseManager",
                        "A"
                    )
                },


                // =====================================================
                // JAVA
                // =====================================================

                new()
                {
                    (
                        "Which keyword is used to create a subclass in Java?",
                        "inherits",
                        "extends",
                        "implements",
                        "superclass",
                        "B"
                    ),

                    (
                        "Which collection does not allow duplicate elements?",
                        "List",
                        "Set",
                        "Array",
                        "Queue",
                        "B"
                    ),

                    (
                        "Which method is the entry point of a standard Java application?",
                        "start()",
                        "run()",
                        "main()",
                        "execute()",
                        "C"
                    ),

                    (
                        "Which concept allows the same method name with different parameters?",
                        "Inheritance",
                        "Overloading",
                        "Encapsulation",
                        "Abstraction",
                        "B"
                    )
                },


                // =====================================================
                // PYTHON
                // =====================================================

                new()
                {
                    (
                        "Which keyword defines a function in Python?",
                        "function",
                        "def",
                        "func",
                        "method",
                        "B"
                    ),

                    (
                        "Which data structure stores key-value pairs?",
                        "List",
                        "Tuple",
                        "Dictionary",
                        "Set",
                        "C"
                    ),

                    (
                        "Which symbol is commonly used for comments in Python?",
                        "//",
                        "#",
                        "/*",
                        "--",
                        "B"
                    ),

                    (
                        "Which library is commonly used for numerical arrays?",
                        "NumPy",
                        "React",
                        "Spring",
                        "Bootstrap",
                        "A"
                    )
                },


                // =====================================================
                // NODE.JS
                // =====================================================

                new()
                {
                    (
                        "Node.js is built on which JavaScript engine?",
                        "V8",
                        "SpiderMonkey",
                        "Chakra",
                        "JavaScriptCore",
                        "A"
                    ),

                    (
                        "Which package manager is commonly used with Node.js?",
                        "pip",
                        "npm",
                        "maven",
                        "nuget",
                        "B"
                    ),

                    (
                        "Which framework is commonly used to build Node.js APIs?",
                        "Express",
                        "Django",
                        "Spring",
                        "Laravel",
                        "A"
                    ),

                    (
                        "Which file normally contains Node.js project metadata?",
                        "project.json",
                        "package.json",
                        "node.config",
                        "app.json",
                        "B"
                    )
                },


                // =====================================================
                // ANGULAR
                // =====================================================

                new()
                {
                    (
                        "Angular is primarily based on which language?",
                        "Java",
                        "TypeScript",
                        "Python",
                        "C#",
                        "B"
                    ),

                    (
                        "Which decorator defines an Angular component?",
                        "@Component",
                        "@Controller",
                        "@ServiceClass",
                        "@Angular",
                        "A"
                    ),

                    (
                        "Which command creates a new Angular application?",
                        "ng new",
                        "ng create",
                        "angular init",
                        "npm angular",
                        "A"
                    ),

                    (
                        "Which feature is used for dependency injection in Angular?",
                        "constructor injection",
                        "SQL injection",
                        "DOM injection",
                        "HTML injection",
                        "A"
                    )
                },


                // =====================================================
                // QA
                // =====================================================

                new()
                {
                    (
                        "What does QA stand for?",
                        "Quality Assurance",
                        "Quick Application",
                        "Query Analysis",
                        "Quality Application",
                        "A"
                    ),

                    (
                        "Which tool is commonly used for browser automation?",
                        "Selenium",
                        "Photoshop",
                        "Figma",
                        "Postman only",
                        "A"
                    ),

                    (
                        "What type of testing checks individual units of code?",
                        "System testing",
                        "Unit testing",
                        "Acceptance testing",
                        "Load testing",
                        "B"
                    ),

                    (
                        "Which testing checks whether an API returns expected responses?",
                        "API testing",
                        "UI drawing",
                        "Compilation testing",
                        "Design testing",
                        "A"
                    )
                },


                // =====================================================
                // DEVOPS
                // =====================================================

                new()
                {
                    (
                        "Which tool is commonly used for containerization?",
                        "Docker",
                        "Figma",
                        "Excel",
                        "Jira",
                        "A"
                    ),

                    (
                        "What does CI commonly stand for?",
                        "Continuous Integration",
                        "Code Installation",
                        "Cloud Interface",
                        "Central Integration",
                        "A"
                    ),

                    (
                        "Which operating system is widely used in cloud servers?",
                        "Linux",
                        "DOS",
                        "Windows Phone",
                        "Android TV",
                        "A"
                    ),

                    (
                        "Which service is a cloud platform?",
                        "AWS",
                        "Photoshop",
                        "Figma",
                        "Git",
                        "A"
                    )
                },


                // =====================================================
                // DATA
                // =====================================================

                new()
                {
                    (
                        "Which language is commonly used to query relational databases?",
                        "SQL",
                        "HTML",
                        "CSS",
                        "XML",
                        "A"
                    ),

                    (
                        "Which SQL command retrieves data?",
                        "SELECT",
                        "INSERT",
                        "UPDATE",
                        "DELETE",
                        "A"
                    ),

                    (
                        "Which tool is commonly used for spreadsheet analysis?",
                        "Excel",
                        "Docker",
                        "Git",
                        "Node.js",
                        "A"
                    ),

                    (
                        "Which Python library is commonly used for tabular data?",
                        "Pandas",
                        "React",
                        "Express",
                        "Spring",
                        "A"
                    )
                },


                // =====================================================
                // CLOUD
                // =====================================================

                new()
                {
                    (
                        "What does IaaS stand for?",
                        "Infrastructure as a Service",
                        "Internet as a Service",
                        "Integration as a Service",
                        "Information as a Service",
                        "A"
                    ),

                    (
                        "Which of these is a cloud provider?",
                        "AWS",
                        "Git",
                        "React",
                        "Visual Studio Code",
                        "A"
                    ),

                    (
                        "Which protocol is commonly used for secure web communication?",
                        "HTTPS",
                        "FTP only",
                        "SMTP",
                        "TELNET",
                        "A"
                    ),

                    (
                        "What does scalability mean in cloud computing?",
                        "Ability to handle changing workload",
                        "Deleting servers",
                        "Removing users",
                        "Disabling applications",
                        "A"
                    )
                }
            };


            var questions =
                new List<AssessmentQuestion>();

            for (
                int assessmentIndex = 0;
                assessmentIndex < assessments.Count;
                assessmentIndex++)
            {
                var set =
                    questionSets[assessmentIndex];

                foreach (var question in set)
                {
                    questions.Add(
                        new AssessmentQuestion
                        {
                            AssessmentId =
                                assessments[assessmentIndex].Id,

                            QuestionText =
                                question.Question,

                            OptionA =
                                question.A,

                            OptionB =
                                question.B,

                            OptionC =
                                question.C,

                            OptionD =
                                question.D,

                            CorrectAnswer =
                                question.Correct,

                            Marks = 5,

                            IsActive = true,

                            CreatedAt =
                                now.AddDays(-6)
                        });
                }
            }


            context.AssessmentQuestions.AddRange(questions);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {questions.Count} assessment questions.");


            // =========================================================
            // 18. CREATE 15 INTERVIEWS
            // =========================================================

            var interviewTypes = new[]
            {
                "Technical",
                "Technical",
                "HR",
                "Managerial",
                "Technical",
                "Behavioral",
                "Technical",
                "HR",
                "Managerial",
                "Technical",
                "Final",
                "Technical",
                "HR",
                "Final",
                "Technical"
            };


            var interviewStatuses = new[]
            {
                "Completed",
                "Completed",
                "Scheduled",
                "Scheduled",
                "Completed",
                "Scheduled",
                "Completed",
                "Scheduled",
                "Completed",
                "Scheduled",
                "Scheduled",
                "Completed",
                "Cancelled",
                "No Show",
                "Scheduled"
            };


            var interviewers = new[]
            {
                ("Rahul Mehta", "rahul.mehta@smarthire.com"),
                ("Priya Nair", "priya.nair@smarthire.com"),
                ("Arjun Rao", "arjun.rao@smarthire.com"),
                ("Sneha Kapoor", "sneha.kapoor@smarthire.com"),
                ("Vikram Shah", "vikram.shah@smarthire.com")
            };


            var interviews =
                new List<Interview>();

            for (int i = 0; i < 15; i++)
            {
                var interviewer =
                    interviewers[
                        i % interviewers.Length
                    ];

                DateTime scheduledAt;

                if (
                    interviewStatuses[i] == "Completed" ||
                    interviewStatuses[i] == "Cancelled" ||
                    interviewStatuses[i] == "No Show")
                {
                    scheduledAt =
                        now
                            .AddDays(-(i + 1))
                            .Date
                            .AddHours(10 + (i % 4));
                }
                else
                {
                    scheduledAt =
                        now
                            .AddDays(i + 1)
                            .Date
                            .AddHours(10 + (i % 4));
                }


                interviews.Add(
                    new Interview
                    {
                        ApplicationId =
                            applications[i].Id,

                        RecruiterId =
                            AnanyaRecruiterId,

                        InterviewType =
                            interviewTypes[i],

                        ScheduledAt =
                            scheduledAt,

                        DurationMinutes =
                            i % 2 == 0 ? 60 : 45,

                        MeetingLink =
                            i % 3 == 0
                                ? $"https://meet.google.com/smarthire-{i + 101}"
                                : string.Empty,

                        Location =
                            i % 3 == 0
                                ? string.Empty
                                : "Technoforte Office, Bengaluru",

                        InterviewerName =
                            interviewer.Item1,

                        InterviewerEmail =
                            interviewer.Item2,

                        Status =
                            interviewStatuses[i],

                        Notes =
                            interviewStatuses[i] == "Completed"
                                ? "Interview completed. Candidate evaluation recorded."
                                : interviewStatuses[i] == "Scheduled"
                                    ? "Interview scheduled with the candidate."
                                    : interviewStatuses[i] == "Cancelled"
                                        ? "Interview cancelled due to scheduling conflict."
                                        : "Candidate did not attend the scheduled interview.",

                        CreatedAt =
                            now.AddDays(-(i + 2)),

                        UpdatedAt =
                            now.AddDays(-(i + 1))
                    });
            }


            context.Interviews.AddRange(interviews);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {interviews.Count} interviews.");


            // =========================================================
            // 19. CREATE 10 OFFERS
            // =========================================================

            /*
             * Recruiter-side workflow:
             *
             * Draft
             *   -> Edit / Send / Delete
             *
             * Sent
             *   -> View / Withdraw
             *
             * Accepted
             *   -> View
             *
             * Rejected
             *   -> View
             *
             * Expired
             *   -> View
             *
             * Withdrawn
             *   -> View
             *
             * Accepted and Rejected represent candidate responses.
             */

            var offerStatuses = new[]
            {
                "Draft",
                "Sent",
                "Accepted",
                "Rejected",
                "Expired",
                "Withdrawn",
                "Sent",
                "Accepted",
                "Draft",
                "Sent"
            };


            var offerDesignations = new[]
            {
                "React Frontend Developer",
                ".NET Full Stack Developer",
                "Java Backend Developer",
                "Python Developer",
                "Node.js Developer",
                "Angular Developer",
                "QA Automation Engineer",
                "DevOps Engineer",
                "Data Analyst",
                "Cloud Engineer"
            };


            var offerSalaries = new decimal[]
            {
                550000,
                650000,
                600000,
                575000,
                625000,
                600000,
                525000,
                700000,
                575000,
                675000
            };


            /*
             * Applications 5-14 correspond to the advanced
             * offer-related pipeline applications.
             */

            var offerApplications =
                applications
                    .Skip(5)
                    .Take(10)
                    .ToList();


            var offers =
                new List<Offer>();


            for (int i = 0; i < 10; i++)
            {
                DateTime joiningDate;
                DateTime expiryDate;

                DateTime? sentAt = null;
                DateTime? respondedAt = null;


                // =====================================================
                // DRAFT
                // =====================================================

                if (offerStatuses[i] == "Draft")
                {
                    joiningDate =
                        now.Date.AddDays(15 + i);

                    expiryDate =
                        joiningDate.AddDays(7);
                }


                // =====================================================
                // SENT
                // =====================================================

                else if (offerStatuses[i] == "Sent")
                {
                    joiningDate =
                        now.Date.AddDays(15 + i);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-(5 - (i % 3)));
                }


                // =====================================================
                // ACCEPTED
                // =====================================================

                else if (offerStatuses[i] == "Accepted")
                {
                    joiningDate =
                        now.Date.AddDays(15 + i);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-(7 + (i % 3)));

                    respondedAt =
                        now.AddDays(-(2 + (i % 3)));
                }


                // =====================================================
                // REJECTED
                // =====================================================

                else if (offerStatuses[i] == "Rejected")
                {
                    joiningDate =
                        now.Date.AddDays(15 + i);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-(8 + (i % 3)));

                    respondedAt =
                        now.AddDays(-(3 + (i % 3)));
                }


                // =====================================================
                // EXPIRED
                // =====================================================

                else if (offerStatuses[i] == "Expired")
                {
                    joiningDate =
                        now.Date.AddDays(-10);

                    expiryDate =
                        now.Date.AddDays(-3);

                    sentAt =
                        now.AddDays(-12);
                }


                // =====================================================
                // WITHDRAWN
                // =====================================================

                else
                {
                    joiningDate =
                        now.Date.AddDays(15 + i);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-(7 + (i % 3)));

                    // Important:
                    // Withdrawn is a recruiter action.
                    // Therefore RespondedAt remains null.
                    respondedAt = null;
                }


                offers.Add(
                    new Offer
                    {
                        ApplicationId =
                            offerApplications[i].Id,

                        CandidateId =
                            offerApplications[i].CandidateId,

                        JobId =
                            offerApplications[i].JobId,

                        RecruiterId =
                            AnanyaRecruiterId,

                        Designation =
                            offerDesignations[i],

                        OfferedSalary =
                            offerSalaries[i],

                        JoiningDate =
                            joiningDate,

                        OfferExpiryDate =
                            expiryDate,

                        Status =
                            offerStatuses[i],

                        Benefits =
                            "Health insurance, paid leave, " +
                            "learning allowance and flexible work options.",

                        Notes =
                            "Generated recruiter test data for Ananya Sharma.",

                        CreatedAt =
                            now.AddDays(-(10 - i)),

                        UpdatedAt =
                            now.AddDays(-(5 - (i % 3))),

                        SentAt =
                            sentAt,

                        RespondedAt =
                            respondedAt
                    });
            }


            context.Offers.AddRange(offers);

            await context.SaveChangesAsync();


            // =========================================================
            // 20. UPDATE APPLICATION STAGES FOR OFFER RESULTS
            // =========================================================

            /*
             * Keep application stages consistent with the seeded
             * offer statuses.
             *
             * Accepted -> Hired
             * Rejected -> Rejected
             * Expired -> Offer
             * Withdrawn -> Offer
             * Sent -> Offer
             * Draft -> Selected
             */

            for (int i = 0; i < offers.Count; i++)
            {
                var application =
                    offerApplications[i];

                switch (offers[i].Status)
                {
                    case "Accepted":
                        application.CurrentStage = "Hired";
                        break;

                    case "Rejected":
                        application.CurrentStage = "Rejected";
                        break;

                    case "Expired":
                        application.CurrentStage = "Offer";
                        break;

                    case "Withdrawn":
                        application.CurrentStage = "Offer";
                        break;

                    case "Sent":
                        application.CurrentStage = "Offer";
                        break;

                    case "Draft":
                        application.CurrentStage = "Selected";
                        break;
                }

                application.UpdatedAt =
                    now.AddDays(-(i % 5));
            }


            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {offers.Count} offers.");

            Console.WriteLine(
                "Offer statuses and application stages synchronized.");


            // =========================================================
            // 21. FINAL SUMMARY
            // =========================================================

            var finalJobs =
                await context.Jobs.CountAsync(j =>
                    j.RecruiterId ==
                    AnanyaRecruiterId);


            var finalApplications =
                await context.Applications
                    .Join(
                        context.Jobs,
                        application => application.JobId,
                        job => job.Id,
                        (application, job) =>
                            new
                            {
                                application,
                                job
                            })
                    .CountAsync(x =>
                        x.job.RecruiterId ==
                        AnanyaRecruiterId);


            var finalAssessments =
                await context.Assessments.CountAsync(a =>
                    a.RecruiterId ==
                    AnanyaRecruiterId);


            var finalInterviews =
                await context.Interviews.CountAsync(i =>
                    i.RecruiterId ==
                    AnanyaRecruiterId);


            var finalOffers =
                await context.Offers.CountAsync(o =>
                    o.RecruiterId ==
                    AnanyaRecruiterId);


            var finalQuestions =
                await context.AssessmentQuestions
                    .CountAsync(q =>
                        context.Assessments
                            .Where(a =>
                                a.RecruiterId ==
                                AnanyaRecruiterId)
                            .Select(a => a.Id)
                            .Contains(q.AssessmentId));


            Console.WriteLine(
                "==============================================");

            Console.WriteLine(
                "ANANYA TEST DATA SEED COMPLETED");

            Console.WriteLine(
                $"Jobs        : {finalJobs}");

            Console.WriteLine(
                $"Applicants  : {finalApplications}");

            Console.WriteLine(
                $"Assessments : {finalAssessments}");

            Console.WriteLine(
                $"Questions   : {finalQuestions}");

            Console.WriteLine(
                $"Interviews  : {finalInterviews}");

            Console.WriteLine(
                $"Offers      : {finalOffers}");

            Console.WriteLine(
                "==============================================");
        }
    }
}