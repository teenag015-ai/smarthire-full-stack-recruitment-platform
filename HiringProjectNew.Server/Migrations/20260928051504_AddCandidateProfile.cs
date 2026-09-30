using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiringProjectNew.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CandidateProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ProfessionalHeadline = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    About = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Skills = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Education = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Experience = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ResumeFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ResumeFilePath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ProfileCompletionPercentage = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateProfiles", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CandidateProfiles");
        }
    }
}
