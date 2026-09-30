using HiringProjectNew.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Data
{
    public static class CandidateTestDataSeeder
    {
        // =========================================================
        // CANDIDATE DEFINITION
        // =========================================================

        private sealed class CandidateDefinition
        {
            public string FullName { get; set; } = string.Empty;

            public string Email { get; set; } = string.Empty;

            public string Password { get; set; }
                = "Candidate@123";

            public int ApplicationCount { get; set; }

            public int AssessmentJobCount { get; set; }

            public int InterviewCount { get; set; }

            public int OfferCount { get; set; }

            public int JobOffset { get; set; }
        }

        // =========================================================
        // MAIN SEED METHOD
        // =========================================================

        public static async Task ResetAndSeedAsync(
            ApplicationDbContext context)
        {
            Console.WriteLine();
            Console.WriteLine(
                "=================================================="
            );

            Console.WriteLine(
                "SMART HIRE - CANDIDATE TEST DATA SEEDER"
            );

            Console.WriteLine(
                "=================================================="
            );

            var now = DateTime.UtcNow;

            // =========================================================
            // 1. CANDIDATE TEST DATA DEFINITIONS
            // =========================================================

            var candidateDefinitions =
                new List<CandidateDefinition>
                {
                    // =================================================
                    // ANANYA REDDY
                    // LARGE DATASET
                    // =================================================

                    new CandidateDefinition
                    {
                        FullName = "Ananya Reddy",
                        Email = "ananya.reddy@gmail.com",
                        Password = "Candidate@123",

                        ApplicationCount = 20,
                        AssessmentJobCount = 12,
                        InterviewCount = 15,
                        OfferCount = 10,

                        JobOffset = 0
                    },

                    // =================================================
                    // RAHUL VERMA
                    // LARGE DATASET
                    // =================================================

                    new CandidateDefinition
                    {
                        FullName = "Rahul Verma",
                        Email = "rahul.candidate@smarthire.com",
                        Password = "Candidate@123",

                        ApplicationCount = 18,
                        AssessmentJobCount = 10,
                        InterviewCount = 12,
                        OfferCount = 8,

                        JobOffset = 3
                    },

                    // =================================================
                    // SNEHA IYER
                    // MEDIUM-LARGE DATASET
                    // =================================================

                    new CandidateDefinition
                    {
                        FullName = "Sneha Iyer",
                        Email = "sneha.candidate@smarthire.com",
                        Password = "Candidate@123",

                        ApplicationCount = 15,
                        AssessmentJobCount = 8,
                        InterviewCount = 10,
                        OfferCount = 6,

                        JobOffset = 6
                    },

                    // =================================================
                    // PRIYA SHARMA
                    // MEDIUM DATASET
                    // =================================================

                    new CandidateDefinition
                    {
                        FullName = "Priya Sharma",
                        Email = "priya.candidate@smarthire.com",
                        Password = "Candidate@123",

                        ApplicationCount = 12,
                        AssessmentJobCount = 7,
                        InterviewCount = 8,
                        OfferCount = 5,

                        JobOffset = 9
                    },

                    // =================================================
                    // ARJUN NAIR
                    // MEDIUM DATASET
                    // =================================================

                    new CandidateDefinition
                    {
                        FullName = "Arjun Nair",
                        Email = "arjun.candidate@smarthire.com",
                        Password = "Candidate@123",

                        ApplicationCount = 10,
                        AssessmentJobCount = 6,
                        InterviewCount = 7,
                        OfferCount = 4,

                        JobOffset = 12
                    }
                };

            // =========================================================
            // 2. CREATE / UPDATE CANDIDATE USERS
            // =========================================================

            var candidates = new List<User>();

            foreach (var definition in candidateDefinitions)
            {
                var candidate =
                    await context.Users
                        .FirstOrDefaultAsync(
                            u => u.Email == definition.Email
                        );

                // -----------------------------------------------------
                // EXISTING USER
                // -----------------------------------------------------

                if (candidate != null)
                {
                    if (!string.Equals(
                            candidate.Role,
                            "Candidate",
                            StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException(
                            $"User with email {definition.Email} already exists but is not a Candidate."
                        );
                    }

                    candidate.FullName = definition.FullName;
                    candidate.Role = "Candidate";
                    candidate.IsActive = true;

                    var passwordHasher = new PasswordHasher<User>();

                    candidate.PasswordHash =
                        passwordHasher.HashPassword(
                            candidate,
                            definition.Password
                        );
                }

                // -----------------------------------------------------
                // NEW USER
                // -----------------------------------------------------

                else
                {
                    candidate =
                        new User
                        {
                            FullName = definition.FullName,

                            Email = definition.Email,

                            Role = "Candidate",

                            IsActive = true,

                            CreatedAt = now
                        };

                    var passwordHasher = new PasswordHasher<User>();

                    candidate.PasswordHash =
                        passwordHasher.HashPassword(
                            candidate,
                            definition.Password
                        );

                    context.Users.Add(candidate);
                }

                candidates.Add(candidate);
            }

            await context.SaveChangesAsync();

            Console.WriteLine();
            Console.WriteLine("Candidate accounts ready:");

            foreach (var candidate in candidates)
            {
                Console.WriteLine(
                    $"  {candidate.FullName} | " +
                    $"{candidate.Email} | " +
                    $"ID: {candidate.Id}"
                );
            }

            // =========================================================
            // 3. GET CANDIDATE IDS
            // =========================================================

            var candidateIds =
                candidates
                    .Select(c => c.Id)
                    .ToList();

            // =========================================================
            // 4. GET OLD APPLICATION IDS
            // =========================================================

            var oldApplicationIds =
                await context.Applications
                    .Where(
                        a => candidateIds.Contains(a.CandidateId)
                    )
                    .Select(a => a.Id)
                    .ToListAsync();

            // =========================================================
            // 5. DELETE OLD OFFERS
            // =========================================================

            await context.Offers
                .Where(
                    o => candidateIds.Contains(o.CandidateId)
                )
                .ExecuteDeleteAsync();

            // =========================================================
            // 6. DELETE OLD INTERVIEWS
            // =========================================================

            if (oldApplicationIds.Count > 0)
            {
                await context.Interviews
                    .Where(
                        i => oldApplicationIds.Contains(i.ApplicationId)
                    )
                    .ExecuteDeleteAsync();
            }

            // =========================================================
            // 7. DELETE OLD ASSESSMENT RESULTS
            // =========================================================

            await context.AssessmentResults
                .Where(
                    r => candidateIds.Contains(r.CandidateId)
                )
                .ExecuteDeleteAsync();

            // =========================================================
            // 8. DELETE OLD APPLICATIONS
            // =========================================================

            await context.Applications
                .Where(
                    a => candidateIds.Contains(a.CandidateId)
                )
                .ExecuteDeleteAsync();

            Console.WriteLine();
            Console.WriteLine(
                "Old candidate test data deleted."
            );

            // =========================================================
            // 9. GET ACTIVE JOBS
            // =========================================================

            var jobs =
                await context.Jobs
                    .Where(j => j.IsActive)
                    .OrderBy(j => j.Id)
                    .ToListAsync();

            if (jobs.Count < 20)
            {
                throw new InvalidOperationException(
                    $"Candidate seeder requires at least 20 active jobs. Found only {jobs.Count}."
                );
            }

            // =========================================================
            // 10. GET ASSESSMENT-ENABLED JOBS
            // =========================================================

            var assessmentJobIds =
                await context.Assessments
                    .Where(a => a.IsActive)
                    .Select(a => a.JobId)
                    .Distinct()
                    .ToListAsync();

            var assessmentJobs =
                jobs
                    .Where(
                        j => assessmentJobIds.Contains(j.Id)
                    )
                    .ToList();

            if (assessmentJobs.Count < 12)
            {
                throw new InvalidOperationException(
                    $"Candidate seeder requires at least 12 active assessment-enabled jobs. Found only {assessmentJobs.Count}."
                );
            }

            // =========================================================
            // 11. JOB LOOKUP
            // =========================================================

            var jobLookup =
                jobs.ToDictionary(
                    j => j.Id
                );

            // =========================================================
            // 12. CREATE APPLICATIONS
            // =========================================================

            var allApplications =
                new List<Application>();

            foreach (var definition in candidateDefinitions)
            {
                var candidate =
                    candidates.First(
                        c => c.Email == definition.Email
                    );

                var selectedJobs =
                    GetCandidateJobs(
                        jobs,
                        assessmentJobs,
                        definition.ApplicationCount,
                        definition.AssessmentJobCount,
                        definition.JobOffset
                    );

                for (int i = 0; i < selectedJobs.Count; i++)
                {
                    var job = selectedJobs[i];

                    string currentStage;

                    // -------------------------------------------------
                    // OFFER STAGE
                    // -------------------------------------------------

                    if (i < definition.OfferCount)
                    {
                        currentStage = "Offer";
                    }

                    // -------------------------------------------------
                    // INTERVIEW STAGE
                    // -------------------------------------------------

                    else if (i < definition.InterviewCount)
                    {
                        currentStage = "Interview";
                    }

                    // -------------------------------------------------
                    // OTHER APPLICATIONS
                    // -------------------------------------------------

                    else
                    {
                        var stageIndex = i % 6;

                        currentStage =
                            stageIndex switch
                            {
                                0 => "Screening",
                                1 => "Shortlisted",
                                2 => "Applied",
                                3 => "Screening",
                                4 => "Shortlisted",
                                _ => "Applied"
                            };
                    }

                    var application =
                        new Application
                        {
                            CandidateId = candidate.Id,

                            JobId = job.Id,

                            CurrentStage = currentStage,

                            CoverLetter =
                                $"I am interested in the {job.Title} position and believe my technical skills and academic background make me a suitable candidate for this role.",

                            AppliedAt =
                                now.AddDays(
                                    -(45 - i)
                                ),

                            UpdatedAt =
                                now.AddDays(
                                    -(20 - i)
                                ),

                            IsActive = true
                        };

                    allApplications.Add(application);
                }
            }

            context.Applications.AddRange(
                allApplications
            );

            await context.SaveChangesAsync();

            Console.WriteLine();
            Console.WriteLine(
                $"Applications created: {allApplications.Count}"
            );

            // =========================================================
            // 13. GET CREATED APPLICATIONS
            // =========================================================

            var createdApplications =
                await context.Applications
                    .Where(
                        a => candidateIds.Contains(a.CandidateId)
                    )
                    .OrderBy(a => a.CandidateId)
                    .ThenBy(a => a.Id)
                    .ToListAsync();

            // =========================================================
            // 14. CREATE INTERVIEWS
            // =========================================================

            var interviews =
                new List<Interview>();

            foreach (var definition in candidateDefinitions)
            {
                var candidate =
                    candidates.First(
                        c => c.Email == definition.Email
                    );

                var candidateApplications =
                    createdApplications
                        .Where(
                            a => a.CandidateId == candidate.Id
                        )
                        .OrderBy(a => a.Id)
                        .Take(definition.InterviewCount)
                        .ToList();

                for (int i = 0;
                     i < candidateApplications.Count;
                     i++)
                {
                    var application =
                        candidateApplications[i];

                    if (!jobLookup.TryGetValue(
                            application.JobId,
                            out var applicationJob))
                    {
                        throw new InvalidOperationException(
                            $"Job {application.JobId} was not found for application {application.Id}."
                        );
                    }

                    // -------------------------------------------------
                    // DIFFERENT INTERVIEW STATUSES
                    // -------------------------------------------------

                    string status;
                    DateTime scheduledAt;

                    var pattern = i % 5;

                    // Scheduled
                    if (pattern == 0)
                    {
                        status = "Scheduled";

                        scheduledAt =
                            now.AddDays(
                                2 + i
                            );
                    }

                    // Completed
                    else if (pattern == 1)
                    {
                        status = "Completed";

                        scheduledAt =
                            now.AddDays(
                                -(2 + i)
                            );
                    }

                    // Rescheduled
                    else if (pattern == 2)
                    {
                        status = "Rescheduled";

                        scheduledAt =
                            now.AddDays(
                                4 + i
                            );
                    }

                    // Cancelled
                    else if (pattern == 3)
                    {
                        status = "Cancelled";

                        scheduledAt =
                            now.AddDays(
                                -(5 + i)
                            );
                    }

                    // No Show
                    else
                    {
                        status = "No Show";

                        scheduledAt =
                            now.AddDays(
                                -(8 + i)
                            );
                    }

                    bool activeMeeting =
                        status == "Scheduled" ||
                        status == "Rescheduled";

                    var interview =
                        new Interview
                        {
                            ApplicationId =
                                application.Id,

                            RecruiterId =
                                applicationJob.RecruiterId,

                            InterviewType =
                                i % 2 == 0
                                    ? "Technical"
                                    : "HR",

                            ScheduledAt =
                                scheduledAt,

                            DurationMinutes =
                                i % 3 == 0
                                    ? 45
                                    : 60,

                            MeetingLink =
                                activeMeeting
                                    ? $"https://meet.smarthire.com/interview/{candidate.Id}/{i + 1}"
                                    : string.Empty,

                            Location =
                                activeMeeting
                                    ? string.Empty
                                    : "SmartHire Office",

                            InterviewerName =
                                i % 2 == 0
                                    ? "Karan Malhotra"
                                    : "Anjali Menon",

                            InterviewerEmail =
                                i % 2 == 0
                                    ? "karan@smarthire.com"
                                    : "anjali@smarthire.com",

                            Status =
                                status,

                            Notes =
                                GetInterviewNotes(
                                    status
                                ),

                            CreatedAt =
                                now.AddDays(
                                    -30
                                ),

                            UpdatedAt =
                                now
                        };

                    interviews.Add(
                        interview
                    );
                }
            }

            context.Interviews.AddRange(
                interviews
            );

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Interviews created: {interviews.Count}"
            );

            // =========================================================
            // 15. CREATE OFFERS
            // =========================================================

            var offers =
                new List<Offer>();

            foreach (var definition in candidateDefinitions)
            {
                var candidate =
                    candidates.First(
                        c => c.Email == definition.Email
                    );

                var candidateApplications =
                    createdApplications
                        .Where(
                            a => a.CandidateId == candidate.Id
                        )
                        .OrderBy(a => a.Id)
                        .Take(definition.OfferCount)
                        .ToList();

                for (int i = 0;
                     i < candidateApplications.Count;
                     i++)
                {
                    var application =
                        candidateApplications[i];

                    if (!jobLookup.TryGetValue(
                            application.JobId,
                            out var applicationJob))
                    {
                        throw new InvalidOperationException(
                            $"Job {application.JobId} was not found for application {application.Id}."
                        );
                    }

                    // -------------------------------------------------
                    // DIFFERENT OFFER STATUSES
                    // -------------------------------------------------

                    string status;

                    var statusPattern =
                        i % 5;

                    if (statusPattern == 0)
                    {
                        status = "Accepted";
                    }
                    else if (statusPattern == 1)
                    {
                        status = "Sent";
                    }
                    else if (statusPattern == 2)
                    {
                        status = "Rejected";
                    }
                    else if (statusPattern == 3)
                    {
                        status = "Sent";
                    }
                    else
                    {
                        status = "Accepted";
                    }

                    DateTime sentAt =
                        now.AddDays(
                            -(15 + i)
                        );

                    DateTime? respondedAt = null;

                    if (status == "Accepted")
                    {
                        respondedAt =
                            now.AddDays(
                                -(4 + i)
                            );
                    }
                    else if (status == "Rejected")
                    {
                        respondedAt =
                            now.AddDays(
                                -(5 + i)
                            );
                    }

                    decimal offeredSalary =
                        CalculateOfferedSalary(
                            applicationJob
                        );

                    var joiningDate =
                        now.AddDays(
                            30 + (i * 5)
                        );

                    var expiryDate =
                        now.AddDays(
                            45 + (i * 5)
                        );

                    var offer =
                        new Offer
                        {
                            ApplicationId =
                                application.Id,

                            CandidateId =
                                candidate.Id,

                            JobId =
                                application.JobId,

                            RecruiterId =
                                applicationJob.RecruiterId,

                            Designation =
                                applicationJob.Title,

                            OfferedSalary =
                                offeredSalary,

                            JoiningDate =
                                joiningDate,

                            OfferExpiryDate =
                                expiryDate,

                            Status =
                                status,

                            Benefits =
                                "Health Insurance, Paid Leave, Professional Development",

                            Notes =
                                $"Offer generated for {candidate.FullName} as part of SmartHire candidate test data.",

                            CreatedAt =
                                now.AddDays(
                                    -18
                                ),

                            UpdatedAt =
                                now,

                            SentAt =
                                sentAt,

                            RespondedAt =
                                respondedAt
                        };

                    offers.Add(
                        offer
                    );
                }
            }

            context.Offers.AddRange(
                offers
            );

            await context.SaveChangesAsync();

            Console.WriteLine(
                $"Offers created: {offers.Count}"
            );

            // =========================================================
            // 16. FINAL SUMMARY
            // =========================================================

            Console.WriteLine();
            Console.WriteLine(
                "=================================================="
            );

            Console.WriteLine(
                "CANDIDATE TEST DATA CREATED"
            );

            Console.WriteLine(
                "=================================================="
            );

            foreach (var definition in candidateDefinitions)
            {
                var candidate =
                    candidates.First(
                        c => c.Email == definition.Email
                    );

                var applicationCount =
                    await context.Applications
                        .CountAsync(
                            a => a.CandidateId == candidate.Id
                        );

                var interviewCount =
                    await context.Interviews
                        .CountAsync(
                            i =>
                                context.Applications
                                    .Any(
                                        a =>
                                            a.Id == i.ApplicationId &&
                                            a.CandidateId == candidate.Id
                                    )
                        );

                var offerCount =
                    await context.Offers
                        .CountAsync(
                            o => o.CandidateId == candidate.Id
                        );

                var assessmentCount =
                    await context.Assessments
                        .CountAsync(
                            a =>
                                a.IsActive &&
                                context.Applications
                                    .Any(
                                        app =>
                                            app.CandidateId ==
                                                candidate.Id &&
                                            app.JobId == a.JobId &&
                                            app.IsActive
                                    )
                        );

                Console.WriteLine();
                Console.WriteLine(
                    $"Candidate       : {candidate.FullName}"
                );

                Console.WriteLine(
                    $"Email           : {candidate.Email}"
                );

                Console.WriteLine(
                    $"Password        : {definition.Password}"
                );

                Console.WriteLine(
                    $"Applications    : {applicationCount}"
                );

                Console.WriteLine(
                    $"Assessments     : {assessmentCount}"
                );

                Console.WriteLine(
                    $"Interviews      : {interviewCount}"
                );

                Console.WriteLine(
                    $"Offers          : {offerCount}"
                );
            }

            Console.WriteLine();
            Console.WriteLine(
                "=================================================="
            );

            Console.WriteLine(
                "CANDIDATE SEEDING COMPLETED"
            );

            Console.WriteLine(
                "=================================================="
            );

            Console.WriteLine();
        }

        // =============================================================
        // GET DIFFERENT JOBS FOR EACH CANDIDATE
        // =============================================================

        private static List<Job> GetCandidateJobs(
            List<Job> allJobs,
            List<Job> assessmentJobs,
            int applicationCount,
            int assessmentJobCount,
            int jobOffset)
        {
            var selectedJobs =
                new List<Job>();

            // ---------------------------------------------------------
            // FIRST: ASSESSMENT-ENABLED JOBS
            // ---------------------------------------------------------

            if (assessmentJobs.Count > 0)
            {
                for (
                    int i = 0;
                    i < assessmentJobCount;
                    i++)
                {
                    int index =
                        (
                            jobOffset + i
                        )
                        %
                        assessmentJobs.Count;

                    var job =
                        assessmentJobs[index];

                    if (
                        !selectedJobs.Any(
                            j => j.Id == job.Id
                        ))
                    {
                        selectedJobs.Add(
                            job
                        );
                    }
                }
            }

            // ---------------------------------------------------------
            // SECOND: OTHER ACTIVE JOBS
            // ---------------------------------------------------------

            int normalJobOffset =
                (
                    jobOffset +
                    assessmentJobCount
                )
                %
                allJobs.Count;

            int attempts = 0;

            while (
                selectedJobs.Count <
                    applicationCount &&
                attempts <
                    allJobs.Count * 3)
            {
                int index =
                    (
                        normalJobOffset +
                        attempts
                    )
                    %
                    allJobs.Count;

                var job =
                    allJobs[index];

                if (
                    !selectedJobs.Any(
                        j => j.Id == job.Id
                    ))
                {
                    selectedJobs.Add(
                        job
                    );
                }

                attempts++;
            }

            if (
                selectedJobs.Count <
                applicationCount)
            {
                throw new InvalidOperationException(
                    $"Unable to create {applicationCount} unique job applications."
                );
            }

            return selectedJobs;
        }

        // =============================================================
        // INTERVIEW NOTES
        // =============================================================

        private static string GetInterviewNotes(
            string status)
        {
            return status switch
            {
                "Scheduled" =>
                    "Please join the interview using the meeting link at the scheduled time.",

                "Rescheduled" =>
                    "Interview has been rescheduled. Please use the updated meeting details.",

                "Completed" =>
                    "Interview completed successfully.",

                "Cancelled" =>
                    "Interview cancelled due to scheduling conflict.",

                "No Show" =>
                    "Candidate did not attend the scheduled interview.",

                _ =>
                    "Interview details available in the candidate portal."
            };
        }

        // =============================================================
        // OFFER SALARY
        // =============================================================

        private static decimal CalculateOfferedSalary(
            Job job)
        {
            try
            {
                decimal minimum =
                    Convert.ToDecimal(
                        job.MinimumSalary
                    );

                decimal maximum =
                    Convert.ToDecimal(
                        job.MaximumSalary
                    );

                if (
                    maximum > 0 &&
                    maximum >= minimum)
                {
                    return Math.Round(
                        (
                            minimum +
                            maximum
                        )
                        /
                        2m,
                        0
                    );
                }

                if (
                    minimum > 0)
                {
                    return minimum;
                }
            }
            catch
            {
                // Use fallback salary.
            }

            return 600000m;
        }
    }
}