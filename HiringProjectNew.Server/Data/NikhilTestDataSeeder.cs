using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Data
{
    public static class NikhilTestDataSeeder
    {
        private const int NikhilRecruiterId = 25;

        public static async Task ResetAndSeedAsync(
            ApplicationDbContext context)
        {
            Console.WriteLine(
                "==============================================");

            Console.WriteLine(
                "NIKHIL RECRUITER DATA RESET + SEED STARTED");

            Console.WriteLine(
                "==============================================");


            // =========================================================
            // 1. VERIFY NIKHIL
            // =========================================================

            var recruiterExists =
                await context.Users.AnyAsync(u =>
                    u.Id == NikhilRecruiterId &&
                    u.Role == "Recruiter");

            if (!recruiterExists)
            {
                throw new InvalidOperationException(
                    $"Recruiter with ID {NikhilRecruiterId} was not found."
                );
            }


            // =========================================================
            // 2. GET OLD NIKHIL JOB IDS
            // =========================================================

            var oldJobIds =
                await context.Jobs
                    .Where(j =>
                        j.RecruiterId == NikhilRecruiterId)
                    .Select(j => j.Id)
                    .ToListAsync();


            // =========================================================
            // 3. GET OLD NIKHIL ASSESSMENT IDS
            // =========================================================

            var oldAssessmentIds =
                await context.Assessments
                    .Where(a =>
                        a.RecruiterId == NikhilRecruiterId)
                    .Select(a => a.Id)
                    .ToListAsync();


            // =========================================================
            // 4. DELETE OLD OFFERS
            // =========================================================

            await context.Offers
                .Where(o =>
                    o.RecruiterId == NikhilRecruiterId ||
                    oldJobIds.Contains(o.JobId))
                .ExecuteDeleteAsync();


            // =========================================================
            // 5. DELETE OLD INTERVIEWS
            // =========================================================

            await context.Interviews
                .Where(i =>
                    i.RecruiterId == NikhilRecruiterId ||
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
                await context.AssessmentResults
                    .Where(r =>
                        oldAssessmentIds.Contains(r.AssessmentId))
                    .ExecuteDeleteAsync();
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
                    a.RecruiterId == NikhilRecruiterId)
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
                    j.RecruiterId == NikhilRecruiterId)
                .ExecuteDeleteAsync();


            Console.WriteLine(
                "Old Nikhil recruiter data deleted.");


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
                    "No departments exist in the database."
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
                    "No job categories exist in the database."
                );
            }


            // =========================================================
            // 13. GET 12 ACTIVE CANDIDATES
            // =========================================================

            var candidates =
                await context.Users
                    .Where(u =>
                        u.Role == "Candidate" &&
                        u.IsActive)
                    .OrderBy(u => u.Id)
                    .Take(12)
                    .ToListAsync();

            if (candidates.Count < 12)
            {
                throw new InvalidOperationException(
                    "At least 12 active Candidate users are required."
                );
            }


            var now = DateTime.UtcNow;


            // =========================================================
            // 14. CREATE 8 JOBS
            // =========================================================

            var jobs = new List<Job>
            {
                new Job
                {
                    Title = "React Developer",
                    DepartmentId =
                        departments[0 % departments.Count].Id,
                    JobCategoryId =
                        categories[0 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "HSR Layout, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "React, JavaScript, HTML, CSS, Git",
                    Description =
                        "Build responsive web applications using React.",
                    Responsibilities =
                        "Develop components, integrate APIs and fix UI issues.",
                    Requirements =
                        "React and JavaScript fundamentals.",
                    ApplicationDeadline =
                        now.AddDays(40),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-18)
                },

                new Job
                {
                    Title = ".NET Backend Developer",
                    DepartmentId =
                        departments[1 % departments.Count].Id,
                    JobCategoryId =
                        categories[1 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "Bellandur, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 450000,
                    MaximumSalary = 800000,
                    RequiredSkills =
                        "C#, ASP.NET Core, SQL Server, EF Core",
                    Description =
                        "Develop backend APIs using ASP.NET Core.",
                    Responsibilities =
                        "Create REST APIs and database integrations.",
                    Requirements =
                        "C#, ASP.NET Core and SQL knowledge.",
                    ApplicationDeadline =
                        now.AddDays(35),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-16)
                },

                new Job
                {
                    Title = "Java Developer",
                    DepartmentId =
                        departments[2 % departments.Count].Id,
                    JobCategoryId =
                        categories[2 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "Marathahalli, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 750000,
                    RequiredSkills =
                        "Java, Spring Boot, REST API, MySQL",
                    Description =
                        "Develop scalable Java backend applications.",
                    Responsibilities =
                        "Implement APIs and business logic.",
                    Requirements =
                        "Java and REST API fundamentals.",
                    ApplicationDeadline =
                        now.AddDays(45),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-15)
                },

                new Job
                {
                    Title = "Python Developer",
                    DepartmentId =
                        departments[0 % departments.Count].Id,
                    JobCategoryId =
                        categories[3 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "Koramangala, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "Python, Django, SQL, REST API",
                    Description =
                        "Develop Python based web applications.",
                    Responsibilities =
                        "Build backend services and APIs.",
                    Requirements =
                        "Python and database fundamentals.",
                    ApplicationDeadline =
                        now.AddDays(38),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-13)
                },

                new Job
                {
                    Title = "QA Automation Engineer",
                    DepartmentId =
                        departments[1 % departments.Count].Id,
                    JobCategoryId =
                        categories[4 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "Whitefield, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 350000,
                    MaximumSalary = 650000,
                    RequiredSkills =
                        "Selenium, Java, API Testing, SQL",
                    Description =
                        "Automate functional and regression testing.",
                    Responsibilities =
                        "Create test cases and automation scripts.",
                    Requirements =
                        "Testing and programming fundamentals.",
                    ApplicationDeadline =
                        now.AddDays(42),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-12)
                },

                new Job
                {
                    Title = "Data Analyst",
                    DepartmentId =
                        departments[2 % departments.Count].Id,
                    JobCategoryId =
                        categories[5 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "Electronic City, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "SQL, Excel, Power BI, Python",
                    Description =
                        "Analyze datasets and prepare business reports.",
                    Responsibilities =
                        "Create reports and analyze business data.",
                    Requirements =
                        "SQL, Excel and analytical skills.",
                    ApplicationDeadline =
                        now.AddDays(30),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-10)
                },

                new Job
                {
                    Title = "Node.js Developer",
                    DepartmentId =
                        departments[0 % departments.Count].Id,
                    JobCategoryId =
                        categories[6 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "HSR Layout, Bengaluru",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "0-1 Years",
                    MinimumSalary = 450000,
                    MaximumSalary = 750000,
                    RequiredSkills =
                        "Node.js, Express, MongoDB, JavaScript",
                    Description =
                        "Develop REST APIs using Node.js and Express.",
                    Responsibilities =
                        "Build APIs and integrate databases.",
                    Requirements =
                        "JavaScript and Node.js knowledge.",
                    ApplicationDeadline =
                        now.AddDays(36),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-8)
                },

                new Job
                {
                    Title = "Business Analyst",
                    DepartmentId =
                        departments[1 % departments.Count].Id,
                    JobCategoryId =
                        categories[7 % categories.Count].Id,
                    RecruiterId = NikhilRecruiterId,
                    Location = "Bengaluru, Karnataka",
                    EmploymentType = "Full Time",
                    ExperienceLevel = "Fresher",
                    MinimumSalary = 400000,
                    MaximumSalary = 700000,
                    RequiredSkills =
                        "SQL, Excel, Documentation, Analysis",
                    Description =
                        "Analyze business requirements and document solutions.",
                    Responsibilities =
                        "Gather requirements and prepare documentation.",
                    Requirements =
                        "Analytical and communication skills.",
                    ApplicationDeadline =
                        now.AddDays(48),
                    IsActive = true,
                    CreatedAt =
                        now.AddDays(-6)
                }
            };


            context.Jobs.AddRange(jobs);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {jobs.Count} jobs.");


            // =========================================================
            // 15. CREATE 12 APPLICATIONS
            // =========================================================

            var stages = new[]
            {
                "Applied",
                "Screening",
                "Screening",
                "Shortlisted",
                "Assessment",
                "Interview",
                "Selected",
                "Offer",
                "Hired",
                "Rejected",
                "Offer",
                "Selected"
            };


            var applications =
                new List<Application>();

            for (int i = 0; i < 12; i++)
            {
                applications.Add(
                    new Application
                    {
                        CandidateId =
                            candidates[i].Id,

                        JobId =
                            jobs[i % jobs.Count].Id,

                        CurrentStage =
                            stages[i],

                        CoverLetter =
                            $"Candidate {i + 1} is interested in the " +
                            "opportunity and has relevant technical skills.",

                        AppliedAt =
                            now.AddDays(-(20 - i)),

                        UpdatedAt =
                            now.AddDays(-(10 - (i % 5))),

                        IsActive = true
                    });
            }


            context.Applications.AddRange(applications);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {applications.Count} applications.");


            // =========================================================
            // 16. CREATE 6 ASSESSMENTS
            // =========================================================

            var assessmentData = new[]
            {
                new
                {
                    Title = "React Developer Assessment",
                    Description =
                        "React and JavaScript technical assessment.",
                    JobIndex = 0,
                    Duration = 45,
                    Passing = 60
                },

                new
                {
                    Title = ".NET Backend Assessment",
                    Description =
                        "ASP.NET Core, C# and SQL assessment.",
                    JobIndex = 1,
                    Duration = 50,
                    Passing = 65
                },

                new
                {
                    Title = "Java Developer Assessment",
                    Description =
                        "Java and backend development assessment.",
                    JobIndex = 2,
                    Duration = 45,
                    Passing = 60
                },

                new
                {
                    Title = "Python Developer Assessment",
                    Description =
                        "Python programming and API assessment.",
                    JobIndex = 3,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title = "QA Automation Assessment",
                    Description =
                        "Software testing and automation assessment.",
                    JobIndex = 4,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title = "Data Analyst Assessment",
                    Description =
                        "SQL, Excel and data analysis assessment.",
                    JobIndex = 5,
                    Duration = 40,
                    Passing = 60
                }
            };


            var assessments =
                new List<Assessment>();

            foreach (var item in assessmentData)
            {
                assessments.Add(
                    new Assessment
                    {
                        Title =
                            item.Title,

                        Description =
                            item.Description,

                        JobId =
                            jobs[item.JobIndex].Id,

                        RecruiterId =
                            NikhilRecruiterId,

                        DurationMinutes =
                            item.Duration,

                        PassingScore =
                            item.Passing,

                        IsActive = true,

                        CreatedAt =
                            now.AddDays(-6)
                    });
            }


            context.Assessments.AddRange(assessments);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {assessments.Count} assessments.");


            // =========================================================
            // 17. CREATE 24 ASSESSMENT QUESTIONS
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
                // React
                new()
                {
                    (
                        "Which hook manages state in React?",
                        "useState",
                        "useRoute",
                        "useClass",
                        "useValue",
                        "A"
                    ),

                    (
                        "Which prop uniquely identifies list elements?",
                        "id",
                        "key",
                        "unique",
                        "index",
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
                        "What does JSX provide?",
                        "SQL",
                        "HTML-like syntax in JavaScript",
                        "C#",
                        "Database schema",
                        "B"
                    )
                },

                // .NET
                new()
                {
                    (
                        "Which framework is used for C# REST APIs?",
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
                        "Which HTTP method creates a resource?",
                        "GET",
                        "POST",
                        "DELETE",
                        "HEAD",
                        "B"
                    ),

                    (
                        "Which class represents the EF Core database session?",
                        "DbContext",
                        "DbSession",
                        "SqlContext",
                        "DatabaseManager",
                        "A"
                    )
                },

                // Java
                new()
                {
                    (
                        "Which keyword creates a subclass in Java?",
                        "inherits",
                        "extends",
                        "implements",
                        "superclass",
                        "B"
                    ),

                    (
                        "Which collection does not allow duplicates?",
                        "List",
                        "Set",
                        "Array",
                        "Queue",
                        "B"
                    ),

                    (
                        "What is the Java application entry point?",
                        "start()",
                        "run()",
                        "main()",
                        "execute()",
                        "C"
                    ),

                    (
                        "Same method name with different parameters is called?",
                        "Inheritance",
                        "Overloading",
                        "Encapsulation",
                        "Abstraction",
                        "B"
                    )
                },

                // Python
                new()
                {
                    (
                        "Which keyword defines a Python function?",
                        "function",
                        "def",
                        "func",
                        "method",
                        "B"
                    ),

                    (
                        "Which structure stores key-value pairs?",
                        "List",
                        "Tuple",
                        "Dictionary",
                        "Set",
                        "C"
                    ),

                    (
                        "Which symbol is used for Python comments?",
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

                // QA
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
                        "Which tool is used for browser automation?",
                        "Selenium",
                        "Photoshop",
                        "Figma",
                        "Excel",
                        "A"
                    ),

                    (
                        "Testing individual units of code is called?",
                        "System testing",
                        "Unit testing",
                        "Acceptance testing",
                        "Load testing",
                        "B"
                    ),

                    (
                        "Testing whether APIs return expected responses is called?",
                        "API testing",
                        "UI testing",
                        "Design testing",
                        "Compilation testing",
                        "A"
                    )
                },

                // Data
                new()
                {
                    (
                        "Which language queries relational databases?",
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
                        "Which Python library handles tabular data?",
                        "Pandas",
                        "React",
                        "Express",
                        "Spring",
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
                                now.AddDays(-5)
                        });
                }
            }


            context.AssessmentQuestions.AddRange(
                questions);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {questions.Count} assessment questions.");


            // =========================================================
            // 18. CREATE 9 INTERVIEWS
            // =========================================================

            var interviewTypes = new[]
            {
                "Technical",
                "HR",
                "Technical",
                "Managerial",
                "Behavioral",
                "Technical",
                "HR",
                "Final",
                "Technical"
            };


            var interviewStatuses = new[]
            {
                "Completed",
                "Scheduled",
                "Completed",
                "Scheduled",
                "Completed",
                "Scheduled",
                "Cancelled",
                "Completed",
                "Scheduled"
            };


            var interviewers = new[]
            {
                ("Karan Malhotra",
                 "karan.malhotra@smarthire.com"),

                ("Riya Menon",
                 "riya.menon@smarthire.com"),

                ("Aditya Rao",
                 "aditya.rao@smarthire.com")
            };


            var interviews =
                new List<Interview>();


            for (int i = 0; i < 9; i++)
            {
                var interviewer =
                    interviewers[
                        i % interviewers.Length
                    ];

                DateTime scheduledAt;

                if (
                    interviewStatuses[i] == "Completed" ||
                    interviewStatuses[i] == "Cancelled")
                {
                    scheduledAt =
                        now
                            .AddDays(-(i + 2))
                            .Date
                            .AddHours(10 + (i % 3));
                }
                else
                {
                    scheduledAt =
                        now
                            .AddDays(i + 1)
                            .Date
                            .AddHours(10 + (i % 3));
                }


                interviews.Add(
                    new Interview
                    {
                        ApplicationId =
                            applications[i].Id,

                        RecruiterId =
                            NikhilRecruiterId,

                        InterviewType =
                            interviewTypes[i],

                        ScheduledAt =
                            scheduledAt,

                        DurationMinutes =
                            i % 2 == 0
                                ? 60
                                : 45,

                        MeetingLink =
                            i % 2 == 0
                                ? $"https://meet.google.com/nikhil-{i + 201}"
                                : string.Empty,

                        Location =
                            i % 2 == 0
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
                                ? "Interview completed successfully."
                                : interviewStatuses[i] == "Scheduled"
                                    ? "Interview scheduled with the candidate."
                                    : "Interview cancelled due to scheduling conflict.",

                        CreatedAt =
                            now.AddDays(-(i + 3)),

                        UpdatedAt =
                            now.AddDays(-(i + 1))
                    });
            }


            context.Interviews.AddRange(
                interviews);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {interviews.Count} interviews.");


            // =========================================================
            // 19. CREATE 5 OFFERS
            // =========================================================

            var offerStatuses = new[]
            {
                "Draft",
                "Sent",
                "Accepted",
                "Rejected",
                "Withdrawn"
            };


            var offerDesignations = new[]
            {
                "React Developer",
                ".NET Backend Developer",
                "Java Developer",
                "Python Developer",
                "QA Automation Engineer"
            };


            var offerSalaries = new decimal[]
            {
                550000,
                650000,
                700000,
                575000,
                525000
            };


            /*
             * Applications 6-10 are used for offers.
             */

            var offerApplications =
                applications
                    .Skip(6)
                    .Take(5)
                    .ToList();


            var offers =
                new List<Offer>();


            for (int i = 0; i < 5; i++)
            {
                DateTime joiningDate;
                DateTime expiryDate;

                DateTime? sentAt = null;
                DateTime? respondedAt = null;


                if (offerStatuses[i] == "Draft")
                {
                    joiningDate =
                        now.Date.AddDays(20);

                    expiryDate =
                        joiningDate.AddDays(7);
                }
                else if (offerStatuses[i] == "Sent")
                {
                    joiningDate =
                        now.Date.AddDays(18);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-2);
                }
                else if (offerStatuses[i] == "Accepted")
                {
                    joiningDate =
                        now.Date.AddDays(12);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-8);

                    respondedAt =
                        now.AddDays(-4);
                }
                else if (offerStatuses[i] == "Rejected")
                {
                    joiningDate =
                        now.Date.AddDays(15);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-9);

                    respondedAt =
                        now.AddDays(-5);
                }
                else
                {
                    joiningDate =
                        now.Date.AddDays(14);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-6);

                    // Recruiter withdrawal is not a candidate response.
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
                            NikhilRecruiterId,

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
                            "Generated recruiter test data for Nikhil Bhat.",

                        CreatedAt =
                            now.AddDays(-(8 - i)),

                        UpdatedAt =
                            now.AddDays(-(3 - (i % 3))),

                        SentAt =
                            sentAt,

                        RespondedAt =
                            respondedAt
                    });
            }


            context.Offers.AddRange(
                offers);

            await context.SaveChangesAsync();


            // =========================================================
            // 20. SYNCHRONIZE APPLICATION STAGES
            // =========================================================

            for (int i = 0; i < offers.Count; i++)
            {
                var application =
                    offerApplications[i];

                switch (offers[i].Status)
                {
                    case "Accepted":
                        application.CurrentStage =
                            "Hired";
                        break;

                    case "Rejected":
                        application.CurrentStage =
                            "Rejected";
                        break;

                    case "Withdrawn":
                        application.CurrentStage =
                            "Offer";
                        break;

                    case "Sent":
                        application.CurrentStage =
                            "Offer";
                        break;

                    case "Draft":
                        application.CurrentStage =
                            "Selected";
                        break;
                }

                application.UpdatedAt =
                    now.AddDays(-(i + 1));
            }


            await context.SaveChangesAsync();


            Console.WriteLine(
                $"Created {offers.Count} offers.");


            // =========================================================
            // 21. FINAL SUMMARY
            // =========================================================

            var finalJobs =
                await context.Jobs.CountAsync(j =>
                    j.RecruiterId ==
                    NikhilRecruiterId);


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
                        NikhilRecruiterId);


            var finalAssessments =
                await context.Assessments.CountAsync(a =>
                    a.RecruiterId ==
                    NikhilRecruiterId);


            var finalQuestions =
                await context.AssessmentQuestions
                    .CountAsync(q =>
                        context.Assessments
                            .Where(a =>
                                a.RecruiterId ==
                                NikhilRecruiterId)
                            .Select(a => a.Id)
                            .Contains(q.AssessmentId));


            var finalInterviews =
                await context.Interviews.CountAsync(i =>
                    i.RecruiterId ==
                    NikhilRecruiterId);


            var finalOffers =
                await context.Offers.CountAsync(o =>
                    o.RecruiterId ==
                    NikhilRecruiterId);


            Console.WriteLine(
                "==============================================");

            Console.WriteLine(
                "NIKHIL TEST DATA SEED COMPLETED");

            Console.WriteLine(
                $"Recruiter   : Nikhil Bhat (ID {NikhilRecruiterId})");

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