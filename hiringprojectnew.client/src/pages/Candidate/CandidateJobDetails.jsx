import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

const CandidateJobDetails = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // LOAD JOB
    // =====================================================

    useEffect(() => {
        loadJob();
    }, [id]);


    const loadJob = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            const storedUser =
                localStorage.getItem(
                    "smartHireUser"
                );

            const user = storedUser
                ? JSON.parse(storedUser)
                : null;


            if (!token || !user) {
                navigate("/login");
                return;
            }


            if (user.role !== "Candidate") {
                navigate("/login");
                return;
            }


            const response =
                await api.get(
                    `/CandidateJob/${id}`
                );

            setJob(response.data);

        }
        catch (err) {

            console.error(
                "Load job details error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load job details."
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =====================================================
    // FORMAT SALARY
    // =====================================================

    const formatSalary = (
        minimumSalary,
        maximumSalary
    ) => {

        if (
            minimumSalary == null &&
            maximumSalary == null
        ) {
            return "Salary not disclosed";
        }


        const formatAmount = (amount) => {

            if (amount >= 10000000) {

                return (
                    "₹" +
                    (amount / 10000000)
                        .toFixed(1)
                        .replace(".0", "") +
                    " Cr"
                );
            }


            if (amount >= 100000) {

                return (
                    "₹" +
                    (amount / 100000)
                        .toFixed(1)
                        .replace(".0", "") +
                    " L"
                );
            }


            return (
                "₹" +
                Number(amount)
                    .toLocaleString("en-IN")
            );
        };


        if (
            minimumSalary != null &&
            maximumSalary != null
        ) {

            return `${formatAmount(
                minimumSalary
            )} - ${formatAmount(
                maximumSalary
            )}`;
        }


        if (minimumSalary != null) {

            return `From ${formatAmount(
                minimumSalary
            )}`;
        }


        return `Up to ${formatAmount(
            maximumSalary
        )}`;
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "Not specified";
        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Not specified";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =====================================================
    // CHECK DEADLINE
    // =====================================================

    const isDeadlinePassed = () => {

        if (!job?.applicationDeadline) {
            return false;
        }


        return (
            new Date(
                job.applicationDeadline
            ).getTime() <
            new Date().getTime()
        );
    };


    // =====================================================
    // GET SKILLS
    // =====================================================

    const getSkills = () => {

        if (!job?.requiredSkills) {
            return [];
        }


        return job.requiredSkills
            .split(/[;,]/)
            .map((skill) =>
                skill.trim()
            )
            .filter(Boolean);
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <CandidateLayout
                activePage="jobs"
            >

                <div
                    style={{
                        minHeight: "500px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        color: "#687995",
                    }}
                >

                    <div
                        style={{
                            width: "38px",
                            height: "38px",
                            border:
                                "3px solid #DCE7F8",
                            borderTop:
                                "3px solid #2D6EE8",
                            borderRadius: "50%",
                            marginBottom: "14px",
                        }}
                    />

                    <p
                        style={{
                            margin: 0,
                            fontSize: "14px",
                        }}
                    >
                        Loading job details...
                    </p>

                </div>

            </CandidateLayout>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !job) {

        return (
            <CandidateLayout
                activePage="jobs"
            >

                <div
                    style={{
                        maxWidth: "900px",
                        margin: "40px auto",
                        background: "#FFFFFF",
                        border:
                            "1px solid #E4E9F1",
                        borderRadius: "12px",
                        padding: "50px",
                        textAlign: "center",
                    }}
                >

                    <div
                        style={{
                            width: "58px",
                            height: "58px",
                            margin:
                                "0 auto 16px",
                            borderRadius: "50%",
                            background: "#FDECEC",
                            color: "#C03939",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            fontWeight: "700",
                        }}
                    >
                        !
                    </div>


                    <h2
                        style={{
                            margin:
                                "0 0 8px",
                            color: "#10254A",
                            fontSize: "20px",
                        }}
                    >
                        Job Not Available
                    </h2>


                    <p
                        style={{
                            margin:
                                "0 0 20px",
                            color: "#8290A8",
                            fontSize: "13px",
                        }}
                    >
                        {error ||
                            "This job could not be found or is no longer available."}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/candidate/jobs"
                            )
                        }
                        style={{
                            border: "none",
                            background: "#2D6EE8",
                            color: "#FFFFFF",
                            borderRadius: "7px",
                            padding:
                                "10px 18px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        ← Back to Jobs
                    </button>

                </div>

            </CandidateLayout>
        );
    }


    const skills = getSkills();

    const deadlinePassed =
        isDeadlinePassed();


    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <CandidateLayout
            activePage="jobs"
        >

            <div
                style={{
                    maxWidth: "1120px",
                    margin: "0 auto",
                }}
            >

                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        navigate("/candidate/jobs")
                    }
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",

                        height: "36px",

                        padding: "0 13px",

                        marginBottom: "18px",

                        border:
                            "1px solid #DCE5F2",

                        borderRadius: "7px",

                        background: "#FFFFFF",

                        color: "#52627A",

                        fontSize: "11px",

                        fontWeight: "600",

                        cursor: "pointer",

                        boxShadow:
                            "0 2px 6px rgba(15,23,42,0.03)",

                        transition:
                            "all 0.2s ease",
                    }}
                >

                    <span
                        style={{
                            fontSize: "15px",
                            lineHeight: 1,
                            color: "#2D6EE8",
                        }}
                    >
                        ←
                    </span>

                    <span>
                        Back to Find Jobs
                    </span>

                </button>


                {/* =================================================
                    JOB HEADER
                ================================================= */}

                <div
                    style={{
                        background: "#FFFFFF",
                        border:
                            "1px solid #E4E9F1",
                        borderRadius: "12px",
                        padding: "26px",
                        marginBottom: "18px",
                        boxShadow:
                            "0 3px 12px rgba(15,23,42,0.03)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "flex-start",
                            justifyContent:
                                "space-between",
                            gap: "20px",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "flex-start",
                                gap: "16px",
                                flex: 1,
                            }}
                        >

                            {/* LOGO */}

                            <div
                                style={{
                                    width: "62px",
                                    height: "62px",
                                    minWidth: "62px",
                                    borderRadius:
                                        "12px",
                                    background:
                                        "linear-gradient(135deg, #2D6EE8, #4B88F4)",
                                    color: "#FFFFFF",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "17px",
                                    fontWeight: "800",
                                    boxShadow:
                                        "0 7px 18px rgba(45,110,232,0.20)",
                                }}
                            >
                                SH
                            </div>


                            {/* TITLE */}

                            <div>

                                <span
                                    style={{
                                        display:
                                            "block",
                                        color: "#2766D9",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        letterSpacing:
                                            "0.9px",
                                        marginBottom:
                                            "7px",
                                    }}
                                >
                                    JOB OPPORTUNITY
                                </span>


                                <h1
                                    style={{
                                        margin:
                                            "0 0 7px",
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "27px",
                                        fontWeight:
                                            "700",
                                        lineHeight:
                                            "1.25",
                                    }}
                                >
                                    {job.title}
                                </h1>


                                <p
                                    style={{
                                        margin: 0,
                                        color:
                                            "#687995",
                                        fontSize:
                                            "13px",
                                    }}
                                >
                                    {job.departmentName}
                                    {" • "}
                                    {job.jobCategoryName}
                                </p>

                            </div>

                        </div>


                        {/* JOB STATUS */}

                        <div
                            style={{
                                background:
                                    deadlinePassed
                                        ? "#FDECEC"
                                        : "#ECFDF3",
                                color:
                                    deadlinePassed
                                        ? "#C03939"
                                        : "#16845A",
                                border:
                                    deadlinePassed
                                        ? "1px solid #F5CACA"
                                        : "1px solid #B7E4C7",
                                borderRadius:
                                    "20px",
                                padding:
                                    "7px 12px",
                                fontSize: "10px",
                                fontWeight: "700",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            {deadlinePassed
                                ? "Application Closed"
                                : "Open for Applications"}
                        </div>

                    </div>


                    {/* META INFORMATION */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, 1fr)",
                            gap: "14px",
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop:
                                "1px solid #F0F3F7",
                        }}
                    >

                        <div>

                            <span
                                style={{
                                    display: "block",
                                    color: "#8290A8",
                                    fontSize: "9px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                LOCATION
                            </span>

                            <strong
                                style={{
                                    color: "#52627A",
                                    fontSize: "12px",
                                }}
                            >
                                📍 {job.location}
                            </strong>

                        </div>


                        <div>

                            <span
                                style={{
                                    display: "block",
                                    color: "#8290A8",
                                    fontSize: "9px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                EMPLOYMENT
                            </span>

                            <strong
                                style={{
                                    color: "#52627A",
                                    fontSize: "12px",
                                }}
                            >
                                💼 {job.employmentType}
                            </strong>

                        </div>


                        <div>

                            <span
                                style={{
                                    display: "block",
                                    color: "#8290A8",
                                    fontSize: "9px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                EXPERIENCE
                            </span>

                            <strong
                                style={{
                                    color: "#52627A",
                                    fontSize: "12px",
                                }}
                            >
                                {job.experienceLevel ||
                                    "Not specified"}
                            </strong>

                        </div>


                        <div>

                            <span
                                style={{
                                    display: "block",
                                    color: "#8290A8",
                                    fontSize: "9px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                SALARY
                            </span>

                            <strong
                                style={{
                                    color: "#16845A",
                                    fontSize: "12px",
                                }}
                            >
                                {formatSalary(
                                    job.minimumSalary,
                                    job.maximumSalary
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(0, 1fr) 310px",
                        gap: "18px",
                        alignItems: "start",
                    }}
                >

                    {/* =================================================
                        LEFT CONTENT
                    ================================================= */}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                        }}
                    >

                        {/* JOB DESCRIPTION */}

                        <section
                            style={{
                                background: "#FFFFFF",
                                border:
                                    "1px solid #E4E9F1",
                                borderRadius: "11px",
                                padding: "24px",
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    color: "#2766D9",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    letterSpacing:
                                        "0.8px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                ABOUT THE ROLE
                            </span>


                            <h2
                                style={{
                                    margin:
                                        "0 0 14px",
                                    color: "#10254A",
                                    fontSize: "19px",
                                    fontWeight: "700",
                                }}
                            >
                                Job Description
                            </h2>


                            <p
                                style={{
                                    margin: 0,
                                    color: "#52627A",
                                    fontSize: "13px",
                                    lineHeight:
                                        "1.75",
                                    whiteSpace:
                                        "pre-line",
                                }}
                            >
                                {job.description ||
                                    "No job description provided."}
                            </p>

                        </section>


                        {/* RESPONSIBILITIES */}

                        <section
                            style={{
                                background: "#FFFFFF",
                                border:
                                    "1px solid #E4E9F1",
                                borderRadius: "11px",
                                padding: "24px",
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    color: "#2766D9",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    letterSpacing:
                                        "0.8px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                WHAT YOU'LL DO
                            </span>


                            <h2
                                style={{
                                    margin:
                                        "0 0 14px",
                                    color: "#10254A",
                                    fontSize: "19px",
                                    fontWeight: "700",
                                }}
                            >
                                Responsibilities
                            </h2>


                            <div
                                style={{
                                    color: "#52627A",
                                    fontSize: "13px",
                                    lineHeight:
                                        "1.75",
                                    whiteSpace:
                                        "pre-line",
                                }}
                            >
                                {job.responsibilities ||
                                    "No responsibilities specified."}
                            </div>

                        </section>


                        {/* REQUIREMENTS */}

                        <section
                            style={{
                                background: "#FFFFFF",
                                border:
                                    "1px solid #E4E9F1",
                                borderRadius: "11px",
                                padding: "24px",
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    color: "#2766D9",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    letterSpacing:
                                        "0.8px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                WHAT WE'RE LOOKING FOR
                            </span>


                            <h2
                                style={{
                                    margin:
                                        "0 0 14px",
                                    color: "#10254A",
                                    fontSize: "19px",
                                    fontWeight: "700",
                                }}
                            >
                                Requirements
                            </h2>


                            <div
                                style={{
                                    color: "#52627A",
                                    fontSize: "13px",
                                    lineHeight:
                                        "1.75",
                                    whiteSpace:
                                        "pre-line",
                                }}
                            >
                                {job.requirements ||
                                    "No specific requirements provided."}
                            </div>

                        </section>


                        {/* SKILLS */}

                        <section
                            style={{
                                background: "#FFFFFF",
                                border:
                                    "1px solid #E4E9F1",
                                borderRadius: "11px",
                                padding: "24px",
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    color: "#2766D9",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    letterSpacing:
                                        "0.8px",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                SKILLS
                            </span>


                            <h2
                                style={{
                                    margin:
                                        "0 0 15px",
                                    color: "#10254A",
                                    fontSize: "19px",
                                    fontWeight: "700",
                                }}
                            >
                                Required Skills
                            </h2>


                            {skills.length > 0 ? (

                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap:
                                            "wrap",
                                        gap: "8px",
                                    }}
                                >

                                    {skills.map(
                                        (
                                            skill,
                                            index
                                        ) => (

                                            <span
                                                key={`${skill}-${index}`}
                                                style={{
                                                    background:
                                                        "#EEF4FF",
                                                    color:
                                                        "#2766D9",
                                                    border:
                                                        "1px solid #D4E2FA",
                                                    borderRadius:
                                                        "20px",
                                                    padding:
                                                        "7px 12px",
                                                    fontSize:
                                                        "11px",
                                                    fontWeight:
                                                        "600",
                                                }}
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p
                                    style={{
                                        margin: 0,
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    No specific skills listed.
                                </p>

                            )}

                        </section>

                    </div>


                    {/* =================================================
                        RIGHT APPLICATION CARD
                    ================================================= */}

                    <div
                        style={{
                            position: "sticky",
                            top: "94px",
                        }}
                    >

                        <div
                            style={{
                                background: "#FFFFFF",
                                border:
                                    "1px solid #E4E9F1",
                                borderRadius: "11px",
                                padding: "21px",
                                boxShadow:
                                    "0 3px 12px rgba(15,23,42,0.04)",
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    color: "#2766D9",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    letterSpacing:
                                        "0.8px",
                                    marginBottom:
                                        "7px",
                                }}
                            >
                                JOB INFORMATION
                            </span>


                            <h3
                                style={{
                                    margin:
                                        "0 0 18px",
                                    color: "#10254A",
                                    fontSize: "17px",
                                    fontWeight: "700",
                                }}
                            >
                                Position Details
                            </h3>


                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    gap: "14px",
                                }}
                            >

                                <div>

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#8290A8",
                                            fontSize:
                                                "9px",
                                            marginBottom:
                                                "4px",
                                        }}
                                    >
                                        DEPARTMENT
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                "#52627A",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {
                                            job.departmentName
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#8290A8",
                                            fontSize:
                                                "9px",
                                            marginBottom:
                                                "4px",
                                        }}
                                    >
                                        CATEGORY
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                "#52627A",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {
                                            job.jobCategoryName
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#8290A8",
                                            fontSize:
                                                "9px",
                                            marginBottom:
                                                "4px",
                                        }}
                                    >
                                        APPLICATION DEADLINE
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                deadlinePassed
                                                    ? "#C03939"
                                                    : "#52627A",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {formatDate(
                                            job.applicationDeadline
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#8290A8",
                                            fontSize:
                                                "9px",
                                            marginBottom:
                                                "4px",
                                        }}
                                    >
                                        POSTED
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                "#52627A",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {formatDate(
                                            job.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div
                                style={{
                                    height: "1px",
                                    background:
                                        "#F0F3F7",
                                    margin:
                                        "20px 0",
                                }}
                            />


                            <h4
                                style={{
                                    margin:
                                        "0 0 6px",
                                    color:
                                        "#243A5E",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                Interested in this role?
                            </h4>


                            <p
                                style={{
                                    margin:
                                        "0 0 15px",
                                    color:
                                        "#8290A8",
                                    fontSize:
                                        "11px",
                                    lineHeight:
                                        "1.55",
                                }}
                            >
                                Submit your application
                                and take the next step
                                in your career.
                            </p>


                            <button
                                type="button"
                                disabled={
                                    deadlinePassed
                                }
                                onClick={() =>
                                    navigate(
                                        `/candidate/jobs/${id}/apply`
                                    )
                                }
                                style={{
                                    width: "100%",
                                    height: "42px",
                                    border: "none",
                                    borderRadius: "7px",
                                    background:
                                        deadlinePassed
                                            ? "#B7C1CF"
                                            : "#2D6EE8",
                                    color: "#FFFFFF",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor:
                                        deadlinePassed
                                            ? "not-allowed"
                                            : "pointer",
                                    boxShadow:
                                        deadlinePassed
                                            ? "none"
                                            : "0 6px 15px rgba(45,110,232,0.22)",
                                }}
                            >
                                {deadlinePassed
                                    ? "Applications Closed"
                                    : "Apply for this Job"}
                            </button>


                            {!deadlinePassed && (

                                <p
                                    style={{
                                        margin:
                                            "10px 0 0",
                                        textAlign:
                                            "center",
                                        color:
                                            "#94A3B8",
                                        fontSize:
                                            "9px",
                                    }}
                                >
                                    Application takes
                                    less than a minute
                                </p>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </CandidateLayout>
    );
};

export default CandidateJobDetails;