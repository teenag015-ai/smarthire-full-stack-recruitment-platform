import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

const CandidateApply = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    const [job, setJob] = useState(null);

    const [coverLetter, setCoverLetter] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


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
                "Load job error:",
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
    // SUBMIT APPLICATION
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        setError("");

        setSuccess("");


        if (!job) {

            setError(
                "Job details are not available."
            );

            return;
        }


        try {

            setSubmitting(true);


            await api.post(
                "/CandidateApplication",
                {
                    jobId: Number(id),

                    coverLetter:
                        coverLetter.trim() ||
                        null,
                }
            );


            setSuccess(
                "Your application has been submitted successfully."
            );


            setCoverLetter("");

        }
        catch (err) {

            console.error(
                "Application submission error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to submit your application."
            );

        }
        finally {

            setSubmitting(false);

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

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        flexDirection:
                            "column",

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

                            borderRadius:
                                "50%",

                            marginBottom:
                                "14px",
                        }}
                    />

                    <p
                        style={{
                            margin: 0,

                            fontSize: "14px",
                        }}
                    >
                        Loading application page...
                    </p>

                </div>

            </CandidateLayout>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (
        <CandidateLayout
            activePage="jobs"
        >

            <div
                style={{
                    maxWidth: "1050px",

                    margin: "0 auto",
                }}
            >

                {/* =================================================
                    BACK TO JOB DETAILS
                ================================================= */}

                <button
                    type="button"

                    onClick={() =>
                        navigate(
                            `/candidate/jobs/${id}`
                        )
                    }

                    disabled={submitting}

                    style={{
                        display: "inline-flex",

                        alignItems:
                            "center",

                        gap: "8px",

                        height: "36px",

                        padding: "0 13px",

                        marginBottom:
                            "20px",

                        border:
                            "1px solid #DCE5F2",

                        borderRadius: "7px",

                        background: "#FFFFFF",

                        color: "#52627A",

                        fontSize: "11px",

                        fontWeight: "600",

                        cursor:
                            submitting
                                ? "not-allowed"
                                : "pointer",

                        boxShadow:
                            "0 2px 6px rgba(15,23,42,0.03)",

                        transition:
                            "all 0.2s ease",

                        opacity:
                            submitting
                                ? 0.6
                                : 1,
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
                        Back to Job Details
                    </span>

                </button>


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    style={{
                        marginBottom:
                            "24px",
                    }}
                >

                    <span
                        style={{
                            display: "block",

                            color: "#2766D9",

                            fontSize: "11px",

                            fontWeight: "700",

                            letterSpacing:
                                "0.9px",

                            marginBottom:
                                "7px",
                        }}
                    >
                        JOB APPLICATION
                    </span>


                    <h2
                        style={{
                            margin: 0,

                            color: "#10254A",

                            fontSize: "28px",

                            fontWeight: "700",
                        }}
                    >
                        Apply for this Position
                    </h2>


                    <p
                        style={{
                            margin:
                                "8px 0 0",

                            color: "#687995",

                            fontSize: "14px",
                        }}
                    >
                        Complete your application
                        and submit your profile
                        to the recruiter.
                    </p>

                </div>


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {success && (

                    <div
                        style={{
                            marginBottom:
                                "18px",

                            padding:
                                "14px 16px",

                            background:
                                "#ECFDF3",

                            border:
                                "1px solid #B7E4C7",

                            borderRadius:
                                "8px",

                            color:
                                "#16845A",

                            fontSize:
                                "13px",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "space-between",

                            gap: "15px",
                        }}
                    >

                        <span>
                            ✓ {success}
                        </span>


                        <button
                            type="button"

                            onClick={() =>
                                navigate(
                                    "/candidate/applications"
                                )
                            }

                            style={{
                                border: "none",

                                background:
                                    "#16845A",

                                color:
                                    "#FFFFFF",

                                borderRadius:
                                    "6px",

                                padding:
                                    "8px 12px",

                                fontSize:
                                    "11px",

                                fontWeight:
                                    "600",

                                cursor:
                                    "pointer",
                            }}
                        >
                            My Applications
                        </button>

                    </div>

                )}


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (

                    <div
                        style={{
                            marginBottom:
                                "18px",

                            padding:
                                "13px 16px",

                            background:
                                "#FDECEC",

                            border:
                                "1px solid #F5CACA",

                            borderRadius:
                                "8px",

                            color:
                                "#C03939",

                            fontSize:
                                "12px",
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    JOB SUMMARY CARD
                ================================================= */}

                {job && (

                    <div
                        style={{
                            background:
                                "#FFFFFF",

                            border:
                                "1px solid #E4E9F1",

                            borderRadius:
                                "11px",

                            padding:
                                "22px",

                            marginBottom:
                                "20px",

                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "flex-start",

                                gap: "15px",
                            }}
                        >

                            {/* LOGO */}

                            <div
                                style={{
                                    width:
                                        "48px",

                                    height:
                                        "48px",

                                    minWidth:
                                        "48px",

                                    borderRadius:
                                        "10px",

                                    background:
                                        "linear-gradient(135deg, #2D6EE8, #4B88F4)",

                                    color:
                                        "#FFFFFF",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    fontSize:
                                        "14px",

                                    fontWeight:
                                        "800",
                                }}
                            >
                                SH
                            </div>


                            {/* JOB TITLE */}

                            <div
                                style={{
                                    flex: 1,
                                }}
                            >

                                <h3
                                    style={{
                                        margin:
                                            "0 0 6px",

                                        color:
                                            "#243A5E",

                                        fontSize:
                                            "19px",

                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {job.title}
                                </h3>


                                <p
                                    style={{
                                        margin: 0,

                                        color:
                                            "#8290A8",

                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    {job.departmentName}
                                    {" • "}
                                    {job.jobCategoryName}
                                </p>

                            </div>

                        </div>


                        {/* JOB META */}

                        <div
                            style={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                    "repeat(4, 1fr)",

                                gap: "12px",

                                marginTop:
                                    "20px",

                                paddingTop:
                                    "18px",

                                borderTop:
                                    "1px solid #F0F3F7",
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
                                            "10px",

                                        marginBottom:
                                            "5px",
                                    }}
                                >
                                    Location
                                </span>


                                <strong
                                    style={{
                                        color:
                                            "#52627A",

                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    {job.location}
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
                                            "10px",

                                        marginBottom:
                                            "5px",
                                    }}
                                >
                                    Employment
                                </span>


                                <strong
                                    style={{
                                        color:
                                            "#52627A",

                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    {job.employmentType}
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
                                            "10px",

                                        marginBottom:
                                            "5px",
                                    }}
                                >
                                    Experience
                                </span>


                                <strong
                                    style={{
                                        color:
                                            "#52627A",

                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    {job.experienceLevel}
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
                                            "10px",

                                        marginBottom:
                                            "5px",
                                    }}
                                >
                                    Salary
                                </span>


                                <strong
                                    style={{
                                        color:
                                            "#16845A",

                                        fontSize:
                                            "12px",
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

                )}


                {/* =================================================
                    APPLICATION FORM
                ================================================= */}

                <form
                    onSubmit={
                        handleSubmit
                    }

                    style={{
                        background:
                            "#FFFFFF",

                        border:
                            "1px solid #E4E9F1",

                        borderRadius:
                            "11px",

                        padding:
                            "24px",

                        boxShadow:
                            "0 3px 12px rgba(15,23,42,0.03)",
                    }}
                >

                    {/* FORM HEADER */}

                    <div
                        style={{
                            marginBottom:
                                "20px",
                        }}
                    >

                        <span
                            style={{
                                display:
                                    "block",

                                color:
                                    "#2766D9",

                                fontSize:
                                    "11px",

                                fontWeight:
                                    "700",

                                letterSpacing:
                                    "0.8px",

                                marginBottom:
                                    "6px",
                            }}
                        >
                            APPLICATION DETAILS
                        </span>


                        <h3
                            style={{
                                margin: 0,

                                color:
                                    "#10254A",

                                fontSize:
                                    "19px",

                                fontWeight:
                                    "700",
                            }}
                        >
                            Cover Letter
                        </h3>


                        <p
                            style={{
                                margin:
                                    "6px 0 0",

                                color:
                                    "#8290A8",

                                fontSize:
                                    "12px",
                            }}
                        >
                            Tell the recruiter why
                            you are interested in
                            this position.
                        </p>

                    </div>


                    {/* COVER LETTER */}

                    <div>

                        <label
                            htmlFor="coverLetter"

                            style={{
                                display:
                                    "block",

                                marginBottom:
                                    "8px",

                                color:
                                    "#52627A",

                                fontSize:
                                    "12px",

                                fontWeight:
                                    "600",
                            }}
                        >
                            Cover Letter

                            <span
                                style={{
                                    color:
                                        "#94A3B8",

                                    fontWeight:
                                        "400",

                                    marginLeft:
                                        "5px",
                                }}
                            >
                                (Optional)
                            </span>

                        </label>


                        <textarea
                            id="coverLetter"

                            value={
                                coverLetter
                            }

                            onChange={(
                                event
                            ) =>
                                setCoverLetter(
                                    event.target
                                        .value
                                )
                            }

                            maxLength={1000}

                            rows={8}

                            placeholder="Write a short cover letter explaining your interest, relevant skills, and why you would be a good fit for this role..."

                            style={{
                                width:
                                    "100%",

                                boxSizing:
                                    "border-box",

                                border:
                                    "1px solid #DCE3ED",

                                borderRadius:
                                    "8px",

                                padding:
                                    "12px 13px",

                                resize:
                                    "vertical",

                                outline:
                                    "none",

                                color:
                                    "#243A5E",

                                fontSize:
                                    "13px",

                                lineHeight:
                                    "1.6",

                                fontFamily:
                                    "inherit",
                            }}
                        />


                        <div
                            style={{
                                display:
                                    "flex",

                                justifyContent:
                                    "flex-end",

                                marginTop:
                                    "6px",

                                color:
                                    "#94A3B8",

                                fontSize:
                                    "10px",
                            }}
                        >
                            {
                                coverLetter.length
                            } / 1000
                        </div>

                    </div>


                    {/* =================================================
                        FORM ACTIONS
                    ================================================= */}

                    <div
                        style={{
                            marginTop:
                                "22px",

                            paddingTop:
                                "18px",

                            borderTop:
                                "1px solid #F0F3F7",

                            display:
                                "flex",

                            justifyContent:
                                "flex-end",

                            gap: "10px",
                        }}
                    >

                        {/* CANCEL */}

                        <button
                            type="button"

                            onClick={() =>
                                navigate(
                                    `/candidate/jobs/${id}`
                                )
                            }

                            disabled={
                                submitting
                            }

                            style={{
                                height:
                                    "40px",

                                padding:
                                    "0 17px",

                                border:
                                    "1px solid #DCE3ED",

                                borderRadius:
                                    "7px",

                                background:
                                    "#FFFFFF",

                                color:
                                    "#52627A",

                                fontSize:
                                    "12px",

                                fontWeight:
                                    "600",

                                cursor:
                                    submitting
                                        ? "not-allowed"
                                        : "pointer",

                                opacity:
                                    submitting
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            Cancel
                        </button>


                        {/* SUBMIT */}

                        <button
                            type="submit"

                            disabled={
                                submitting ||
                                !!success
                            }

                            style={{
                                height:
                                    "40px",

                                padding:
                                    "0 20px",

                                border:
                                    "none",

                                borderRadius:
                                    "7px",

                                background:
                                    submitting ||
                                        success
                                        ? "#94B5F0"
                                        : "#2D6EE8",

                                color:
                                    "#FFFFFF",

                                fontSize:
                                    "12px",

                                fontWeight:
                                    "600",

                                cursor:
                                    submitting ||
                                        success
                                        ? "not-allowed"
                                        : "pointer",

                                boxShadow:
                                    submitting ||
                                        success
                                        ? "none"
                                        : "0 5px 12px rgba(45,110,232,0.18)",
                            }}
                        >
                            {submitting
                                ? "Submitting..."
                                : success
                                    ? "Application Submitted"
                                    : "Submit Application"}
                        </button>

                    </div>

                </form>

            </div>

        </CandidateLayout>
    );
};

export default CandidateApply;