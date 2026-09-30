using HiringProjectNew.Server.Data;
using HiringProjectNew.Server.Helpers;
using HiringProjectNew.Server.Interfaces;
using HiringProjectNew.Server.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =========================================================
// CONTROLLERS
// =========================================================

builder.Services.AddControllers();


// =========================================================
// AUTHENTICATION & SERVICES
// =========================================================

// Authentication
builder.Services.AddScoped<IAuthService, AuthService>();

// Admin
builder.Services.AddScoped<IAdminService, AdminService>();


// =========================================================
// RECRUITER SERVICES
// =========================================================

builder.Services.AddScoped<
    IRecruiterJobService,
    RecruiterJobService>();

builder.Services.AddScoped<
    IRecruiterApplicantService,
    RecruiterApplicantService>();

builder.Services.AddScoped<
    IRecruiterAssessmentService,
    RecruiterAssessmentService>();

builder.Services.AddScoped<
    IRecruiterAssessmentQuestionService,
    RecruiterAssessmentQuestionService>();

builder.Services.AddScoped<
    IRecruiterInterviewService,
    RecruiterInterviewService>();

builder.Services.AddScoped<
    IRecruiterOfferService,
    RecruiterOfferService>();

builder.Services.AddScoped<
    IRecruiterAnalyticsService,
    RecruiterAnalyticsService>();


// =========================================================
// CANDIDATE SERVICES
// =========================================================

builder.Services.AddScoped<
    ICandidateApplicationService,
    CandidateApplicationService>();

builder.Services.AddScoped<
    ICandidateProfileService,
    CandidateProfileService>();

builder.Services.AddScoped<
    ICandidateInterviewService,
    CandidateInterviewService>();

builder.Services.AddScoped<
    ICandidateAssessmentService,
    CandidateAssessmentService>();

builder.Services.AddScoped<
    ICandidateOfferService,
    CandidateOfferService>();


// =========================================================
// INTERVIEWER SERVICES
// =========================================================

builder.Services.AddScoped<
    IInterviewerService,
    InterviewerService>();

builder.Services.AddScoped<
    IInterviewerEvaluationService,
    InterviewerEvaluationService>();


// =========================================================
// DATABASE
// =========================================================

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString(
                "DefaultConnection"
            )
        )
);


// =========================================================
// JWT AUTHENTICATION
// =========================================================

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]!
                        )
                    )
            };
    });

builder.Services.AddAuthorization();


// =========================================================
// CORS
// =========================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// =========================================================
// SWAGGER
// =========================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "SmartHire API",
            Version = "v1",
            Description =
                "Recruitment & Applicant Tracking System API"
        }
    );

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter your JWT token as: Bearer {your token}"
        }
    );

    options.AddSecurityRequirement(
        document =>
            new OpenApiSecurityRequirement
            {
                [
                    new OpenApiSecuritySchemeReference(
                        "Bearer",
                        document
                    )
                ] = []
            }
    );
});


// =========================================================
// BUILD APPLICATION
// =========================================================

var app = builder.Build();


// =========================================================
// ADMIN SEEDER
// =========================================================

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var context =
        services.GetRequiredService<ApplicationDbContext>();

    await AdminSeeder.SeedAdminAsync(context);
}


// =========================================================
// DEVELOPMENT TEST DATA SEEDERS
// =========================================================

if (app.Environment.IsDevelopment())
{
    // ---------------------------------------------------------
    // ANANYA RECRUITER
    // ---------------------------------------------------------

    using (var ananyaSeedScope =
           app.Services.CreateScope())
    {
        var ananyaSeedContext =
            ananyaSeedScope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

        await AnanyaTestDataSeeder
            .ResetAndSeedAsync(ananyaSeedContext);
    }


    // ---------------------------------------------------------
    // NIKHIL RECRUITER
    // ---------------------------------------------------------

    using (var nikhilSeedScope =
           app.Services.CreateScope())
    {
        var nikhilSeedContext =
            nikhilSeedScope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

        await NikhilTestDataSeeder
            .ResetAndSeedAsync(nikhilSeedContext);
    }


    // ---------------------------------------------------------
    // MEERA RECRUITER
    // ---------------------------------------------------------

    using (var meeraSeedScope =
           app.Services.CreateScope())
    {
        var meeraSeedContext =
            meeraSeedScope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

        await MeeraTestDataSeeder
            .ResetAndSeedAsync(meeraSeedContext);
    }


    // ---------------------------------------------------------
    // CANDIDATE TEST DATA
    // ---------------------------------------------------------

    using (var candidateSeedScope =
           app.Services.CreateScope())
    {
        var candidateSeedContext =
            candidateSeedScope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

        await CandidateTestDataSeeder
            .ResetAndSeedAsync(candidateSeedContext);
    }


    // ---------------------------------------------------------
    // INTERVIEWER TEST DATA
    // ---------------------------------------------------------

    using (var interviewerSeedScope =
           app.Services.CreateScope())
    {
        var interviewerSeedContext =
            interviewerSeedScope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

        await InterviewerTestDataSeeder
            .SeedAsync(interviewerSeedContext);
    }
}


// =========================================================
// SWAGGER MIDDLEWARE
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "SmartHire API v1"
        );

        options.RoutePrefix = "swagger";
    });
}


// =========================================================
// HTTP PIPELINE
// =========================================================

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowReact");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();