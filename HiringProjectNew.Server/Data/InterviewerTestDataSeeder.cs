using HiringProjectNew.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HiringProjectNew.Server.Data
{
    public static class InterviewerTestDataSeeder
    {
        // =========================================================
        // INTERVIEWER DEFINITION
        // =========================================================

        private sealed class InterviewerDefinition
        {
            public string FullName { get; set; } = string.Empty;

            public string Email { get; set; } = string.Empty;

            public string Password { get; set; }
                = "Interviewer@123";

            public int InterviewCount { get; set; }
        }


        // =========================================================
        // MAIN SEED METHOD
        // =========================================================

        public static async Task SeedAsync(
            ApplicationDbContext context)
        {
            Console.WriteLine();
            Console.WriteLine(
                "=================================================="
            );
            Console.WriteLine(
                "SMART HIRE - INTERVIEWER TEST DATA SEEDER"
            );
            Console.WriteLine(
                "=================================================="
            );


            var now = DateTime.UtcNow;


            // =========================================================
            // 1. INTERVIEWER DEFINITIONS
            // =========================================================

            var interviewerDefinitions =
                new List<InterviewerDefinition>
                {
                    // -------------------------------------------------
                    // KARAN
                    // LARGE DATASET
                    // -------------------------------------------------

                    new InterviewerDefinition
                    {
                        FullName =
                            "Karan Malhotra",

                        Email =
                            "karan@smarthire.com",

                        Password =
                            "Interviewer@123",

                        InterviewCount =
                            10
                    },


                    // -------------------------------------------------
                    // ANJALI
                    // MEDIUM DATASET
                    // -------------------------------------------------

                    new InterviewerDefinition
                    {
                        FullName =
                            "Anjali Menon",

                        Email =
                            "anjali@smarthire.com",

                        Password =
                            "Interviewer@123",

                        InterviewCount =
                            7
                    },


                    // -------------------------------------------------
                    // RAHUL
                    // SMALL DATASET
                    // -------------------------------------------------

                    new InterviewerDefinition
                    {
                        FullName =
                            "Rahul Mehta",

                        Email =
                            "rahul.interviewer@smarthire.com",

                        Password =
                            "Interviewer@123",

                        InterviewCount =
                            5
                    }
                };


            // =========================================================
            // 2. CREATE / UPDATE INTERVIEWER USERS
            // =========================================================

            var interviewers =
                new List<User>();


            foreach (
                var definition
                in interviewerDefinitions)
            {
                var interviewer =
                    await context.Users
                        .FirstOrDefaultAsync(
                            u =>
                                u.Email ==
                                definition.Email
                        );


                // -----------------------------------------------------
                // EXISTING USER
                // -----------------------------------------------------

                if (interviewer != null)
                {
                    if (!string.Equals(
                            interviewer.Role,
                            "Interviewer",
                            StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException(
                            $"User with email {definition.Email} already exists but is not an Interviewer."
                        );
                    }


                    interviewer.FullName =
                        definition.FullName;

                    interviewer.Role =
                        "Interviewer";

                    interviewer.IsActive =
                        true;


                    var passwordHasher =
                        new PasswordHasher<User>();


                    interviewer.PasswordHash =
                        passwordHasher.HashPassword(
                            interviewer,
                            definition.Password
                        );
                }


                // -----------------------------------------------------
                // NEW USER
                // -----------------------------------------------------

                else
                {
                    interviewer =
                        new User
                        {
                            FullName =
                                definition.FullName,

                            Email =
                                definition.Email,

                            Role =
                                "Interviewer",

                            IsActive =
                                true,

                            CreatedAt =
                                now
                        };


                    var passwordHasher =
                        new PasswordHasher<User>();


                    interviewer.PasswordHash =
                        passwordHasher.HashPassword(
                            interviewer,
                            definition.Password
                        );


                    context.Users.Add(
                        interviewer
                    );
                }


                interviewers.Add(
                    interviewer
                );
            }


            await context.SaveChangesAsync();


            // =========================================================
            // 3. PRINT INTERVIEWER ACCOUNTS
            // =========================================================

            Console.WriteLine();
            Console.WriteLine(
                "Interviewer accounts ready:"
            );


            foreach (
                var interviewer
                in interviewers)
            {
                Console.WriteLine(
                    $"  {interviewer.FullName} | " +
                    $"{interviewer.Email} | " +
                    $"ID: {interviewer.Id}"
                );
            }


            // =========================================================
            // 4. GET INTERVIEWER EMAILS
            // =========================================================

            var interviewerEmails =
                interviewerDefinitions
                    .Select(i => i.Email)
                    .ToList();


            // =========================================================
            // 5. DELETE OLD INTERVIEWER TEST INTERVIEWS
            // =========================================================

            await context.Interviews
                .Where(
                    i =>
                        interviewerEmails.Contains(
                            i.InterviewerEmail
                        )
                )
                .ExecuteDeleteAsync();


            Console.WriteLine();
            Console.WriteLine(
                "Old interviewer test interviews deleted."
            );


            // =========================================================
            // 6. GET ACTIVE APPLICATIONS
            // =========================================================

            var applications =
                await context.Applications
                    .Where(
                        a =>
                            a.IsActive
                    )
                    .OrderBy(
                        a => a.Id
                    )
                    .ToListAsync();


            if (applications.Count < 22)
            {
                throw new InvalidOperationException(
                    $"Interviewer seeder requires at least 22 active applications. Found only {applications.Count}."
                );
            }


            // =========================================================
            // 7. GET JOB LOOKUP
            // =========================================================

            var jobIds =
                applications
                    .Select(a => a.JobId)
                    .Distinct()
                    .ToList();


            var jobs =
                await context.Jobs
                    .Where(
                        j =>
                            jobIds.Contains(j.Id)
                    )
                    .ToDictionaryAsync(
                        j => j.Id
                    );


            // =========================================================
            // 8. CREATE INTERVIEWS
            // =========================================================

            var interviews =
                new List<Interview>();


            int applicationIndex = 0;


            foreach (
                var definition
                in interviewerDefinitions)
            {
                for (
                    int i = 0;
                    i < definition.InterviewCount;
                    i++)
                {
                    // -------------------------------------------------
                    // Get an existing application
                    // -------------------------------------------------

                    var application =
                        applications[
                            applicationIndex
                        ];

                    applicationIndex++;


                    if (
                        !jobs.TryGetValue(
                            application.JobId,
                            out var job))
                    {
                        throw new InvalidOperationException(
                            $"Job {application.JobId} was not found for application {application.Id}."
                        );
                    }


                    // -------------------------------------------------
                    // Determine status and date
                    // -------------------------------------------------

                    string status;
                    DateTime scheduledAt;


                    var pattern =
                        i % 5;


                    // =================================================
                    // SCHEDULED
                    // =================================================

                    if (pattern == 0)
                    {
                        status =
                            "Scheduled";

                        scheduledAt =
                            now
                                .AddDays(
                                    2 + i
                                )
                                .Date
                                .AddHours(
                                    10 + (i % 4)
                                );
                    }


                    // =================================================
                    // COMPLETED
                    // =================================================

                    else if (pattern == 1)
                    {
                        status =
                            "Completed";

                        scheduledAt =
                            now
                                .AddDays(
                                    -(2 + i)
                                )
                                .Date
                                .AddHours(
                                    10 + (i % 4)
                                );
                    }


                    // =================================================
                    // RESCHEDULED
                    // =================================================

                    else if (pattern == 2)
                    {
                        status =
                            "Rescheduled";

                        scheduledAt =
                            now
                                .AddDays(
                                    4 + i
                                )
                                .Date
                                .AddHours(
                                    11 + (i % 3)
                                );
                    }


                    // =================================================
                    // CANCELLED
                    // =================================================

                    else if (pattern == 3)
                    {
                        status =
                            "Cancelled";

                        scheduledAt =
                            now
                                .AddDays(
                                    -(5 + i)
                                )
                                .Date
                                .AddHours(
                                    10 + (i % 4)
                                );
                    }


                    // =================================================
                    // NO SHOW
                    // =================================================

                    else
                    {
                        status =
                            "No Show";

                        scheduledAt =
                            now
                                .AddDays(
                                    -(8 + i)
                                )
                                .Date
                                .AddHours(
                                    10 + (i % 4)
                                );
                    }


                    // =================================================
                    // ACTIVE MEETING
                    // =================================================

                    bool activeMeeting =
                        status == "Scheduled" ||
                        status == "Rescheduled";


                    // =================================================
                    // INTERVIEW TYPE
                    // =================================================

                    string[] interviewTypes =
                    {
                        "Technical",
                        "HR",
                        "Managerial",
                        "Behavioral",
                        "Final"
                    };


                    var interviewType =
                        interviewTypes[
                            i % interviewTypes.Length
                        ];


                    // =================================================
                    // CREATE INTERVIEW
                    // =================================================

                    var interview =
                        new Interview
                        {
                            ApplicationId =
                                application.Id,

                            RecruiterId =
                                job.RecruiterId,

                            InterviewType =
                                interviewType,

                            ScheduledAt =
                                scheduledAt,

                            DurationMinutes =
                                i % 2 == 0
                                    ? 60
                                    : 45,

                            MeetingLink =
                                activeMeeting
                                    ? $"https://meet.smarthire.com/interview/{application.Id}/{i + 1}"
                                    : string.Empty,

                            Location =
                                activeMeeting
                                    ? string.Empty
                                    : "SmartHire Office, Bengaluru",

                            InterviewerName =
                                definition.FullName,

                            InterviewerEmail =
                                definition.Email,

                            Status =
                                status,

                            Notes =
                                GetInterviewNotes(
                                    status
                                ),

                            CreatedAt =
                                now.AddDays(
                                    -20
                                ),

                            UpdatedAt =
                                now
                        };


                    interviews.Add(
                        interview
                    );
                }
            }


            // =========================================================
            // 9. SAVE INTERVIEWS
            // =========================================================

            context.Interviews.AddRange(
                interviews
            );


            await context.SaveChangesAsync();


            // =========================================================
            // 10. FINAL SUMMARY
            // =========================================================

            Console.WriteLine();
            Console.WriteLine(
                "=================================================="
            );
            Console.WriteLine(
                "INTERVIEWER TEST DATA CREATED"
            );
            Console.WriteLine(
                "=================================================="
            );


            foreach (
                var definition
                in interviewerDefinitions)
            {
                Console.WriteLine(
                    $"{definition.FullName} | " +
                    $"{definition.Email} | " +
                    $"Interviews: {definition.InterviewCount}"
                );
            }


            Console.WriteLine();
            Console.WriteLine(
                $"Total interviews created: {interviews.Count}"
            );


            Console.WriteLine();
            Console.WriteLine(
                "Interviewer test data seeding completed."
            );
        }


        // =========================================================
        // INTERVIEW NOTES
        // =========================================================

        private static string GetInterviewNotes(
            string status)
        {
            return status switch
            {
                "Scheduled" =>
                    "Interview scheduled with the candidate.",

                "Rescheduled" =>
                    "Interview rescheduled to a new time.",

                "Completed" =>
                    "Interview completed. Candidate evaluation can be recorded.",

                "Cancelled" =>
                    "Interview cancelled due to scheduling conflict.",

                "No Show" =>
                    "Candidate did not attend the scheduled interview.",

                _ =>
                    "Interview details."
            };
        }
    }
}