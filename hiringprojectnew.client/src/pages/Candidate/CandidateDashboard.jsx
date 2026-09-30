import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

const CandidateDashboard = () => {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/CandidateDashboard"
                );

                setDashboard(response.data);

            } catch (error) {
                console.error(
                    "Candidate dashboard error:",
                    error
                );

                if (
                    error.response?.data?.message
                ) {
                    setError(
                        error.response.data.message
                    );
                } else {
                    setError(
                        "Unable to load candidate dashboard."
                    );
                }

            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <CandidateLayout
                activePage="dashboard"
            >
                <div
                    style={{
                        minHeight: "400px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#687995",
                        fontSize: "14px",
                    }}
                >
                    Loading dashboard...
                </div>
            </CandidateLayout>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <CandidateLayout
                activePage="dashboard"
            >
                <div
                    style={{
                        minHeight: "400px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "500px",
                            background: "#FFFFFF",
                            border:
                                "1px solid #E2E8F0",
                            borderRadius: "12px",
                            padding: "30px",
                            textAlign: "center",
                            boxShadow:
                                "0 4px 15px rgba(15,23,42,0.04)",
                        }}
                    >
                        <h3
                            style={{
                                margin:
                                    "0 0 10px",
                                color: "#10254A",
                                fontSize: "18px",
                            }}
                        >
                            Unable to load dashboard
                        </h3>

                        <p
                            style={{
                                margin:
                                    "0 0 20px",
                                color: "#687995",
                                fontSize: "13px",
                            }}
                        >
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            style={{
                                border: "none",
                                borderRadius: "8px",
                                padding:
                                    "10px 18px",
                                background:
                                    "#2D6EE8",
                                color: "#FFFFFF",
                                cursor:
                                    "pointer",
                                fontWeight: "600",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </CandidateLayout>
        );
    }


    // =========================================================
    // DASHBOARD DATA
    // =========================================================

    const statistics =
        dashboard?.statistics || {};

    const upcomingInterviews =
        dashboard?.upcomingInterviews || [];

    const recentApplications =
        dashboard?.recentApplications || [];


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =========================================================
    // FORMAT DATE + TIME
    // =========================================================

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    // =========================================================
    // STAGE STYLE
    // =========================================================

    const getStageStyle = (stage) => {
        switch (stage) {

            case "Applied":
                return {
                    background: "#EEF4FF",
                    color: "#2766D9",
                };

            case "Screening":
                return {
                    background: "#F1F5F9",
                    color: "#475569",
                };

            case "Shortlisted":
                return {
                    background: "#EAFBF4",
                    color: "#16845A",
                };

            case "Assessment":
                return {
                    background: "#FFF4E8",
                    color: "#C96A12",
                };

            case "Interview":
                return {
                    background: "#F1EDFF",
                    color: "#7045D6",
                };

            case "Selected":
                return {
                    background: "#EAFBF4",
                    color: "#16845A",
                };

            case "Offer":
                return {
                    background: "#FFF8DD",
                    color: "#9A7200",
                };

            case "Hired":
                return {
                    background: "#E8F8F1",
                    color: "#087A52",
                };

            case "Rejected":
                return {
                    background: "#FDECEC",
                    color: "#D43D3D",
                };

            default:
                return {
                    background: "#F1F5F9",
                    color: "#475569",
                };
        }
    };


    return (
        <CandidateLayout
            activePage="dashboard"
        >

            <div
                style={{
                    width: "100%",
                }}
            >

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent:
                            "space-between",
                        marginBottom: "26px",
                    }}
                >

                    <div>

                        <span
                            style={{
                                display: "block",
                                color: "#2766D9",
                                fontSize: "11px",
                                fontWeight: "700",
                                letterSpacing:
                                    "1px",
                                marginBottom:
                                    "6px",
                            }}
                        >
                            CANDIDATE DASHBOARD
                        </span>

                        <h2
                            style={{
                                margin: 0,
                                color: "#10254A",
                                fontSize: "24px",
                                fontWeight: "700",
                            }}
                        >
                            Welcome back 👋
                        </h2>

                        <p
                            style={{
                                margin:
                                    "7px 0 0",
                                color: "#687995",
                                fontSize: "13px",
                            }}
                        >
                            Track your applications,
                            interviews, assessments
                            and offers from one place.
                        </p>

                    </div>


                    {/* FIND JOBS BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/candidate/jobs"
                            )
                        }
                        style={{
                            border: "none",
                            background:
                                "linear-gradient(135deg, #2D6EE8, #3678EF)",
                            color: "#FFFFFF",
                            borderRadius: "8px",
                            padding:
                                "11px 18px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow:
                                "0 6px 15px rgba(45,110,232,0.20)",
                        }}
                    >
                        + Find Jobs
                    </button>

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(5, minmax(0, 1fr))",
                        gap: "16px",
                        marginBottom: "22px",
                    }}
                >

                    {/* APPLICATIONS */}

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            padding: "19px",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "12px",
                            }}
                        >

                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#EEF4FF",
                                    color:
                                        "#2766D9",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "16px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ▤
                            </div>

                            <div>

                                <div
                                    style={{
                                        color:
                                            "#687995",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "600",
                                    }}
                                >
                                    Applications
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "4px",
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "25px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {
                                        statistics
                                            .totalApplications ??
                                        0
                                    }
                                </div>

                            </div>

                        </div>

                        <div
                            style={{
                                marginTop:
                                    "12px",
                                color:
                                    "#8290A8",
                                fontSize: "10px",
                            }}
                        >
                            Total submitted
                        </div>

                    </div>


                    {/* ACTIVE APPLICATIONS */}

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            padding: "19px",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "12px",
                            }}
                        >

                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#EAFBF4",
                                    color:
                                        "#16845A",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "16px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ◔
                            </div>

                            <div>

                                <div
                                    style={{
                                        color:
                                            "#687995",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "600",
                                    }}
                                >
                                    Active
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "4px",
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "25px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {
                                        statistics
                                            .activeApplications ??
                                        0
                                    }
                                </div>

                            </div>

                        </div>

                        <div
                            style={{
                                marginTop:
                                    "12px",
                                color:
                                    "#8290A8",
                                fontSize: "10px",
                            }}
                        >
                            Applications in progress
                        </div>

                    </div>


                    {/* INTERVIEWS */}

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            padding: "19px",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "12px",
                            }}
                        >

                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#F1EDFF",
                                    color:
                                        "#7045D6",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "16px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ◫
                            </div>

                            <div>

                                <div
                                    style={{
                                        color:
                                            "#687995",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "600",
                                    }}
                                >
                                    Interviews
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "4px",
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "25px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {
                                        statistics
                                            .totalInterviews ??
                                        0
                                    }
                                </div>

                            </div>

                        </div>

                        <div
                            style={{
                                marginTop:
                                    "12px",
                                color:
                                    "#8290A8",
                                fontSize: "10px",
                            }}
                        >
                            Scheduled & completed
                        </div>

                    </div>


                    {/* OFFERS */}

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            padding: "19px",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "12px",
                            }}
                        >

                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#FFF4E8",
                                    color:
                                        "#C96A12",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "16px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ▣
                            </div>

                            <div>

                                <div
                                    style={{
                                        color:
                                            "#687995",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "600",
                                    }}
                                >
                                    Offers
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "4px",
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "25px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {
                                        statistics
                                            .totalOffers ??
                                        0
                                    }
                                </div>

                            </div>

                        </div>

                        <div
                            style={{
                                marginTop:
                                    "12px",
                                color:
                                    "#8290A8",
                                fontSize: "10px",
                            }}
                        >
                            Total offers
                        </div>

                    </div>


                    {/* PENDING OFFERS */}

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            padding: "19px",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "12px",
                            }}
                        >

                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#FFF8DD",
                                    color:
                                        "#9A7200",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "16px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ◉
                            </div>

                            <div>

                                <div
                                    style={{
                                        color:
                                            "#687995",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "600",
                                    }}
                                >
                                    Pending Offers
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "4px",
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "25px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {
                                        statistics
                                            .activeOffers ??
                                        0
                                    }
                                </div>

                            </div>

                        </div>

                        <div
                            style={{
                                marginTop:
                                    "12px",
                                color:
                                    "#8290A8",
                                fontSize: "10px",
                            }}
                        >
                            Awaiting response
                        </div>

                    </div>

                </div>


                {/* =================================================
                    MAIN DASHBOARD GRID
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1.25fr 0.75fr",
                        gap: "18px",
                    }}
                >

                    {/* =================================================
                        RECENT APPLICATIONS
                    ================================================= */}

                    <section
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            overflow: "hidden",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                padding:
                                    "19px 21px",
                                borderBottom:
                                    "1px solid #E4E9F1",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                            }}
                        >

                            <div>

                                <h3
                                    style={{
                                        margin: 0,
                                        color:
                                            "#10254A",
                                        fontSize:
                                            "15px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    Recent Applications
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            "5px 0 0",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "10px",
                                    }}
                                >
                                    Your latest job
                                    applications
                                </p>

                            </div>

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
                                        "transparent",
                                    color:
                                        "#2766D9",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        "600",
                                    cursor:
                                        "pointer",
                                }}
                            >
                                View all →
                            </button>

                        </div>


                        {recentApplications.length ===
                            0 ? (

                            <div
                                style={{
                                    minHeight:
                                        "255px",
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    padding:
                                        "30px",
                                    textAlign:
                                        "center",
                                }}
                            >

                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius:
                                            "12px",
                                        background:
                                            "#EEF4FF",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        fontSize:
                                            "21px",
                                        marginBottom:
                                            "12px",
                                    }}
                                >
                                    ▤
                                </div>

                                <div
                                    style={{
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "13px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    No applications yet
                                </div>

                                <p
                                    style={{
                                        margin:
                                            "6px 0 16px",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "11px",
                                        maxWidth:
                                            "310px",
                                        lineHeight:
                                            "1.5",
                                    }}
                                >
                                    Start exploring jobs
                                    and apply for
                                    positions that match
                                    your skills.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/candidate/jobs"
                                        )
                                    }
                                    style={{
                                        border:
                                            "none",
                                        background:
                                            "#2D6EE8",
                                        color:
                                            "#FFFFFF",
                                        borderRadius:
                                            "7px",
                                        padding:
                                            "9px 17px",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "600",
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    Browse Jobs
                                </button>

                            </div>

                        ) : (

                            <div>

                                {recentApplications.map(
                                    (application) => {

                                        const stageStyle =
                                            getStageStyle(
                                                application.currentStage
                                            );

                                        return (
                                            <div
                                                key={
                                                    application.id
                                                }
                                                style={{
                                                    padding:
                                                        "17px 21px",
                                                    borderBottom:
                                                        "1px solid #F0F3F7",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "space-between",
                                                    gap:
                                                        "15px",
                                                }}
                                            >

                                                <div>

                                                    <div
                                                        style={{
                                                            color:
                                                                "#243A5E",
                                                            fontSize:
                                                                "13px",
                                                            fontWeight:
                                                                "700",
                                                        }}
                                                    >
                                                        {
                                                            application.jobTitle ||
                                                            "Job"
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "5px",
                                                            color:
                                                                "#8290A8",
                                                            fontSize:
                                                                "10px",
                                                        }}
                                                    >
                                                        {
                                                            application.location ||
                                                            "Location not available"
                                                        }

                                                        {" • "}

                                                        Applied{" "}

                                                        {
                                                            formatDate(
                                                                application.appliedAt
                                                            )
                                                        }
                                                    </div>

                                                </div>


                                                <span
                                                    style={{
                                                        ...stageStyle,
                                                        padding:
                                                            "5px 9px",
                                                        borderRadius:
                                                            "20px",
                                                        fontSize:
                                                            "9px",
                                                        fontWeight:
                                                            "700",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {
                                                        application.currentStage
                                                    }
                                                </span>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        UPCOMING INTERVIEWS
                    ================================================= */}

                    <section
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            overflow: "hidden",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                padding:
                                    "19px 21px",
                                borderBottom:
                                    "1px solid #E4E9F1",
                            }}
                        >

                            <h3
                                style={{
                                    margin: 0,
                                    color:
                                        "#10254A",
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                Upcoming Interviews
                            </h3>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color:
                                        "#8290A8",
                                    fontSize:
                                        "10px",
                                }}
                            >
                                Your scheduled
                                interviews
                            </p>

                        </div>


                        {upcomingInterviews.length ===
                            0 ? (

                            <div
                                style={{
                                    minHeight:
                                        "255px",
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    padding:
                                        "30px",
                                    textAlign:
                                        "center",
                                }}
                            >

                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius:
                                            "12px",
                                        background:
                                            "#F1EDFF",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        fontSize:
                                            "21px",
                                        marginBottom:
                                            "12px",
                                    }}
                                >
                                    ◫
                                </div>

                                <div
                                    style={{
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "13px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    No upcoming
                                    interviews
                                </div>

                                <p
                                    style={{
                                        margin:
                                            "6px 0 0",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "11px",
                                        lineHeight:
                                            "1.5",
                                    }}
                                >
                                    Scheduled interviews
                                    will appear here.
                                </p>

                            </div>

                        ) : (

                            <div>

                                {upcomingInterviews.map(
                                    (interview) => (

                                        <div
                                            key={
                                                interview.id
                                            }
                                            style={{
                                                padding:
                                                    "17px 21px",
                                                borderBottom:
                                                    "1px solid #F0F3F7",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    color:
                                                        "#243A5E",
                                                    fontSize:
                                                        "13px",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                {
                                                    interview.jobTitle ||
                                                    "Interview"
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "7px",
                                                    color:
                                                        "#7045D6",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                {
                                                    interview.interviewType
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "8px",
                                                    color:
                                                        "#687995",
                                                    fontSize:
                                                        "10px",
                                                    lineHeight:
                                                        "1.7",
                                                }}
                                            >
                                                {
                                                    formatDateTime(
                                                        interview.scheduledAt
                                                    )
                                                }

                                                <br />

                                                Duration:{" "}
                                                {
                                                    interview.durationMinutes
                                                }{" "}
                                                minutes

                                                {interview
                                                    .interviewerName && (
                                                        <>
                                                            <br />
                                                            Interviewer:{" "}
                                                            {
                                                                interview.interviewerName
                                                            }
                                                        </>
                                                    )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </div>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section
                    style={{
                        marginTop: "18px",
                        background: "#FFFFFF",
                        border:
                            "1px solid #E4E9F1",
                        borderRadius: "11px",
                        padding: "20px 21px",
                        boxShadow:
                            "0 3px 12px rgba(15,23,42,0.03)",
                    }}
                >

                    <div
                        style={{
                            marginBottom:
                                "15px",
                        }}
                    >

                        <h3
                            style={{
                                margin: 0,
                                color:
                                    "#10254A",
                                fontSize:
                                    "15px",
                                fontWeight:
                                    "700",
                            }}
                        >
                            Quick Actions
                        </h3>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                color:
                                    "#8290A8",
                                fontSize:
                                    "10px",
                            }}
                        >
                            Quickly access important
                            candidate features.
                        </p>

                    </div>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, minmax(0, 1fr))",
                            gap: "12px",
                        }}
                    >

                        {/* FIND JOBS */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/candidate/jobs"
                                )
                            }
                            style={{
                                border:
                                    "1px solid #DDE8FB",
                                background:
                                    "#F4F8FF",
                                borderRadius:
                                    "9px",
                                padding:
                                    "15px",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "11px",
                                cursor:
                                    "pointer",
                                textAlign:
                                    "left",
                            }}
                        >

                            <span
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius:
                                        "8px",
                                    background:
                                        "#E3EDFF",
                                    color:
                                        "#2766D9",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ⌕
                            </span>

                            <span>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "11px",
                                    }}
                                >
                                    Find Jobs
                                </strong>

                                <small
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "3px",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "9px",
                                    }}
                                >
                                    Explore opportunities
                                </small>

                            </span>

                        </button>


                        {/* APPLICATIONS */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/candidate/applications"
                                )
                            }
                            style={{
                                border:
                                    "1px solid #E2E8F0",
                                background:
                                    "#FAFBFD",
                                borderRadius:
                                    "9px",
                                padding:
                                    "15px",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "11px",
                                cursor:
                                    "pointer",
                                textAlign:
                                    "left",
                            }}
                        >

                            <span
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius:
                                        "8px",
                                    background:
                                        "#EEF2F7",
                                    color:
                                        "#52627A",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ▤
                            </span>

                            <span>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "11px",
                                    }}
                                >
                                    My Applications
                                </strong>

                                <small
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "3px",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "9px",
                                    }}
                                >
                                    Track applications
                                </small>

                            </span>

                        </button>


                        {/* INTERVIEWS */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/candidate/interviews"
                                )
                            }
                            style={{
                                border:
                                    "1px solid #E7E0FC",
                                background:
                                    "#FAF8FF",
                                borderRadius:
                                    "9px",
                                padding:
                                    "15px",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "11px",
                                cursor:
                                    "pointer",
                                textAlign:
                                    "left",
                            }}
                        >

                            <span
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius:
                                        "8px",
                                    background:
                                        "#F0EBFF",
                                    color:
                                        "#7045D6",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ◫
                            </span>

                            <span>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "11px",
                                    }}
                                >
                                    Interviews
                                </strong>

                                <small
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "3px",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "9px",
                                    }}
                                >
                                    View interviews
                                </small>

                            </span>

                        </button>


                        {/* PROFILE */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/candidate/profile"
                                )
                            }
                            style={{
                                border:
                                    "1px solid #DDEEE7",
                                background:
                                    "#F5FBF8",
                                borderRadius:
                                    "9px",
                                padding:
                                    "15px",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "11px",
                                cursor:
                                    "pointer",
                                textAlign:
                                    "left",
                            }}
                        >

                            <span
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius:
                                        "8px",
                                    background:
                                        "#E7F7EF",
                                    color:
                                        "#16845A",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ◉
                            </span>

                            <span>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "11px",
                                    }}
                                >
                                    My Profile
                                </strong>

                                <small
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "3px",
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "9px",
                                    }}
                                >
                                    Update profile
                                </small>

                            </span>

                        </button>

                    </div>

                </section>

            </div>

        </CandidateLayout>
    );
};

export default CandidateDashboard;