using HiringProjectNew.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Data
{
    public static class MeeraTestDataSeeder
    {
        private const int MeeraRecruiterId = 24;

        public static async Task ResetAndSeedAsync(
            ApplicationDbContext context)
        {
            Console.WriteLine(
                "==============================================");

            Console.WriteLine(
                "MEERA RECRUITER DATA RESET + SEED STARTED");

            Console.WriteLine(
                "==============================================");


            // =========================================================
            // 1. VERIFY MEERA
            // =========================================================

            var recruiterExists =
                await context.Users.AnyAsync(u =>
                    u.Id == MeeraRecruiterId &&
                    u.Role == "Recruiter");

            if (!recruiterExists)
            {
                throw new InvalidOperationException(
                    $"Recruiter with ID {MeeraRecruiterId} was not found."
                );
            }


            // =========================================================
            // 2. GET MEERA'S OLD JOB IDS
            // =========================================================

            var oldJobIds =
                await context.Jobs
                    .Where(j =>
                        j.RecruiterId == MeeraRecruiterId)
                    .Select(j => j.Id)
                    .ToListAsync();


            // =========================================================
            // 3. GET MEERA'S OLD ASSESSMENT IDS
            // =========================================================

            var oldAssessmentIds =
                await context.Assessments
                    .Where(a =>
                        a.RecruiterId == MeeraRecruiterId)
                    .Select(a => a.Id)
                    .ToListAsync();


            // =========================================================
            // 4. DELETE OLD OFFERS
            // =========================================================

            await context.Offers
                .Where(o =>
                    o.RecruiterId == MeeraRecruiterId ||
                    oldJobIds.Contains(o.JobId))
                .ExecuteDeleteAsync();


            // =========================================================
            // 5. DELETE OLD INTERVIEWS
            // =========================================================

            await context.Interviews
                .Where(i =>
                    i.RecruiterId == MeeraRecruiterId ||
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
                        oldAssessmentIds.Contains(
                            r.AssessmentId))
                    .ExecuteDeleteAsync();
            }


            // =========================================================
            // 7. DELETE OLD ASSESSMENT QUESTIONS
            // =========================================================

            if (oldAssessmentIds.Count > 0)
            {
                await context.AssessmentQuestions
                    .Where(q =>
                        oldAssessmentIds.Contains(
                            q.AssessmentId))
                    .ExecuteDeleteAsync();
            }


            // =========================================================
            // 8. DELETE OLD ASSESSMENTS
            // =========================================================

            await context.Assessments
                .Where(a =>
                    a.RecruiterId == MeeraRecruiterId)
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
                    j.RecruiterId == MeeraRecruiterId)
                .ExecuteDeleteAsync();


            Console.WriteLine(
                "Old Meera recruiter data deleted.");


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
            // 13. GET 9 ACTIVE CANDIDATES
            // =========================================================

            var candidates =
                await context.Users
                    .Where(u =>
                        u.Role == "Candidate" &&
                        u.IsActive)
                    .OrderBy(u => u.Id)
                    .Take(9)
                    .ToListAsync();

            if (candidates.Count < 9)
            {
                throw new InvalidOperationException(
                    "At least 9 active Candidate users are required."
                );
            }


            var now = DateTime.UtcNow;


            // =========================================================
            // 14. CREATE 6 JOBS
            // =========================================================

            var jobs = new List<Job>
            {
                new Job
                {
                    Title = "Frontend Developer",
                    DepartmentId =
                        departments[0 % departments.Count].Id,
                    JobCategoryId =
                        categories[0 % categories.Count].Id,
                    RecruiterId =
                        MeeraRecruiterId,
                    Location =
                        "HSR Layout, Bengaluru",
                    EmploymentType =
                        "Full Time",
                    ExperienceLevel =
                        "Fresher",
                    MinimumSalary =
                        400000,
                    MaximumSalary =
                        700000,
                    RequiredSkills =
                        "React, JavaScript, HTML, CSS, Git",
                    Description =
                        "Develop modern responsive web applications.",
                    Responsibilities =
                        "Build reusable UI components and integrate APIs.",
                    Requirements =
                        "Good JavaScript and React fundamentals.",
                    ApplicationDeadline =
                        now.AddDays(35),
                    IsActive =
                        true,
                    CreatedAt =
                        now.AddDays(-16)
                },

                new Job
                {
                    Title = "Backend Developer",
                    DepartmentId =
                        departments[1 % departments.Count].Id,
                    JobCategoryId =
                        categories[1 % categories.Count].Id,
                    RecruiterId =
                        MeeraRecruiterId,
                    Location =
                        "Bellandur, Bengaluru",
                    EmploymentType =
                        "Full Time",
                    ExperienceLevel =
                        "0-1 Years",
                    MinimumSalary =
                        450000,
                    MaximumSalary =
                        800000,
                    RequiredSkills =
                        "C#, ASP.NET Core, SQL Server, REST API",
                    Description =
                        "Build scalable backend services and APIs.",
                    Responsibilities =
                        "Develop APIs and database integrations.",
                    Requirements =
                        "C#, ASP.NET Core and SQL knowledge.",
                    ApplicationDeadline =
                        now.AddDays(40),
                    IsActive =
                        true,
                    CreatedAt =
                        now.AddDays(-14)
                },

                new Job
                {
                    Title = "UI UX Designer",
                    DepartmentId =
                        departments[2 % departments.Count].Id,
                    JobCategoryId =
                        categories[2 % categories.Count].Id,
                    RecruiterId =
                        MeeraRecruiterId,
                    Location =
                        "Koramangala, Bengaluru",
                    EmploymentType =
                        "Full Time",
                    ExperienceLevel =
                        "Fresher",
                    MinimumSalary =
                        350000,
                    MaximumSalary =
                        650000,
                    RequiredSkills =
                        "Figma, Wireframing, Prototyping, UI Design",
                    Description =
                        "Design intuitive and modern digital experiences.",
                    Responsibilities =
                        "Create wireframes and high fidelity prototypes.",
                    Requirements =
                        "Strong Figma and visual design skills.",
                    ApplicationDeadline =
                        now.AddDays(45),
                    IsActive =
                        true,
                    CreatedAt =
                        now.AddDays(-12)
                },

                new Job
                {
                    Title = "Data Analyst",
                    DepartmentId =
                        departments[0 % departments.Count].Id,
                    JobCategoryId =
                        categories[3 % categories.Count].Id,
                    RecruiterId =
                        MeeraRecruiterId,
                    Location =
                        "Whitefield, Bengaluru",
                    EmploymentType =
                        "Full Time",
                    ExperienceLevel =
                        "Fresher",
                    MinimumSalary =
                        400000,
                    MaximumSalary =
                        700000,
                    RequiredSkills =
                        "SQL, Excel, Power BI, Python",
                    Description =
                        "Analyze business data and create useful reports.",
                    Responsibilities =
                        "Prepare dashboards and analyze datasets.",
                    Requirements =
                        "SQL, Excel and analytical skills.",
                    ApplicationDeadline =
                        now.AddDays(30),
                    IsActive =
                        true,
                    CreatedAt =
                        now.AddDays(-10)
                },

                new Job
                {
                    Title = "QA Engineer",
                    DepartmentId =
                        departments[1 % departments.Count].Id,
                    JobCategoryId =
                        categories[4 % categories.Count].Id,
                    RecruiterId =
                        MeeraRecruiterId,
                    Location =
                        "Marathahalli, Bengaluru",
                    EmploymentType =
                        "Full Time",
                    ExperienceLevel =
                        "0-1 Years",
                    MinimumSalary =
                        350000,
                    MaximumSalary =
                        650000,
                    RequiredSkills =
                        "Manual Testing, Selenium, API Testing, SQL",
                    Description =
                        "Ensure product quality through manual and automated testing.",
                    Responsibilities =
                        "Prepare test cases and automate regression scenarios.",
                    Requirements =
                        "Testing fundamentals and basic programming.",
                    ApplicationDeadline =
                        now.AddDays(38),
                    IsActive =
                        true,
                    CreatedAt =
                        now.AddDays(-8)
                },

                new Job
                {
                    Title = "Business Analyst",
                    DepartmentId =
                        departments[2 % departments.Count].Id,
                    JobCategoryId =
                        categories[5 % categories.Count].Id,
                    RecruiterId =
                        MeeraRecruiterId,
                    Location =
                        "Bengaluru, Karnataka",
                    EmploymentType =
                        "Full Time",
                    ExperienceLevel =
                        "Fresher",
                    MinimumSalary =
                        400000,
                    MaximumSalary =
                        700000,
                    RequiredSkills =
                        "SQL, Excel, Documentation, Requirement Analysis",
                    Description =
                        "Work with business teams to understand and document requirements.",
                    Responsibilities =
                        "Gather requirements and prepare functional documentation.",
                    Requirements =
                        "Good communication and analytical skills.",
                    ApplicationDeadline =
                        now.AddDays(42),
                    IsActive =
                        true,
                    CreatedAt =
                        now.AddDays(-6)
                }
            };


            context.Jobs.AddRange(jobs);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {jobs.Count} jobs.");


            // =========================================================
            // 15. CREATE 9 APPLICATIONS
            // =========================================================

            var stages = new[]
            {
                "Applied",
                "Screening",
                "Shortlisted",
                "Assessment",
                "Interview",
                "Selected",
                "Offer",
                "Hired",
                "Rejected"
            };


            var applications =
                new List<Application>();

            for (int i = 0; i < 9; i++)
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
                            $"Candidate {i + 1} has applied for this role " +
                            "and has relevant academic and project experience.",

                        AppliedAt =
                            now.AddDays(-(18 - i)),

                        UpdatedAt =
                            now.AddDays(-(8 - (i % 4))),

                        IsActive =
                            true
                    });
            }


            context.Applications.AddRange(
                applications);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {applications.Count} applications.");


            // =========================================================
            // 16. CREATE 5 ASSESSMENTS
            // =========================================================

            var assessmentData = new[]
            {
                new
                {
                    Title =
                        "Frontend Development Assessment",
                    Description =
                        "React and JavaScript technical assessment.",
                    JobIndex = 0,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title =
                        "Backend Development Assessment",
                    Description =
                        "C#, ASP.NET Core and SQL assessment.",
                    JobIndex = 1,
                    Duration = 45,
                    Passing = 65
                },

                new
                {
                    Title =
                        "UI UX Design Assessment",
                    Description =
                        "UI design and user experience assessment.",
                    JobIndex = 2,
                    Duration = 35,
                    Passing = 60
                },

                new
                {
                    Title =
                        "Data Analysis Assessment",
                    Description =
                        "SQL, Excel and data analysis assessment.",
                    JobIndex = 3,
                    Duration = 40,
                    Passing = 60
                },

                new
                {
                    Title =
                        "QA Testing Assessment",
                    Description =
                        "Software testing and automation assessment.",
                    JobIndex = 4,
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
                            MeeraRecruiterId,

                        DurationMinutes =
                            item.Duration,

                        PassingScore =
                            item.Passing,

                        IsActive =
                            true,

                        CreatedAt =
                            now.AddDays(-5)
                    });
            }


            context.Assessments.AddRange(
                assessments);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {assessments.Count} assessments.");


            // =========================================================
            // 17. CREATE 20 ASSESSMENT QUESTIONS
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
                // FRONTEND
                // =====================================================

                new()
                {
                    (
                        "Which hook is used to manage state in React?",
                        "useState",
                        "useRoute",
                        "useClass",
                        "useValue",
                        "A"
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
                        "What does JSX allow?",
                        "SQL syntax",
                        "HTML-like syntax in JavaScript",
                        "C# syntax",
                        "Database commands",
                        "B"
                    ),

                    (
                        "Which prop helps React identify list elements?",
                        "id",
                        "key",
                        "name",
                        "indexOnly",
                        "B"
                    )
                },

                // =====================================================
                // BACKEND
                // =====================================================

                new()
                {
                    (
                        "Which framework is used to build C# REST APIs?",
                        "ASP.NET Core",
                        "Django",
                        "Express",
                        "Laravel",
                        "A"
                    ),

                    (
                        "Which ORM is commonly used with ASP.NET Core?",
                        "Hibernate",
                        "Entity Framework Core",
                        "Mongoose",
                        "Sequelize",
                        "B"
                    ),

                    (
                        "Which HTTP method is normally used to create data?",
                        "GET",
                        "POST",
                        "DELETE",
                        "HEAD",
                        "B"
                    ),

                    (
                        "Which class represents the EF Core database context?",
                        "DbContext",
                        "DbSession",
                        "SqlManager",
                        "DataContextManager",
                        "A"
                    )
                },

                // =====================================================
                // UI UX
                // =====================================================

                new()
                {
                    (
                        "Which tool is widely used for UI design?",
                        "Figma",
                        "Docker",
                        "Git",
                        "Postman",
                        "A"
                    ),

                    (
                        "What is a wireframe?",
                        "A database",
                        "A basic layout of a screen",
                        "A programming language",
                        "A server",
                        "B"
                    ),

                    (
                        "What is a prototype?",
                        "An interactive representation of a design",
                        "A database table",
                        "A compiler",
                        "A server",
                        "A"
                    ),

                    (
                        "What does UX stand for?",
                        "User Experience",
                        "User Extension",
                        "Universal XML",
                        "User Execution",
                        "A"
                    )
                },

                // =====================================================
                // DATA
                // =====================================================

                new()
                {
                    (
                        "Which language is used to query relational databases?",
                        "SQL",
                        "HTML",
                        "CSS",
                        "XML",
                        "A"
                    ),

                    (
                        "Which SQL command retrieves records?",
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
                        "Which Python library is commonly used for data analysis?",
                        "Pandas",
                        "React",
                        "Express",
                        "Angular",
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
                        "Figma",
                        "Excel",
                        "Photoshop",
                        "A"
                    ),

                    (
                        "Testing individual units of code is called?",
                        "Unit testing",
                        "System testing",
                        "Acceptance testing",
                        "Performance testing",
                        "A"
                    ),

                    (
                        "Testing an API response is called?",
                        "API testing",
                        "UI design",
                        "Compilation testing",
                        "Database design",
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
                                assessments[
                                    assessmentIndex
                                ].Id,

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

                            Marks =
                                5,

                            IsActive =
                                true,

                            CreatedAt =
                                now.AddDays(-4)
                        });
                }
            }


            context.AssessmentQuestions.AddRange(
                questions);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {questions.Count} assessment questions.");


            // =========================================================
            // 18. CREATE 7 INTERVIEWS
            // =========================================================

            var interviewTypes = new[]
            {
                "Technical",
                "HR",
                "Technical",
                "Managerial",
                "Behavioral",
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
                "Cancelled"
            };


            var interviewers = new[]
            {
                (
                    "Meera Recruitment Team",
                    "recruitment@smarthire.com"
                ),

                (
                    "Sanjay Kumar",
                    "sanjay.kumar@smarthire.com"
                ),

                (
                    "Priya Shah",
                    "priya.shah@smarthire.com"
                )
            };


            var interviews =
                new List<Interview>();


            for (int i = 0; i < 7; i++)
            {
                var interviewer =
                    interviewers[
                        i % interviewers.Length
                    ];


                DateTime scheduledAt;


                if (
                    interviewStatuses[i] ==
                        "Completed" ||
                    interviewStatuses[i] ==
                        "Cancelled")
                {
                    scheduledAt =
                        now
                            .AddDays(-(i + 2))
                            .Date
                            .AddHours(
                                10 + (i % 3)
                            );
                }
                else
                {
                    scheduledAt =
                        now
                            .AddDays(i + 1)
                            .Date
                            .AddHours(
                                10 + (i % 3)
                            );
                }


                interviews.Add(
                    new Interview
                    {
                        ApplicationId =
                            applications[i].Id,

                        RecruiterId =
                            MeeraRecruiterId,

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
                                ? $"https://meet.google.com/meera-{i + 301}"
                                : string.Empty,

                        Location =
                            i % 2 == 0
                                ? string.Empty
                                : "SmartHire Office, Bengaluru",

                        InterviewerName =
                            interviewer.Item1,

                        InterviewerEmail =
                            interviewer.Item2,

                        Status =
                            interviewStatuses[i],

                        Notes =
                            interviewStatuses[i] ==
                                "Completed"
                                ? "Interview completed successfully."
                                :
                            interviewStatuses[i] ==
                                "Scheduled"
                                ? "Interview scheduled with candidate."
                                :
                            "Interview cancelled due to scheduling conflict.",

                        CreatedAt =
                            now.AddDays(-(i + 4)),

                        UpdatedAt =
                            now.AddDays(-(i + 2))
                    });
            }


            context.Interviews.AddRange(
                interviews);

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Created {interviews.Count} interviews.");


            // =========================================================
            // 19. CREATE 4 OFFERS
            // =========================================================

            var offerStatuses = new[]
            {
                "Draft",
                "Sent",
                "Accepted",
                "Withdrawn"
            };


            var offerDesignations = new[]
            {
                "Frontend Developer",
                "Backend Developer",
                "Data Analyst",
                "QA Engineer"
            };


            var offerSalaries = new decimal[]
            {
                550000,
                650000,
                600000,
                525000
            };


            /*
             * Applications 5-8 are used for offers.
             */

            var offerApplications =
                applications
                    .Skip(5)
                    .Take(4)
                    .ToList();


            var offers =
                new List<Offer>();


            for (int i = 0; i < 4; i++)
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
                        now.Date.AddDays(15);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-8);

                    respondedAt =
                        now.AddDays(-3);
                }
                else
                {
                    joiningDate =
                        now.Date.AddDays(14);

                    expiryDate =
                        joiningDate.AddDays(7);

                    sentAt =
                        now.AddDays(-6);

                    // Recruiter withdrawal.
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
                            MeeraRecruiterId,

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
                            "Generated recruiter test data for Meera Joshi.",

                        CreatedAt =
                            now.AddDays(-(7 - i)),

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
                    MeeraRecruiterId);


            var finalApplications =
                await context.Applications
                    .Join(
                        context.Jobs,
                        application =>
                            application.JobId,
                        job =>
                            job.Id,
                        (application, job) =>
                            new
                            {
                                application,
                                job
                            })
                    .CountAsync(x =>
                        x.job.RecruiterId ==
                        MeeraRecruiterId);


            var finalAssessments =
                await context.Assessments.CountAsync(a =>
                    a.RecruiterId ==
                    MeeraRecruiterId);


            var finalQuestions =
                await context.AssessmentQuestions
                    .CountAsync(q =>
                        context.Assessments
                            .Where(a =>
                                a.RecruiterId ==
                                MeeraRecruiterId)
                            .Select(a => a.Id)
                            .Contains(
                                q.AssessmentId));


            var finalInterviews =
                await context.Interviews.CountAsync(i =>
                    i.RecruiterId ==
                    MeeraRecruiterId);


            var finalOffers =
                await context.Offers.CountAsync(o =>
                    o.RecruiterId ==
                    MeeraRecruiterId);


            Console.WriteLine(
                "==============================================");

            Console.WriteLine(
                "MEERA TEST DATA SEED COMPLETED");

            Console.WriteLine(
                $"Recruiter   : Meera Joshi (ID {MeeraRecruiterId})");

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