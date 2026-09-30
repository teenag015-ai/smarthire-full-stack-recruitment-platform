import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterDashboard = () => {
    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        upcomingInterviews: 0,
        selected: 0,
        totalOffers: 0,
        totalHired: 0,
    });

    const [pipeline, setPipeline] = useState([
        {
            label: "Applied",
            value: 0,
            percentage: 0,
        },
        {
            label: "Screening",
            value: 0,
            percentage: 0,
        },
        {
            label: "Shortlisted",
            value: 0,
            percentage: 0,
        },
        {
            label: "Assessment",
            value: 0,
            percentage: 0,
        },
        {
            label: "Interview",
            value: 0,
            percentage: 0,
        },
        {
            label: "Selected",
            value: 0,
            percentage: 0,
        },
        {
            label: "Hired",
            value: 0,
            percentage: 0,
        },
    ]);

    const [recentApplications, setRecentApplications] = useState([]);
    const [upcomingInterviewsList, setUpcomingInterviewsList] =
        useState([]);
    const [recentOffers, setRecentOffers] = useState([]);

    // =========================================================
    // AUTH
    // =========================================================

    const token = localStorage.getItem("smartHireToken");

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // =========================================================
    // DATE HELPERS
    // =========================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTodayDate = () => {
        const date = new Date();

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // =========================================================
    // API - RECRUITER ANALYTICS
    // =========================================================

    const fetchAnalytics = async () => {
        const response = await api.get(
            "/RecruiterAnalytics",
            {
                ...getHeaders(),
            }
        );

        return response.data;
    };

    // =========================================================
    // API - RECENT APPLICATIONS
    // =========================================================

    const fetchRecentApplications = async () => {
        const response = await api.get(
            "/RecruiterApplicant",
            {
                params: {
                    pageNumber: 1,
                    pageSize: 5,
                },
                ...getHeaders(),
            }
        );

        return response.data.applicants || [];
    };

    // =========================================================
    // API - UPCOMING INTERVIEWS
    // =========================================================

    const fetchUpcomingInterviews = async () => {
        const today = getTodayDate();

        const response = await api.get(
            "/RecruiterInterview",
            {
                params: {
                    Status: "Scheduled",
                    FromDate: today,
                    PageNumber: 1,
                    PageSize: 5,
                },
                ...getHeaders(),
            }
        );

        return response.data.interviews || [];
    };

    // =========================================================
    // API - RECENT OFFERS
    // =========================================================

    const fetchRecentOffers = async () => {
        try {
            const response = await api.get(
                "/RecruiterOffer",
                {
                    params: {
                        PageNumber: 1,
                        PageSize: 5,
                    },
                    ...getHeaders(),
                }
            );

            return response.data.offers || [];
        } catch (err) {
            console.error(
                "Failed to load recent offers:",
                err
            );

            return [];
        }
    };

    // =========================================================
    // BUILD PIPELINE FROM ANALYTICS
    // =========================================================

    const buildPipeline = (analytics) => {
        const stages = [
            {
                label: "Applied",
                value: analytics.appliedCount || 0,
            },
            {
                label: "Screening",
                value: analytics.screeningCount || 0,
            },
            {
                label: "Shortlisted",
                value:
                    analytics.shortlistedCount || 0,
            },
            {
                label: "Assessment",
                value:
                    analytics.assessmentCount || 0,
            },
            {
                label: "Interview",
                value:
                    analytics.interviewCount || 0,
            },
            {
                label: "Selected",
                value:
                    analytics.selectedCount || 0,
            },
            {
                label: "Hired",
                value:
                    analytics.hiredCount || 0,
            },
        ];

        const total = stages.reduce(
            (sum, stage) =>
                sum + stage.value,
            0
        );

        return stages.map((stage) => ({
            ...stage,
            percentage:
                total > 0
                    ? Math.round(
                        (stage.value / total) *
                        100
                    )
                    : 0,
        }));
    };

    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                analytics,
                applications,
                interviews,
                offers,
            ] = await Promise.all([
                fetchAnalytics(),
                fetchRecentApplications(),
                fetchUpcomingInterviews(),
                fetchRecentOffers(),
            ]);

            // -------------------------------------------------
            // STATISTICS
            // -------------------------------------------------

            setStats({
                activeJobs:
                    analytics.activeJobs || 0,

                totalApplicants:
                    analytics.totalApplicants || 0,

                upcomingInterviews:
                    analytics.scheduledInterviews ||
                    0,

                selected:
                    analytics.selectedCount || 0,

                totalOffers:
                    Number(
                        analytics.totalOffers
                    ) || 0,

                totalHired:
                    analytics.totalHired || 0,
            });

            // -------------------------------------------------
            // PIPELINE
            // -------------------------------------------------

            setPipeline(
                buildPipeline(analytics)
            );

            // -------------------------------------------------
            // RECENT APPLICATIONS
            // -------------------------------------------------

            setRecentApplications(
                applications
            );

            // -------------------------------------------------
            // UPCOMING INTERVIEWS
            // -------------------------------------------------

            setUpcomingInterviewsList(
                interviews
            );

            // -------------------------------------------------
            // RECENT OFFERS
            // -------------------------------------------------

            setRecentOffers(offers);
        } catch (err) {
            console.error(
                "Failed to load recruiter dashboard:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const handleCreateJob = () => {
        navigate("/recruiter/jobs");
    };

    const handleViewApplicants = () => {
        navigate(
            "/recruiter/applicants"
        );
    };

    const handleViewInterviews = () => {
        navigate(
            "/recruiter/interviews"
        );
    };

    const handleViewJobs = () => {
        navigate("/recruiter/jobs");
    };

    const handleViewOffers = () => {
        navigate("/recruiter/offers");
    };

    // =========================================================
    // INLINE STYLES
    // =========================================================

    const dashboardStyle = {
        width: "100%",
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "4px 0 35px",
        boxSizing: "border-box",
    };

    const headerStyle = {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "24px",
        marginBottom: "26px",
    };

    const eyebrowStyle = {
        display: "block",
        marginBottom: "7px",
        color: "#2862e5",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1px",
    };

    const pageTitleStyle = {
        margin: "0 0 7px",
        color: "#10254a",
        fontSize: "29px",
        fontWeight: "750",
        lineHeight: "1.2",
    };

    const pageDescriptionStyle = {
        margin: "0",
        color: "#70809b",
        fontSize: "13px",
        lineHeight: "1.5",
    };

    const createButtonStyle = {
        height: "44px",
        padding: "0 19px",
        border: "none",
        borderRadius: "8px",
        background:
            "linear-gradient(135deg, #2868e8 0%, #3978ef 100%)",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow:
            "0 7px 18px rgba(42, 105, 232, 0.18)",
        whiteSpace: "nowrap",
    };

    const statGridStyle = {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "18px",
        marginBottom: "20px",
    };

    const statCardStyle = {
        minHeight: "145px",
        padding: "19px 20px",
        border:
            "1px solid #dfe6f0",
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow:
            "0 3px 12px rgba(24, 48, 88, 0.045)",
        boxSizing: "border-box",
        transition:
            "transform 0.2s ease, box-shadow 0.2s ease",
    };

    const statTopStyle = {
        display: "flex",
        alignItems: "center",
        gap: "11px",
    };

    const statIconStyle = {
        width: "37px",
        height: "37px",
        flexShrink: 0,
        borderRadius: "9px",
        background: "#edf4ff",
        color: "#2868e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        fontWeight: "700",
    };

    const statTitleStyle = {
        color: "#49617f",
        fontSize: "13px",
        fontWeight: "500",
    };

    const statValueStyle = {
        marginTop: "17px",
        color: "#10254a",
        fontSize: "30px",
        fontWeight: "750",
        lineHeight: "1",
    };

    const statDescriptionStyle = {
        marginTop: "9px",
        color: "#8491a7",
        fontSize: "11px",
    };

    const lowerGridStyle = {
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 1.6fr) minmax(360px, 1fr)",
        gap: "20px",
        marginBottom: "20px",
        alignItems: "stretch",
    };

    const cardStyle = {
        minWidth: 0,
        border:
            "1px solid #dfe6f0",
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow:
            "0 3px 12px rgba(24, 48, 88, 0.045)",
        overflow: "hidden",
    };

    const cardHeaderStyle = {
        minHeight: "72px",
        padding: "17px 21px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        borderBottom:
            "1px solid #edf1f6",
        boxSizing: "border-box",
    };

    const sectionEyebrowStyle = {
        display: "block",
        marginBottom: "5px",
        color: "#8998ae",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "1px",
    };

    const cardTitleStyle = {
        margin: "0",
        color: "#10254a",
        fontSize: "16px",
        fontWeight: "700",
        lineHeight: "1.3",
    };

    const currentBadgeStyle = {
        padding: "6px 10px",
        borderRadius: "20px",
        background: "#edf4ff",
        color: "#2862e5",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    };

    const pipelineStyle = {
        padding: "20px 21px 21px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    };

    const pipelineHeaderStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "7px",
    };

    const pipelineLabelStyle = {
        color: "#526984",
        fontSize: "12px",
        fontWeight: "500",
    };

    const pipelineValueStyle = {
        color: "#10254a",
        fontSize: "12px",
        fontWeight: "700",
    };

    const pipelineBarStyle = {
        width: "100%",
        height: "7px",
        overflow: "hidden",
        borderRadius: "10px",
        background: "#e8edf4",
    };

    const pipelineProgressStyle = (
        percentage
    ) => ({
        width: `${percentage}%`,
        height: "100%",
        borderRadius: "10px",
        background:
            "linear-gradient(90deg, #2e6fe8 0%, #5c91f5 100%)",
        transition:
            "width 0.3s ease",
    });

    const viewAllButtonStyle = {
        minHeight: "32px",
        padding: "0 11px",
        border:
            "1px solid #d2dae6",
        borderRadius: "6px",
        background: "#ffffff",
        color: "#285da9",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        whiteSpace: "nowrap",
    };

    const applicationListStyle = {
        display: "flex",
        flexDirection: "column",
    };

    const applicationRowStyle = {
        minHeight: "76px",
        padding: "13px 21px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        borderBottom:
            "1px solid #edf1f6",
        boxSizing: "border-box",
    };

    const applicationMainStyle = {
        minWidth: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    };

    const applicationNameStyle = {
        color: "#0c2d5c",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.3",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const applicationJobStyle = {
        color: "#7083a0",
        fontSize: "11px",
        lineHeight: "1.35",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const applicationSideStyle = {
        flexShrink: 0,
        minWidth: "85px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "5px",
    };

    const stageBadgeStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 9px",
        borderRadius: "20px",
        background: "#edf4ff",
        color: "#2862e5",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    };

    const dateStyle = {
        color: "#8997aa",
        fontSize: "10px",
        whiteSpace: "nowrap",
    };

    const interviewListStyle = {
        display: "flex",
        flexDirection: "column",
    };

    const interviewRowStyle = {
        minHeight: "88px",
        padding: "15px 21px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        borderBottom:
            "1px solid #edf1f6",
        boxSizing: "border-box",
    };

    const interviewIconStyle = {
        width: "38px",
        height: "38px",
        flexShrink: 0,
        borderRadius: "9px",
        background: "#edf4ff",
        color: "#2862e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
    };

    const interviewDetailsStyle = {
        minWidth: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    };

    const interviewCandidateStyle = {
        color: "#0c2d5c",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.3",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const interviewJobStyle = {
        color: "#526984",
        fontSize: "11px",
        lineHeight: "1.35",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const interviewTypeStyle = {
        color: "#8997aa",
        fontSize: "10px",
        lineHeight: "1.3",
    };

    const interviewTimeStyle = {
        flexShrink: 0,
        minWidth: "145px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "5px",
        textAlign: "right",
    };

    const interviewDateTimeStyle = {
        color: "#0c2d5c",
        fontSize: "11px",
        fontWeight: "700",
        lineHeight: "1.35",
        whiteSpace: "nowrap",
    };

    const interviewDurationStyle = {
        color: "#8997aa",
        fontSize: "10px",
        whiteSpace: "nowrap",
    };

    const offerListStyle = {
        display: "flex",
        flexDirection: "column",
    };

    const offerRowStyle = {
        minHeight: "76px",
        padding: "13px 21px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        borderBottom:
            "1px solid #edf1f6",
        boxSizing: "border-box",
    };

    const offerMainStyle = {
        minWidth: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    };

    const offerCandidateStyle = {
        color: "#0c2d5c",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.3",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const offerJobStyle = {
        color: "#7083a0",
        fontSize: "11px",
        lineHeight: "1.35",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const offerSideStyle = {
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "5px",
    };

    const getOfferStatusStyle = (
        status
    ) => {
        const normalizedStatus =
            String(status || "")
                .toLowerCase();

        if (
            normalizedStatus ===
            "accepted"
        ) {
            return {
                background: "#e9f8ef",
                color: "#16794c",
            };
        }

        if (
            normalizedStatus ===
            "sent"
        ) {
            return {
                background: "#edf4ff",
                color: "#2862e5",
            };
        }

        if (
            normalizedStatus ===
            "rejected"
        ) {
            return {
                background: "#fff0f0",
                color: "#b42318",
            };
        }

        if (
            normalizedStatus ===
            "expired"
        ) {
            return {
                background: "#f3f4f6",
                color: "#667085",
            };
        }

        return {
            background: "#f5f7fb",
            color: "#526984",
        };
    };

    const offerStatusStyle = (
        status
    ) => ({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 9px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        ...getOfferStatusStyle(status),
    });

    const emptyStateStyle = {
        minHeight: "210px",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
    };

    const emptyIconStyle = {
        width: "44px",
        height: "44px",
        marginBottom: "11px",
        borderRadius: "50%",
        background: "#edf4ff",
        color: "#2862e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
    };

    const emptyTitleStyle = {
        margin: "0 0 6px",
        color: "#20385d",
        fontSize: "14px",
        fontWeight: "700",
    };

    const emptyDescriptionStyle = {
        maxWidth: "300px",
        margin: "0",
        color: "#8592a8",
        fontSize: "11px",
        lineHeight: "1.55",
    };

    const loadingStyle = {
        minHeight: "190px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#7a8ba4",
        fontSize: "12px",
    };

    const errorStyle = {
        marginBottom: "20px",
        padding: "12px 15px",
        border:
            "1px solid #f4cccc",
        borderRadius: "8px",
        background: "#fff1f1",
        color: "#b42318",
        fontSize: "12px",
    };

    // =========================================================
    // STAT CARDS
    // =========================================================

    const statisticCards = [
        {
            title: "Active Jobs",
            value: stats.activeJobs,
            description:
                "Currently published jobs",
            icon: "▤",
            onClick:
                handleViewJobs,
        },
        {
            title: "Total Applicants",
            value:
                stats.totalApplicants,
            description:
                "Applications received",
            icon: "♙",
            onClick:
                handleViewApplicants,
        },
        {
            title: "Interviews",
            value:
                stats.upcomingInterviews,
            description:
                "Upcoming interviews",
            icon: "◷",
            onClick:
                handleViewInterviews,
        },
        {
            title: "Offers",
            value:
                stats.totalOffers,
            description:
                "Offers created",
            icon: "▣",
            onClick:
                handleViewOffers,
        },
    ];

    // =========================================================
    // UI
    // =========================================================

    return (
        <RecruiterLayout activePage="dashboard">
            <div
                className="recruiter-dashboard"
                style={dashboardStyle}
            >
                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div
                    className="recruiter-dashboard-header"
                    style={headerStyle}
                >
                    <div>
                        <span
                            className="page-eyebrow"
                            style={eyebrowStyle}
                        >
                            RECRUITER DASHBOARD
                        </span>

                        <h2
                            style={pageTitleStyle}
                        >
                            Recruitment Overview
                        </h2>

                        <p
                            style={
                                pageDescriptionStyle
                            }
                        >
                            Track your hiring
                            activity and
                            manage recruitment
                            operations from
                            one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="create-recruiter-button"
                        style={
                            createButtonStyle
                        }
                        onClick={
                            handleCreateJob
                        }
                    >
                        + Create Job
                    </button>
                </div>

                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                    <div
                        className="admin-alert admin-alert-error"
                        style={errorStyle}
                    >
                        {error}
                    </div>
                )}

                {/* =====================================================
                    STAT CARDS
                ===================================================== */}

                <div
                    className="recruiter-stat-grid"
                    style={statGridStyle}
                >
                    {statisticCards.map(
                        (stat) => (
                            <div
                                className="recruiter-stat-card"
                                key={
                                    stat.title
                                }
                                style={{
                                    ...statCardStyle,
                                    cursor: "pointer",
                                }}
                                onClick={
                                    stat.onClick
                                }
                                onMouseEnter={(
                                    e
                                ) => {
                                    e.currentTarget.style.transform =
                                        "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 20px rgba(24, 48, 88, 0.08)";
                                }}
                                onMouseLeave={(
                                    e
                                ) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 3px 12px rgba(24, 48, 88, 0.045)";
                                }}
                            >
                                <div
                                    className="recruiter-stat-card-top"
                                    style={
                                        statTopStyle
                                    }
                                >
                                    <div
                                        className="recruiter-stat-card-icon"
                                        style={
                                            statIconStyle
                                        }
                                    >
                                        {
                                            stat.icon
                                        }
                                    </div>

                                    <span
                                        className="recruiter-stat-card-title"
                                        style={
                                            statTitleStyle
                                        }
                                    >
                                        {
                                            stat.title
                                        }
                                    </span>
                                </div>

                                <div
                                    className="recruiter-stat-card-value"
                                    style={
                                        statValueStyle
                                    }
                                >
                                    {loading
                                        ? "..."
                                        : stat.value}
                                </div>

                                <div
                                    className="recruiter-stat-card-description"
                                    style={
                                        statDescriptionStyle
                                    }
                                >
                                    {
                                        stat.description
                                    }
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* =====================================================
                    PIPELINE + RECENT APPLICATIONS
                ===================================================== */}

                <div
                    className="recruiter-dashboard-grid"
                    style={
                        lowerGridStyle
                    }
                >
                    {/* =================================================
                        PIPELINE
                    ================================================= */}

                    <div
                        className="recruiter-dashboard-card"
                        style={cardStyle}
                    >
                        <div
                            className="recruiter-dashboard-card-header"
                            style={
                                cardHeaderStyle
                            }
                        >
                            <div>
                                <span
                                    className="recruiter-section-eyebrow"
                                    style={
                                        sectionEyebrowStyle
                                    }
                                >
                                    HIRING FUNNEL
                                </span>

                                <h3
                                    style={
                                        cardTitleStyle
                                    }
                                >
                                    Recruitment
                                    Pipeline
                                </h3>
                            </div>

                            <span
                                className="recruiter-pipeline-current"
                                style={
                                    currentBadgeStyle
                                }
                            >
                                Current
                            </span>
                        </div>

                        <div
                            className="recruiter-pipeline"
                            style={
                                pipelineStyle
                            }
                        >
                            {pipeline.map(
                                (stage) => (
                                    <div
                                        className="recruiter-pipeline-row"
                                        key={
                                            stage.label
                                        }
                                    >
                                        <div
                                            className="recruiter-pipeline-header"
                                            style={
                                                pipelineHeaderStyle
                                            }
                                        >
                                            <span
                                                className="recruiter-pipeline-label"
                                                style={
                                                    pipelineLabelStyle
                                                }
                                            >
                                                {
                                                    stage.label
                                                }
                                            </span>

                                            <span
                                                className="recruiter-pipeline-value"
                                                style={
                                                    pipelineValueStyle
                                                }
                                            >
                                                {loading
                                                    ? "..."
                                                    : stage.value}
                                            </span>
                                        </div>

                                        <div
                                            className="recruiter-pipeline-bar"
                                            style={
                                                pipelineBarStyle
                                            }
                                        >
                                            <div
                                                className="recruiter-pipeline-progress"
                                                style={pipelineProgressStyle(
                                                    loading
                                                        ? 0
                                                        : stage.percentage
                                                )}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        RECENT APPLICATIONS
                    ================================================= */}

                    <div
                        className="recruiter-dashboard-card"
                        style={cardStyle}
                    >
                        <div
                            className="recruiter-dashboard-card-header"
                            style={
                                cardHeaderStyle
                            }
                        >
                            <div>
                                <span
                                    className="recruiter-section-eyebrow"
                                    style={
                                        sectionEyebrowStyle
                                    }
                                >
                                    APPLICATIONS
                                </span>

                                <h3
                                    style={
                                        cardTitleStyle
                                    }
                                >
                                    Recent
                                    Applications
                                </h3>
                            </div>

                            <button
                                type="button"
                                style={
                                    viewAllButtonStyle
                                }
                                onClick={
                                    handleViewApplicants
                                }
                            >
                                View All
                            </button>
                        </div>

                        {loading ? (
                            <div
                                style={
                                    loadingStyle
                                }
                            >
                                Loading
                                applications...
                            </div>
                        ) : recentApplications.length ===
                            0 ? (
                            <div
                                className="recruiter-empty-state"
                                style={
                                    emptyStateStyle
                                }
                            >
                                <div
                                    className="recruiter-empty-state-icon"
                                    style={
                                        emptyIconStyle
                                    }
                                >
                                    ♙
                                </div>

                                <h4
                                    style={
                                        emptyTitleStyle
                                    }
                                >
                                    No applications
                                    yet
                                </h4>

                                <p
                                    style={
                                        emptyDescriptionStyle
                                    }
                                >
                                    Applications
                                    for your
                                    jobs will
                                    appear
                                    here.
                                </p>
                            </div>
                        ) : (
                            <div
                                className="recruiter-dashboard-list"
                                style={
                                    applicationListStyle
                                }
                            >
                                {recentApplications.map(
                                    (
                                        application
                                    ) => (
                                        <div
                                            className="recruiter-dashboard-list-item"
                                            key={
                                                application.applicationId
                                            }
                                            style={
                                                applicationRowStyle
                                            }
                                        >
                                            <div
                                                className="recruiter-dashboard-list-main"
                                                style={
                                                    applicationMainStyle
                                                }
                                            >
                                                <strong
                                                    style={
                                                        applicationNameStyle
                                                    }
                                                >
                                                    {
                                                        application.candidateName
                                                    }
                                                </strong>

                                                <span
                                                    style={
                                                        applicationJobStyle
                                                    }
                                                >
                                                    {
                                                        application.jobTitle
                                                    }
                                                </span>
                                            </div>

                                            <div
                                                className="recruiter-dashboard-list-side"
                                                style={
                                                    applicationSideStyle
                                                }
                                            >
                                                <span
                                                    className="recruiter-dashboard-stage"
                                                    style={
                                                        stageBadgeStyle
                                                    }
                                                >
                                                    {
                                                        application.currentStage
                                                    }
                                                </span>

                                                <small
                                                    style={
                                                        dateStyle
                                                    }
                                                >
                                                    {formatDate(
                                                        application.appliedAt
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    UPCOMING INTERVIEWS
                ===================================================== */}

                <div
                    className="recruiter-dashboard-card recruiter-dashboard-full-card"
                    style={{
                        ...cardStyle,
                        width: "100%",
                        marginBottom: "20px",
                    }}
                >
                    <div
                        className="recruiter-dashboard-card-header"
                        style={
                            cardHeaderStyle
                        }
                    >
                        <div>
                            <span
                                className="recruiter-section-eyebrow"
                                style={
                                    sectionEyebrowStyle
                                }
                            >
                                INTERVIEWS
                            </span>

                            <h3
                                style={
                                    cardTitleStyle
                                }
                            >
                                Upcoming
                                Interviews
                            </h3>
                        </div>

                        <button
                            type="button"
                            style={
                                viewAllButtonStyle
                            }
                            onClick={
                                handleViewInterviews
                            }
                        >
                            View All
                        </button>
                    </div>

                    {loading ? (
                        <div
                            style={
                                loadingStyle
                            }
                        >
                            Loading
                            interviews...
                        </div>
                    ) : upcomingInterviewsList.length ===
                        0 ? (
                        <div
                            className="recruiter-empty-state"
                            style={
                                emptyStateStyle
                            }
                        >
                            <div
                                className="recruiter-empty-state-icon"
                                style={
                                    emptyIconStyle
                                }
                            >
                                ◷
                            </div>

                            <h4
                                style={
                                    emptyTitleStyle
                                }
                            >
                                No upcoming
                                interviews
                            </h4>

                            <p
                                style={
                                    emptyDescriptionStyle
                                }
                            >
                                Scheduled
                                interviews
                                for your
                                candidates
                                will appear
                                here.
                            </p>
                        </div>
                    ) : (
                        <div
                            className="recruiter-interview-list"
                            style={
                                interviewListStyle
                            }
                        >
                            {upcomingInterviewsList.map(
                                (
                                    interview
                                ) => (
                                    <div
                                        className="recruiter-interview-item"
                                        key={
                                            interview.id
                                        }
                                        style={
                                            interviewRowStyle
                                        }
                                    >
                                        <div
                                            className="recruiter-interview-icon"
                                            style={
                                                interviewIconStyle
                                            }
                                        >
                                            ◷
                                        </div>

                                        <div
                                            className="recruiter-interview-details"
                                            style={
                                                interviewDetailsStyle
                                            }
                                        >
                                            <strong
                                                style={
                                                    interviewCandidateStyle
                                                }
                                            >
                                                {
                                                    interview.candidateName
                                                }
                                            </strong>

                                            <span
                                                style={
                                                    interviewJobStyle
                                                }
                                            >
                                                {
                                                    interview.jobTitle
                                                }
                                            </span>

                                            <small
                                                style={
                                                    interviewTypeStyle
                                                }
                                            >
                                                {
                                                    interview.interviewType
                                                }{" "}
                                                Interview
                                            </small>
                                        </div>

                                        <div
                                            className="recruiter-interview-time"
                                            style={
                                                interviewTimeStyle
                                            }
                                        >
                                            <strong
                                                style={
                                                    interviewDateTimeStyle
                                                }
                                            >
                                                {formatDateTime(
                                                    interview.scheduledAt
                                                )}
                                            </strong>

                                            <span
                                                style={
                                                    interviewDurationStyle
                                                }
                                            >
                                                {
                                                    interview.durationMinutes
                                                }{" "}
                                                minutes
                                            </span>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* =====================================================
                    RECENT OFFERS
                ===================================================== */}

                <div
                    className="recruiter-dashboard-card recruiter-dashboard-full-card"
                    style={{
                        ...cardStyle,
                        width: "100%",
                    }}
                >
                    <div
                        className="recruiter-dashboard-card-header"
                        style={
                            cardHeaderStyle
                        }
                    >
                        <div>
                            <span
                                className="recruiter-section-eyebrow"
                                style={
                                    sectionEyebrowStyle
                                }
                            >
                                OFFERS
                            </span>

                            <h3
                                style={
                                    cardTitleStyle
                                }
                            >
                                Recent Offers
                            </h3>
                        </div>

                        <button
                            type="button"
                            style={
                                viewAllButtonStyle
                            }
                            onClick={
                                handleViewOffers
                            }
                        >
                            View All
                        </button>
                    </div>

                    {loading ? (
                        <div
                            style={
                                loadingStyle
                            }
                        >
                            Loading offers...
                        </div>
                    ) : recentOffers.length ===
                        0 ? (
                        <div
                            className="recruiter-empty-state"
                            style={
                                emptyStateStyle
                            }
                        >
                            <div
                                className="recruiter-empty-state-icon"
                                style={
                                    emptyIconStyle
                                }
                            >
                                ▣
                            </div>

                            <h4
                                style={
                                    emptyTitleStyle
                                }
                            >
                                No offers yet
                            </h4>

                            <p
                                style={
                                    emptyDescriptionStyle
                                }
                            >
                                Offers created
                                for your
                                candidates
                                will appear
                                here.
                            </p>
                        </div>
                    ) : (
                        <div
                            className="recruiter-offer-list"
                            style={
                                offerListStyle
                            }
                        >
                            {recentOffers.map(
                                (offer) => (
                                    <div
                                        className="recruiter-offer-item"
                                        key={
                                            offer.id
                                        }
                                        style={
                                            offerRowStyle
                                        }
                                    >
                                        <div
                                            style={
                                                offerMainStyle
                                            }
                                        >
                                            <strong
                                                style={
                                                    offerCandidateStyle
                                                }
                                            >
                                                {
                                                    offer.candidateName
                                                }
                                            </strong>

                                            <span
                                                style={
                                                    offerJobStyle
                                                }
                                            >
                                                {
                                                    offer.jobTitle
                                                }
                                            </span>
                                        </div>

                                        <div
                                            style={
                                                offerSideStyle
                                            }
                                        >
                                            <span
                                                style={offerStatusStyle(
                                                    offer.status
                                                )}
                                            >
                                                {
                                                    offer.status
                                                }
                                            </span>

                                            <small
                                                style={
                                                    dateStyle
                                                }
                                            >
                                                {formatDate(
                                                    offer.createdAt
                                                )}
                                            </small>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================================
                RESPONSIVE DASHBOARD OVERRIDES
            ========================================================= */}

            <style>
                {`
                    @media (max-width: 1200px) {
                        .recruiter-stat-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        }

                        .recruiter-dashboard-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    @media (max-width: 800px) {
                        .recruiter-dashboard-header {
                            align-items: flex-start !important;
                            flex-direction: column !important;
                        }

                        .create-recruiter-button {
                            width: 100% !important;
                        }
                    }

                    @media (max-width: 600px) {
                        .recruiter-stat-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .recruiter-dashboard-list-item {
                            align-items: flex-start !important;
                            flex-direction: column !important;
                        }

                        .recruiter-dashboard-list-side {
                            width: 100% !important;
                            align-items: flex-start !important;
                            flex-direction: row !important;
                        }

                        .recruiter-interview-item {
                            align-items: flex-start !important;
                            flex-wrap: wrap !important;
                        }

                        .recruiter-interview-time {
                            width: 100% !important;
                            margin-left: 52px !important;
                            align-items: flex-start !important;
                            text-align: left !important;
                        }

                        .recruiter-offer-item {
                            align-items: flex-start !important;
                            flex-direction: column !important;
                        }

                        .recruiter-offer-item > div:last-child {
                            width: 100% !important;
                            align-items: flex-start !important;
                            flex-direction: row !important;
                        }
                    }
                `}
            </style>
        </RecruiterLayout>
    );
};

export default RecruiterDashboard;