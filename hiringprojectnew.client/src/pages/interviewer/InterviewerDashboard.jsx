import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import InterviewerLayout from "../../components/InterviewerLayout";


// ================================================================
// INTERVIEWER DASHBOARD
// ================================================================

const InterviewerDashboard = () => {

    const navigate = useNavigate();


    // ============================================================
    // STATE
    // ============================================================

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ============================================================
    // LOAD DASHBOARD
    // ============================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    "/Interviewer/dashboard"
                );

            setDashboard(
                response.data
            );

        } catch (err) {

            console.error(
                "Error loading interviewer dashboard:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load interviewer dashboard."
            );

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (
        dateString
    ) => {

        if (!dateString) {
            return {
                day: "--",
                month: "---",
            };
        }

        const date =
            new Date(dateString);

        return {
            day: date
                .getDate()
                .toString()
                .padStart(2, "0"),

            month: date
                .toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                    }
                )
                .toUpperCase(),
        };
    };


    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (
        dateString
    ) => {

        if (!dateString) {
            return "-";
        }

        return new Date(
            dateString
        ).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    // ============================================================
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (
        status
    ) => {

        switch (
        status?.toLowerCase()
        ) {

            case "scheduled":
                return "status-scheduled";

            case "rescheduled":
                return "status-rescheduled";

            case "completed":
                return "status-completed";

            case "cancelled":
                return "status-cancelled";

            case "no show":
                return "status-no-show";

            default:
                return "status-default";
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <InterviewerLayout
                activePage="dashboard"
            >

                <div className="dashboard-loading">

                    <div className="dashboard-spinner">
                    </div>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

                <InterviewerDashboardStyles />

            </InterviewerLayout>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <InterviewerLayout
                activePage="dashboard"
            >

                <div className="dashboard-error">

                    {error}

                </div>

                <InterviewerDashboardStyles />

            </InterviewerLayout>
        );
    }


    // ============================================================
    // UPCOMING INTERVIEWS
    // ============================================================

    const upcomingInterviews =
        dashboard?.upcomingInterviewList ||
        [];


    // ============================================================
    // MAIN
    // ============================================================

    return (

        <InterviewerLayout
            activePage="dashboard"
        >

            <div className="interviewer-dashboard">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="page-header">

                    <div className="page-header-left">

                        <div className="page-eyebrow">
                            INTERVIEWER PORTAL
                        </div>

                        <h2>
                            Interviewer Dashboard
                        </h2>

                        <p>
                            Manage your interviews and view
                            your upcoming interview schedule.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/interviewer/interviews"
                            )
                        }
                    >
                        View My Interviews
                        <span className="button-arrow">
                            →
                        </span>
                    </button>

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="stats-grid">


                    {/* TOTAL */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ▣
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Total Interviews
                            </span>

                            <div className="stat-value">
                                {
                                    dashboard?.totalInterviews ??
                                    0
                                }
                            </div>

                        </div>

                    </div>


                    {/* UPCOMING */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ▥
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Upcoming
                            </span>

                            <div className="stat-value">
                                {
                                    dashboard?.upcomingInterviews ??
                                    0
                                }
                            </div>

                        </div>

                    </div>


                    {/* TODAY */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ◉
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Today
                            </span>

                            <div className="stat-value">
                                {
                                    dashboard?.todayInterviews ??
                                    0
                                }
                            </div>

                        </div>

                    </div>


                    {/* COMPLETED */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ✓
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Completed
                            </span>

                            <div className="stat-value">
                                {
                                    dashboard?.completedInterviews ??
                                    0
                                }
                            </div>

                        </div>

                    </div>


                    {/* CANCELLED */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ×
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Cancelled
                            </span>

                            <div className="stat-value">
                                {
                                    dashboard?.cancelledInterviews ??
                                    0
                                }
                            </div>

                        </div>

                    </div>


                    {/* RESCHEDULED */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ↻
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Rescheduled
                            </span>

                            <div className="stat-value">
                                {
                                    dashboard?.rescheduledInterviews ??
                                    0
                                }
                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    UPCOMING INTERVIEWS
                ================================================= */}

                <div className="upcoming-card">


                    {/* HEADER */}

                    <div className="upcoming-header">

                        <div>

                            <h3>
                                Upcoming Interviews
                            </h3>

                            <p>
                                Your next scheduled interviews.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="view-all-link"
                            onClick={() =>
                                navigate(
                                    "/interviewer/interviews"
                                )
                            }
                        >
                            View All
                            <span>
                                →
                            </span>
                        </button>

                    </div>


                    {/* =================================================
                        INTERVIEW LIST
                    ================================================= */}

                    {upcomingInterviews.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-state-icon">
                                ▣
                            </div>

                            <h4>
                                No Upcoming Interviews
                            </h4>

                            <p>
                                You currently have no upcoming
                                interviews scheduled.
                            </p>

                        </div>

                    ) : (

                        upcomingInterviews.map(
                            (interview) => {

                                const date =
                                    formatDate(
                                        interview.scheduledAt
                                    );

                                return (

                                    <div
                                        className="interview-row"
                                        key={
                                            interview.id
                                        }
                                    >


                                        {/* DATE */}

                                        <div className="interview-date">

                                            <span className="interview-date-day">
                                                {
                                                    date.day
                                                }
                                            </span>

                                            <span className="interview-date-month">
                                                {
                                                    date.month
                                                }
                                            </span>

                                        </div>


                                        {/* CONTENT */}

                                        <div className="interview-content">

                                            <h4>
                                                {
                                                    interview.jobTitle ||
                                                    "Interview"
                                                }
                                            </h4>


                                            <div className="candidate-name">

                                                Candidate:{" "}

                                                <strong>
                                                    {
                                                        interview.candidateName ||
                                                        "Unknown Candidate"
                                                    }
                                                </strong>

                                            </div>


                                            <div className="interview-meta">

                                                <span className="interview-meta-item">
                                                    ◷
                                                    {" "}
                                                    {
                                                        formatTime(
                                                            interview.scheduledAt
                                                        )
                                                    }
                                                </span>


                                                <span className="interview-meta-item">
                                                    ◷
                                                    {" "}
                                                    {
                                                        interview.durationMinutes ||
                                                        0
                                                    }
                                                    {" "}
                                                    min
                                                </span>


                                                <span className="interview-meta-item">
                                                    {
                                                        interview.interviewType ||
                                                        "Interview"
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div className="status-container">

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    interview.status
                                                )}`}
                                            >
                                                {
                                                    interview.status ||
                                                    "Scheduled"
                                                }
                                            </span>

                                        </div>


                                        {/* ARROW */}

                                        <button
                                            type="button"
                                            className="interview-arrow"
                                            title="View interview"
                                            onClick={() =>
                                                navigate(
                                                    `/interviewer/interviews/${interview.id}`
                                                )
                                            }
                                        >
                                            →
                                        </button>

                                    </div>

                                );

                            }
                        )

                    )}

                </div>

            </div>


            <InterviewerDashboardStyles />

        </InterviewerLayout>
    );
};


// ================================================================
// STYLES
// ================================================================

const InterviewerDashboardStyles =
    () => (

        <style>
            {`

            /* =====================================================
               GENERAL
            ===================================================== */

            .interviewer-dashboard {
                width: 100%;
            }


            /* =====================================================
               PAGE HEADER
            ===================================================== */

            .page-header {
                display: flex;

                align-items: flex-end;

                justify-content: space-between;

                gap: 20px;

                margin-bottom: 28px;
            }


            .page-header-left {
                min-width: 0;
            }


            .page-eyebrow {
                color: #2867E8;

                font-size: 11px;

                font-weight: 800;

                letter-spacing: 0.14em;

                margin-bottom: 9px;
            }


            .page-header h2 {
                margin: 0;

                color: #10254A;

                font-size: 30px;

                font-weight: 750;

                line-height: 1.15;

                letter-spacing: -0.02em;
            }


            .page-header p {
                margin: 9px 0 0;

                color: #637695;

                font-size: 13px;

                line-height: 1.5;
            }


            /* =====================================================
               MAIN BUTTON
            ===================================================== */

            .primary-button {
                border: none;

                background: #2867E8;

                color: #FFFFFF;

                padding: 11px 17px;

                border-radius: 8px;

                font-size: 12px;

                font-weight: 650;

                cursor: pointer;

                white-space: nowrap;

                display: inline-flex;

                align-items: center;

                justify-content: center;

                gap: 9px;

                transition:
                    background 0.18s ease,
                    transform 0.18s ease;
            }


            .primary-button:hover {
                background: #205BD4;

                transform: translateY(-1px);
            }


            .button-arrow {
                font-size: 15px;

                line-height: 1;
            }


            /* =====================================================
               STAT CARDS
            ===================================================== */

            .stats-grid {
                display: grid;

                grid-template-columns:
                    repeat(
                        6,
                        minmax(0, 1fr)
                    );

                gap: 15px;

                margin-bottom: 25px;
            }


            .stat-card {
                min-height: 100px;

                background: #FFFFFF;

                border: 1px solid #DEE5EF;

                border-radius: 10px;

                padding: 17px;

                display: flex;

                align-items: center;

                gap: 12px;

                box-shadow:
                    0 3px 12px
                    rgba(
                        20,
                        45,
                        80,
                        0.035
                    );
            }


            .stat-icon {
                width: 40px;

                height: 40px;

                min-width: 40px;

                border-radius: 9px;

                display: flex;

                align-items: center;

                justify-content: center;

                font-size: 17px;

                font-weight: 700;
            }


            .stat-card:nth-child(1)
            .stat-icon {
                background: #EAF1FF;

                color: #2867E8;
            }


            .stat-card:nth-child(2)
            .stat-icon {
                background: #EAF8FF;

                color: #2795D9;
            }


            .stat-card:nth-child(3)
            .stat-icon {
                background: #FFF4E5;

                color: #C77D20;
            }


            .stat-card:nth-child(4)
            .stat-icon {
                background: #EAF8F0;

                color: #29945C;
            }


            .stat-card:nth-child(5)
            .stat-icon {
                background: #FFF0F0;

                color: #D64545;
            }


            .stat-card:nth-child(6)
            .stat-icon {
                background: #F1ECFF;

                color: #7253C7;
            }


            .stat-content {
                min-width: 0;
            }


            .stat-label {
                display: block;

                color: #71819B;

                font-size: 11px;

                font-weight: 500;

                margin-bottom: 5px;

                white-space: nowrap;
            }


            .stat-value {
                color: #10254A;

                font-size: 25px;

                font-weight: 750;

                line-height: 1;
            }


            /* =====================================================
               UPCOMING CARD
            ===================================================== */

            .upcoming-card {
                width: 100%;

                background: #FFFFFF;

                border: 1px solid #DEE5EF;

                border-radius: 11px;

                overflow: hidden;

                box-shadow:
                    0 4px 15px
                    rgba(
                        20,
                        45,
                        80,
                        0.035
                    );
            }


            /* =====================================================
               UPCOMING HEADER
            ===================================================== */

            .upcoming-header {
                min-height: 90px;

                padding: 23px 28px;

                border-bottom: 1px solid #E6EBF2;

                display: flex;

                align-items: center;

                justify-content: space-between;

                gap: 20px;
            }


            .upcoming-header h3 {
                margin: 0;

                color: #10254A;

                font-size: 17px;

                font-weight: 700;

                line-height: 1.3;
            }


            .upcoming-header p {
                margin: 6px 0 0;

                color: #7A89A1;

                font-size: 12px;

                line-height: 1.4;
            }


            .view-all-link {
                border: none;

                background: transparent;

                color: #2867E8;

                font-size: 12px;

                font-weight: 650;

                cursor: pointer;

                white-space: nowrap;

                padding: 5px;

                display: inline-flex;

                align-items: center;

                gap: 7px;
            }


            .view-all-link:hover {
                color: #205BD4;
            }


            .view-all-link span {
                font-size: 15px;

                line-height: 1;
            }


            /* =====================================================
               INTERVIEW ROW
            ===================================================== */

            .interview-row {
                min-height: 102px;

                padding: 20px 28px;

                display: grid;

                grid-template-columns:
                    57px
                    minmax(0, 1fr)
                    auto
                    25px;

                align-items: center;

                gap: 17px;

                border-bottom: 1px solid #E8EDF3;

                transition:
                    background 0.18s ease;
            }


            .interview-row:last-child {
                border-bottom: none;
            }


            .interview-row:hover {
                background: #FAFCFF;
            }


            /* =====================================================
               DATE
            ===================================================== */

            .interview-date {
                width: 57px;

                height: 58px;

                border: 1px solid #D8E3F5;

                border-radius: 9px;

                background: #F1F5FF;

                display: flex;

                flex-direction: column;

                align-items: center;

                justify-content: center;

                flex-shrink: 0;
            }


            .interview-date-day {
                color: #2455A5;

                font-size: 20px;

                font-weight: 750;

                line-height: 1;
            }


            .interview-date-month {
                margin-top: 4px;

                color: #2455A5;

                font-size: 10px;

                font-weight: 650;

                letter-spacing: 0.04em;
            }


            /* =====================================================
               INTERVIEW CONTENT
            ===================================================== */

            .interview-content {
                min-width: 0;
            }


            .interview-content h4 {
                margin: 0;

                color: #10254A;

                font-size: 15px;

                font-weight: 700;

                line-height: 1.35;
            }


            .candidate-name {
                margin-top: 5px;

                color: #4F6685;

                font-size: 12px;

                line-height: 1.4;
            }


            .candidate-name strong {
                color: #405978;

                font-weight: 650;
            }


            /* =====================================================
               META
            ===================================================== */

            .interview-meta {
                display: flex;

                align-items: center;

                flex-wrap: wrap;

                gap: 14px;

                margin-top: 7px;
            }


            .interview-meta-item {
                display: inline-flex;

                align-items: center;

                gap: 4px;

                color: #71819B;

                font-size: 11px;

                line-height: 1.3;

                white-space: nowrap;
            }


            .interview-meta-item:first-child {
                color: #536C8B;
            }


            /* =====================================================
               STATUS
            ===================================================== */

            .status-container {
                display: flex;

                align-items: center;

                justify-content: flex-end;
            }


            .status-badge {
                display: inline-flex;

                align-items: center;

                justify-content: center;

                min-width: 86px;

                padding: 8px 13px;

                border-radius: 999px;

                font-size: 10px;

                font-weight: 650;

                white-space: nowrap;
            }


            .status-scheduled {
                background: #EAF2FF;

                color: #2867E8;
            }


            .status-rescheduled {
                background: #F1ECFF;

                color: #7253C7;
            }


            .status-completed {
                background: #EAF8F0;

                color: #29945C;
            }


            .status-cancelled {
                background: #FFF0F0;

                color: #D64545;
            }


            .status-no-show {
                background: #FFF4E5;

                color: #C77D20;
            }


            .status-default {
                background: #F0F2F5;

                color: #687995;
            }


            /* =====================================================
               ARROW
            ===================================================== */

            .interview-arrow {
                border: none;

                background: transparent;

                color: #2867E8;

                font-size: 18px;

                cursor: pointer;

                padding: 4px;

                line-height: 1;

                transition:
                    transform 0.18s ease,
                    color 0.18s ease;
            }


            .interview-arrow:hover {
                color: #205BD4;

                transform: translateX(2px);
            }


            /* =====================================================
               EMPTY
            ===================================================== */

            .empty-state {
                padding: 55px 25px;

                text-align: center;
            }


            .empty-state-icon {
                width: 48px;

                height: 48px;

                margin: 0 auto 13px;

                border-radius: 10px;

                background: #EEF3FF;

                color: #2867E8;

                display: flex;

                align-items: center;

                justify-content: center;

                font-size: 19px;
            }


            .empty-state h4 {
                margin: 0;

                color: #304763;

                font-size: 16px;

                font-weight: 700;
            }


            .empty-state p {
                margin: 6px 0 0;

                color: #7A89A1;

                font-size: 12px;
            }


            /* =====================================================
               LOADING
            ===================================================== */

            .dashboard-loading {
                min-height: 500px;

                display: flex;

                flex-direction: column;

                align-items: center;

                justify-content: center;
            }


            .dashboard-spinner {
                width: 34px;

                height: 34px;

                border: 3px solid #E2E9F5;

                border-top-color: #2867E8;

                border-radius: 50%;

                animation:
                    dashboardSpin
                    0.8s linear infinite;

                margin-bottom: 13px;
            }


            .dashboard-loading p {
                margin: 0;

                color: #71819B;

                font-size: 12px;
            }


            @keyframes dashboardSpin {

                to {
                    transform: rotate(360deg);
                }

            }


            /* =====================================================
               ERROR
            ===================================================== */

            .dashboard-error {
                padding: 30px;

                border: 1px solid #F0D2D2;

                border-radius: 10px;

                background: #FFF8F8;

                color: #C64545;

                font-size: 12px;

                text-align: center;
            }


            /* =====================================================
               RESPONSIVE
            ===================================================== */

            @media (max-width: 1100px) {

                .stats-grid {
                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0, 1fr)
                        );
                }

            }


            @media (max-width: 750px) {

                .page-header {
                    align-items: flex-start;

                    flex-direction: column;
                }


                .stats-grid {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }


                .upcoming-header {
                    padding: 20px;
                }


                .interview-row {
                    padding: 18px 20px;

                    grid-template-columns:
                        57px
                        minmax(0, 1fr)
                        25px;
                }


                .status-container {
                    grid-column: 2;

                    justify-content: flex-start;
                }

            }


            @media (max-width: 520px) {

                .stats-grid {
                    grid-template-columns: 1fr;
                }


                .page-header h2 {
                    font-size: 26px;
                }


                .interview-row {
                    grid-template-columns:
                        52px
                        minmax(0, 1fr)
                        20px;

                    gap: 11px;
                }


                .interview-date {
                    width: 52px;

                    height: 54px;
                }


                .interview-date-day {
                    font-size: 18px;
                }


                .interview-content h4 {
                    font-size: 14px;
                }


                .interview-meta {
                    gap: 8px;
                }


                .status-container {
                    grid-column: 2;
                }

            }

            `}
        </style>
    );


// ================================================================
// EXPORT
// ================================================================

export default InterviewerDashboard;