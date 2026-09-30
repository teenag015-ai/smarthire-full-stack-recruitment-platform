import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import InterviewerLayout from "../../components/InterviewerLayout";


// ================================================================
// INTERVIEWER INTERVIEWS
// ================================================================

const InterviewerInterviews = () => {

    const navigate = useNavigate();


    // ============================================================
    // STATE
    // ============================================================

    const [interviews, setInterviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");


    // ============================================================
    // PAGINATION STATE
    // ============================================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const interviewsPerPage = 10;


    // ============================================================
    // LOAD INTERVIEWS
    // ============================================================

    useEffect(() => {
        loadInterviews();
    }, []);


    const loadInterviews = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    "/Interviewer/interviews"
                );

            setInterviews(
                response.data || []
            );

        } catch (err) {

            console.error(
                "Error loading interviewer interviews:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load interviews."
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
            return "-";
        }

        return new Date(
            dateString
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

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
    // FILTER INTERVIEWS
    // ============================================================

    const filteredInterviews =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return interviews.filter(
                (interview) => {

                    const matchesSearch =
                        !searchValue ||
                        interview.candidateName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        interview.candidateEmail
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        interview.jobTitle
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        interview.interviewType
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            );


                    const matchesStatus =
                        statusFilter === "All" ||
                        interview.status
                            ?.toLowerCase() ===
                        statusFilter.toLowerCase();


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            interviews,
            search,
            statusFilter,
        ]);


    // ============================================================
    // PAGINATION CALCULATIONS
    // ============================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredInterviews.length /
                interviewsPerPage
            )
        );


    // ============================================================
    // KEEP CURRENT PAGE VALID
    // ============================================================

    useEffect(() => {

        if (
            currentPage >
            totalPages
        ) {

            setCurrentPage(
                totalPages
            );

        }

    }, [
        currentPage,
        totalPages,
    ]);


    // ============================================================
    // CURRENT PAGE DATA
    // ============================================================

    const paginatedInterviews =
        useMemo(() => {

            const startIndex =
                (currentPage - 1) *
                interviewsPerPage;

            const endIndex =
                startIndex +
                interviewsPerPage;

            return filteredInterviews.slice(
                startIndex,
                endIndex
            );

        }, [
            filteredInterviews,
            currentPage,
        ]);


    // ============================================================
    // PAGINATION RANGE
    // ============================================================

    const pageNumbers =
        useMemo(() => {

            const pages = [];

            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                pages.push(page);

            }

            return pages;

        }, [
            totalPages,
        ]);


    // ============================================================
    // SEARCH CHANGE
    // ============================================================

    const handleSearchChange = (
        value
    ) => {

        setSearch(value);

        setCurrentPage(1);

    };


    // ============================================================
    // STATUS CHANGE
    // ============================================================

    const handleStatusChange = (
        value
    ) => {

        setStatusFilter(value);

        setCurrentPage(1);

    };


    // ============================================================
    // SUMMARY CARD FILTER
    // ============================================================

    const handleSummaryFilter = (
        value
    ) => {

        setStatusFilter(value);

        setCurrentPage(1);

    };


    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    const clearFilters = () => {

        setSearch("");

        setStatusFilter("All");

        setCurrentPage(1);

    };


    // ============================================================
    // COUNTS
    // ============================================================

    const counts = useMemo(() => {

        return {

            total:
                interviews.length,

            scheduled:
                interviews.filter(
                    (item) =>
                        item.status
                            ?.toLowerCase() ===
                        "scheduled"
                ).length,

            rescheduled:
                interviews.filter(
                    (item) =>
                        item.status
                            ?.toLowerCase() ===
                        "rescheduled"
                ).length,

            completed:
                interviews.filter(
                    (item) =>
                        item.status
                            ?.toLowerCase() ===
                        "completed"
                ).length,

            cancelled:
                interviews.filter(
                    (item) =>
                        item.status
                            ?.toLowerCase() ===
                        "cancelled"
                ).length,

        };

    }, [
        interviews,
    ]);


    // ============================================================
    // PAGINATION DISPLAY
    // ============================================================

    const startRecord =
        filteredInterviews.length === 0
            ? 0
            : (
                (currentPage - 1) *
                interviewsPerPage
            ) + 1;


    const endRecord =
        Math.min(
            currentPage *
            interviewsPerPage,
            filteredInterviews.length
        );


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <InterviewerLayout
                activePage="interviews"
            >

                <div className="interviewer-list-loading">

                    <div className="interviewer-loading-spinner">
                    </div>

                    <p>
                        Loading interviews...
                    </p>

                </div>


                <InterviewerInterviewsStyles />

            </InterviewerLayout>

        );

    }


    // ============================================================
    // MAIN
    // ============================================================

    return (

        <InterviewerLayout
            activePage="interviews"
        >

            <div className="interviewer-interviews-page">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="interviews-page-header">

                    <div>

                        <div className="interviews-eyebrow">
                            INTERVIEWER PORTAL
                        </div>

                        <h2>
                            My Interviews
                        </h2>

                        <p>
                            View and manage interviews
                            assigned to you.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="dashboard-button"
                        onClick={() =>
                            navigate(
                                "/interviewer/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="interviews-error">

                        <div className="interviews-error-icon">
                            !
                        </div>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadInterviews
                            }
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div className="interviews-summary-grid">


                    {/* TOTAL */}

                    <div
                        className={`interviews-summary-card ${statusFilter === "All"
                                ? "summary-active"
                                : ""
                            }`}
                        onClick={() =>
                            handleSummaryFilter(
                                "All"
                            )
                        }
                    >

                        <div className="summary-icon total">
                            ▣
                        </div>

                        <div>

                            <span>
                                Total
                            </span>

                            <strong>
                                {counts.total}
                            </strong>

                        </div>

                    </div>


                    {/* SCHEDULED */}

                    <div
                        className={`interviews-summary-card ${statusFilter ===
                                "Scheduled"
                                ? "summary-active"
                                : ""
                            }`}
                        onClick={() =>
                            handleSummaryFilter(
                                "Scheduled"
                            )
                        }
                    >

                        <div className="summary-icon scheduled">
                            ◫
                        </div>

                        <div>

                            <span>
                                Scheduled
                            </span>

                            <strong>
                                {counts.scheduled}
                            </strong>

                        </div>

                    </div>


                    {/* RESCHEDULED */}

                    <div
                        className={`interviews-summary-card ${statusFilter ===
                                "Rescheduled"
                                ? "summary-active"
                                : ""
                            }`}
                        onClick={() =>
                            handleSummaryFilter(
                                "Rescheduled"
                            )
                        }
                    >

                        <div className="summary-icon rescheduled">
                            ↻
                        </div>

                        <div>

                            <span>
                                Rescheduled
                            </span>

                            <strong>
                                {counts.rescheduled}
                            </strong>

                        </div>

                    </div>


                    {/* COMPLETED */}

                    <div
                        className={`interviews-summary-card ${statusFilter ===
                                "Completed"
                                ? "summary-active"
                                : ""
                            }`}
                        onClick={() =>
                            handleSummaryFilter(
                                "Completed"
                            )
                        }
                    >

                        <div className="summary-icon completed">
                            ✓
                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {counts.completed}
                            </strong>

                        </div>

                    </div>


                    {/* CANCELLED */}

                    <div
                        className={`interviews-summary-card ${statusFilter ===
                                "Cancelled"
                                ? "summary-active"
                                : ""
                            }`}
                        onClick={() =>
                            handleSummaryFilter(
                                "Cancelled"
                            )
                        }
                    >

                        <div className="summary-icon cancelled">
                            ×
                        </div>

                        <div>

                            <span>
                                Cancelled
                            </span>

                            <strong>
                                {counts.cancelled}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    TABLE CARD
                ================================================= */}

                <div className="interviews-table-card">


                    {/* =================================================
                        TABLE TOOLBAR
                    ================================================= */}

                    <div className="interviews-table-toolbar">

                        <div>

                            <h3>
                                Interview Schedule
                            </h3>

                            <p>
                                {filteredInterviews.length}{" "}
                                interview
                                {
                                    filteredInterviews.length !==
                                        1
                                        ? "s"
                                        : ""
                                }{" "}
                                found
                            </p>

                        </div>


                        <div className="interviews-toolbar-controls">


                            {/* SEARCH */}

                            <div className="interviews-search">

                                <span>
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search candidate or job..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearchChange(
                                            e.target.value
                                        )
                                    }
                                />

                                {search && (

                                    <button
                                        type="button"
                                        className="clear-search"
                                        onClick={() =>
                                            handleSearchChange(
                                                ""
                                            )
                                        }
                                    >
                                        ×
                                    </button>

                                )}

                            </div>


                            {/* STATUS */}

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(e) =>
                                    handleStatusChange(
                                        e.target.value
                                    )
                                }
                                className="interviews-status-filter"
                            >

                                <option value="All">
                                    All Status
                                </option>

                                <option value="Scheduled">
                                    Scheduled
                                </option>

                                <option value="Rescheduled">
                                    Rescheduled
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    {filteredInterviews.length >
                        0 ? (

                        <>

                            <div className="interviews-table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Candidate
                                            </th>

                                            <th>
                                                Job
                                            </th>

                                            <th>
                                                Interview
                                            </th>

                                            <th>
                                                Date & Time
                                            </th>

                                            <th>
                                                Duration
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {paginatedInterviews.map(
                                            (
                                                interview
                                            ) => (

                                                <tr
                                                    key={
                                                        interview.id
                                                    }
                                                >


                                                    {/* =================================
                                                        CANDIDATE
                                                    ================================= */}

                                                    <td>

                                                        <div className="candidate-cell">

                                                            <div className="candidate-avatar">

                                                                {
                                                                    interview
                                                                        .candidateName
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase() ||
                                                                    "C"
                                                                }

                                                            </div>


                                                            <div className="candidate-info">

                                                                <strong>
                                                                    {
                                                                        interview.candidateName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        interview.candidateEmail
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* =================================
                                                        JOB
                                                    ================================= */}

                                                    <td>

                                                        <div className="job-cell">

                                                            <strong>
                                                                {
                                                                    interview.jobTitle
                                                                }
                                                            </strong>

                                                            <span>
                                                                Job ID:{" "}
                                                                {
                                                                    interview.jobId
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* =================================
                                                        INTERVIEW
                                                    ================================= */}

                                                    <td>

                                                        <div className="interview-type-cell">

                                                            <strong>
                                                                {
                                                                    interview.interviewType ||
                                                                    "Interview"
                                                                }
                                                            </strong>


                                                            {
                                                                interview.location &&
                                                                (

                                                                    <span>
                                                                        📍{" "}
                                                                        {
                                                                            interview.location
                                                                        }
                                                                    </span>

                                                                )
                                                            }

                                                        </div>

                                                    </td>


                                                    {/* =================================
                                                        DATE & TIME
                                                    ================================= */}

                                                    <td>

                                                        <div className="date-time-cell">

                                                            <strong>
                                                                {
                                                                    formatDate(
                                                                        interview.scheduledAt
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    formatTime(
                                                                        interview.scheduledAt
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* =================================
                                                        DURATION
                                                    ================================= */}

                                                    <td>

                                                        <span className="duration-text">

                                                            {
                                                                interview.durationMinutes
                                                            }{" "}
                                                            min

                                                        </span>

                                                    </td>


                                                    {/* =================================
                                                        STATUS
                                                    ================================= */}

                                                    <td>

                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                interview.status
                                                            )}`}
                                                        >

                                                            {
                                                                interview.status ||
                                                                "Unknown"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================================
                                                        ACTION
                                                    ================================= */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="view-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/interviewer/interviews/${interview.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* =================================================
                                PAGINATION
                            ================================================= */}

                            <div className="interviews-pagination">

                                <div className="pagination-info">

                                    Showing{" "}
                                    <strong>
                                        {startRecord}
                                    </strong>{" "}
                                    to{" "}
                                    <strong>
                                        {endRecord}
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {
                                            filteredInterviews.length
                                        }
                                    </strong>{" "}
                                    interviews

                                </div>


                                <div className="pagination-controls">

                                    {/* PREVIOUS */}

                                    <button
                                        type="button"
                                        className="pagination-button previous-next"
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.max(
                                                        1,
                                                        page - 1
                                                    )
                                            )
                                        }
                                    >
                                        ← Previous
                                    </button>


                                    {/* PAGE NUMBERS */}

                                    <div className="pagination-pages">

                                        {pageNumbers.map(
                                            (page) => (

                                                <button
                                                    key={
                                                        page
                                                    }
                                                    type="button"
                                                    className={`pagination-page ${currentPage ===
                                                            page
                                                            ? "pagination-page-active"
                                                            : ""
                                                        }`}
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            page
                                                        )
                                                    }
                                                >
                                                    {
                                                        page
                                                    }
                                                </button>

                                            )
                                        )}

                                    </div>


                                    {/* NEXT */}

                                    <button
                                        type="button"
                                        className="pagination-button previous-next"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page + 1
                                                    )
                                            )
                                        }
                                    >
                                        Next →
                                    </button>

                                </div>

                            </div>

                        </>

                    ) : (

                        /* =============================================
                           EMPTY STATE
                        ============================================= */

                        <div className="interviews-empty-state">

                            <div className="empty-icon">
                                ◫
                            </div>

                            <h3>
                                No Interviews Found
                            </h3>

                            <p>

                                {search ||
                                    statusFilter !==
                                    "All"
                                    ? "Try changing your search or filter."
                                    : "You don't have any interviews assigned yet."}

                            </p>


                            {(search ||
                                statusFilter !==
                                "All") && (

                                    <button
                                        type="button"
                                        className="reset-button"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        Clear Filters
                                    </button>

                                )}

                        </div>

                    )}

                </div>

            </div>


            <InterviewerInterviewsStyles />

        </InterviewerLayout>

    );

};


// ================================================================
// STYLES
// ================================================================

const InterviewerInterviewsStyles =
    () => (

        <style>
            {`

            /* =====================================================
               PAGE
            ===================================================== */

            .interviewer-interviews-page {
                width: 100%;
            }


            /* =====================================================
               PAGE HEADER
            ===================================================== */

            .interviews-page-header {
                display: flex;

                align-items: flex-end;

                justify-content:
                    space-between;

                gap: 20px;

                margin-bottom: 25px;
            }


            .interviews-eyebrow {
                color: #2867E8;

                font-size: 10px;

                font-weight: 800;

                letter-spacing:
                    0.14em;

                margin-bottom: 8px;
            }


            .interviews-page-header h2 {
                margin: 0;

                color: #10254A;

                font-size: 29px;

                font-weight: 750;

                line-height: 1.15;

                letter-spacing:
                    -0.02em;
            }


            .interviews-page-header p {
                margin:
                    8px 0 0;

                color: #637695;

                font-size: 13px;

                line-height: 1.5;
            }


            /* =====================================================
               DASHBOARD BUTTON
            ===================================================== */

            .dashboard-button {
                border: 1px solid #D6E0EF;

                background: #FFFFFF;

                color: #31557D;

                padding:
                    10px 15px;

                border-radius: 8px;

                font-size: 11px;

                font-weight: 650;

                cursor: pointer;

                transition:
                    background 0.18s ease,
                    border-color 0.18s ease,
                    color 0.18s ease;
            }


            .dashboard-button:hover {
                background: #F5F8FD;

                border-color: #BFCFE5;

                color: #2867E8;
            }


            /* =====================================================
               ERROR
            ===================================================== */

            .interviews-error {
                margin-bottom: 20px;

                padding:
                    12px 15px;

                border:
                    1px solid #F1D1D1;

                border-radius: 9px;

                background: #FFF3F3;

                display: flex;

                align-items: center;

                gap: 10px;
            }


            .interviews-error-icon {
                width: 25px;

                height: 25px;

                border-radius: 50%;

                background: #D95353;

                color: #FFFFFF;

                display: flex;

                align-items: center;

                justify-content: center;

                font-size: 12px;

                font-weight: 700;

                flex-shrink: 0;
            }


            .interviews-error p {
                flex: 1;

                margin: 0;

                color: #A13F3F;

                font-size: 12px;
            }


            .interviews-error button {
                border: none;

                background: #D95353;

                color: #FFFFFF;

                padding:
                    7px 12px;

                border-radius: 7px;

                font-size: 11px;

                font-weight: 600;

                cursor: pointer;
            }


            /* =====================================================
               SUMMARY
            ===================================================== */

            .interviews-summary-grid {
                display: grid;

                grid-template-columns:
                    repeat(
                        5,
                        minmax(0, 1fr)
                    );

                gap: 15px;

                margin-bottom: 23px;
            }


            .interviews-summary-card {
                min-height: 88px;

                background: #FFFFFF;

                border:
                    1px solid #DEE5EF;

                border-radius: 10px;

                padding:
                    15px 17px;

                display: flex;

                align-items: center;

                gap: 12px;

                cursor: pointer;

                transition:
                    transform 0.18s ease,
                    box-shadow 0.18s ease,
                    border-color 0.18s ease;
            }


            .interviews-summary-card:hover {
                transform:
                    translateY(-1px);

                box-shadow:
                    0 5px 16px
                    rgba(
                        16,
                        37,
                        74,
                        0.06
                    );
            }


            .interviews-summary-card.summary-active {
                border-color:
                    #7D9CE8;

                box-shadow:
                    0 0 0 2px
                    rgba(
                        40,
                        103,
                        232,
                        0.08
                    );
            }


            .summary-icon {
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


            .summary-icon.total {
                background: #EAF1FF;

                color: #2867E8;
            }


            .summary-icon.scheduled {
                background: #EAF8FF;

                color: #2585C2;
            }


            .summary-icon.rescheduled {
                background: #F1ECFF;

                color: #7253C7;
            }


            .summary-icon.completed {
                background: #EAF8F0;

                color: #29945C;
            }


            .summary-icon.cancelled {
                background: #FFF0F0;

                color: #D64545;
            }


            .interviews-summary-card span {
                display: block;

                color: #6E7F9A;

                font-size: 10px;

                margin-bottom: 5px;
            }


            .interviews-summary-card strong {
                display: block;

                color: #10254A;

                font-size: 22px;

                font-weight: 750;

                line-height: 1;
            }


            /* =====================================================
               TABLE CARD
            ===================================================== */

            .interviews-table-card {
                width: 100%;

                background: #FFFFFF;

                border:
                    1px solid #DEE5EF;

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
               TOOLBAR
            ===================================================== */

            .interviews-table-toolbar {
                min-height: 84px;

                padding:
                    18px 24px;

                border-bottom:
                    1px solid #E6EBF2;

                display: flex;

                align-items: center;

                justify-content:
                    space-between;

                gap: 20px;
            }


            .interviews-table-toolbar h3 {
                margin: 0;

                color: #10254A;

                font-size: 16px;

                font-weight: 700;
            }


            .interviews-table-toolbar p {
                margin:
                    5px 0 0;

                color: #7A89A1;

                font-size: 10px;
            }


            .interviews-toolbar-controls {
                display: flex;

                align-items: center;

                gap: 10px;
            }


            /* =====================================================
               SEARCH
            ===================================================== */

            .interviews-search {
                width: 265px;

                height: 39px;

                border:
                    1px solid #CBD7E8;

                border-radius: 7px;

                background: #FFFFFF;

                display: flex;

                align-items: center;

                gap: 7px;

                padding:
                    0 10px;
            }


            .interviews-search > span {
                color: #8290A5;

                font-size: 18px;

                line-height: 1;
            }


            .interviews-search input {
                flex: 1;

                min-width: 0;

                border: none;

                outline: none;

                background:
                    transparent;

                color: #304763;

                font-size: 11px;
            }


            .interviews-search input::placeholder {
                color: #9AA7B8;
            }


            .clear-search {
                border: none;

                background:
                    transparent;

                color: #8794A6;

                font-size: 17px;

                cursor: pointer;

                line-height: 1;

                padding: 0;
            }


            /* =====================================================
               STATUS FILTER
            ===================================================== */

            .interviews-status-filter {
                height: 39px;

                min-width: 125px;

                padding:
                    0 10px;

                border:
                    1px solid #CBD7E8;

                border-radius: 7px;

                background: #FFFFFF;

                color: #405572;

                font-size: 11px;

                outline: none;

                cursor: pointer;
            }


            /* =====================================================
               TABLE
            ===================================================== */

            .interviews-table-wrapper {
                width: 100%;

                overflow-x: auto;
            }


            .interviews-table-wrapper table {
                width: 100%;

                min-width: 1000px;

                border-collapse:
                    collapse;
            }


            .interviews-table-wrapper thead {
                background: #F8FAFD;
            }


            .interviews-table-wrapper th {
                padding:
                    12px 17px;

                color: #738196;

                font-size: 9px;

                font-weight: 750;

                text-align: left;

                text-transform:
                    uppercase;

                letter-spacing:
                    0.05em;

                border-bottom:
                    1px solid #E5EAF1;

                white-space:
                    nowrap;
            }


            .interviews-table-wrapper td {
                padding:
                    14px 17px;

                border-bottom:
                    1px solid #EDF0F4;

                vertical-align:
                    middle;
            }


            .interviews-table-wrapper tbody tr {
                transition:
                    background 0.15s ease;
            }


            .interviews-table-wrapper tbody tr:hover {
                background:
                    #FAFCFF;
            }


            .interviews-table-wrapper tbody tr:last-child td {
                border-bottom: none;
            }


            /* =====================================================
               CANDIDATE
            ===================================================== */

            .candidate-cell {
                min-width: 190px;

                display: flex;

                align-items: center;

                gap: 10px;
            }


            .candidate-avatar {
                width: 35px;

                height: 35px;

                min-width: 35px;

                border-radius: 50%;

                background: #E8EFFF;

                color: #3157A4;

                display: flex;

                align-items: center;

                justify-content: center;

                font-size: 12px;

                font-weight: 750;
            }


            .candidate-info {
                min-width: 0;

                display: flex;

                flex-direction: column;
            }


            .candidate-info strong {
                color: #263D5A;

                font-size: 11px;

                font-weight: 700;

                white-space:
                    nowrap;
            }


            .candidate-info span {
                margin-top: 3px;

                color: #8995A6;

                font-size: 9px;

                white-space:
                    nowrap;
            }


            /* =====================================================
               JOB
            ===================================================== */

            .job-cell,
            .interview-type-cell,
            .date-time-cell {
                display: flex;

                flex-direction:
                    column;
            }


            .job-cell strong {
                max-width: 190px;

                color: #304763;

                font-size: 11px;

                font-weight: 650;
            }


            .job-cell span,
            .interview-type-cell span,
            .date-time-cell span {
                margin-top: 4px;

                color: #8995A6;

                font-size: 9px;
            }


            /* =====================================================
               INTERVIEW TYPE
            ===================================================== */

            .interview-type-cell strong {
                color: #40556F;

                font-size: 11px;

                font-weight: 650;
            }


            /* =====================================================
               DATE TIME
            ===================================================== */

            .date-time-cell strong {
                color: #304763;

                font-size: 11px;

                font-weight: 650;
            }


            /* =====================================================
               DURATION
            ===================================================== */

            .duration-text {
                color: #617289;

                font-size: 10px;

                white-space:
                    nowrap;
            }


            /* =====================================================
               STATUS
            ===================================================== */

            .status-badge {
                display: inline-flex;

                align-items: center;

                justify-content: center;

                min-width: 78px;

                padding:
                    6px 9px;

                border-radius: 999px;

                font-size: 9px;

                font-weight: 650;

                white-space:
                    nowrap;
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
               VIEW BUTTON
            ===================================================== */

            .view-button {
                border:
                    1px solid #D3DFF1;

                background:
                    #F2F6FF;

                color: #2867E8;

                padding:
                    7px 13px;

                border-radius: 7px;

                font-size: 10px;

                font-weight: 650;

                cursor: pointer;

                transition:
                    background 0.18s ease,
                    border-color 0.18s ease;
            }


            .view-button:hover {
                background: #E7EFFF;

                border-color:
                    #BFCFE8;
            }


            /* =====================================================
               PAGINATION
            ===================================================== */

            .interviews-pagination {
                min-height: 68px;

                padding:
                    14px 24px;

                border-top:
                    1px solid #E6EBF2;

                background:
                    #FFFFFF;

                display: flex;

                align-items: center;

                justify-content:
                    space-between;

                gap: 15px;
            }


            .pagination-info {
                color: #7A89A1;

                font-size: 10px;

                white-space:
                    nowrap;
            }


            .pagination-info strong {
                color: #405572;

                font-weight: 700;
            }


            .pagination-controls {
                display: flex;

                align-items: center;

                gap: 6px;
            }


            .pagination-button {
                height: 32px;

                padding:
                    0 11px;

                border:
                    1px solid #D6E0EF;

                border-radius: 6px;

                background:
                    #FFFFFF;

                color: #405572;

                font-size: 10px;

                font-weight: 650;

                cursor: pointer;

                transition:
                    background 0.18s ease,
                    border-color 0.18s ease,
                    color 0.18s ease;
            }


            .pagination-button:hover:not(:disabled) {
                background:
                    #F2F6FF;

                border-color:
                    #BFCFE8;

                color:
                    #2867E8;
            }


            .pagination-button:disabled {
                opacity: 0.45;

                cursor:
                    not-allowed;
            }


            .pagination-pages {
                display: flex;

                align-items: center;

                gap: 4px;
            }


            .pagination-page {
                width: 32px;

                height: 32px;

                border:
                    1px solid #D6E0EF;

                border-radius: 6px;

                background:
                    #FFFFFF;

                color: #405572;

                font-size: 10px;

                font-weight: 650;

                cursor: pointer;

                transition:
                    background 0.18s ease,
                    border-color 0.18s ease,
                    color 0.18s ease;
            }


            .pagination-page:hover {
                background:
                    #F2F6FF;

                border-color:
                    #BFCFE8;

                color:
                    #2867E8;
            }


            .pagination-page-active {
                background:
                    #2867E8;

                border-color:
                    #2867E8;

                color:
                    #FFFFFF;
            }


            .pagination-page-active:hover {
                background:
                    #205BD4;

                border-color:
                    #205BD4;

                color:
                    #FFFFFF;
            }


            /* =====================================================
               EMPTY
            ===================================================== */

            .interviews-empty-state {
                min-height: 280px;

                padding:
                    55px 20px;

                display: flex;

                flex-direction: column;

                align-items: center;

                justify-content: center;

                text-align: center;
            }


            .empty-icon {
                width: 48px;

                height: 48px;

                margin-bottom: 12px;

                border-radius: 10px;

                background: #EAF1FF;

                color: #2867E8;

                display: flex;

                align-items: center;

                justify-content: center;

                font-size: 21px;
            }


            .interviews-empty-state h3 {
                margin:
                    0 0 6px;

                color: #10254A;

                font-size: 15px;

                font-weight: 700;
            }


            .interviews-empty-state p {
                margin:
                    0 0 16px;

                color: #7A89A1;

                font-size: 11px;
            }


            .reset-button {
                border: none;

                background: #2867E8;

                color: #FFFFFF;

                padding:
                    9px 15px;

                border-radius: 7px;

                font-size: 10px;

                font-weight: 650;

                cursor: pointer;
            }


            .reset-button:hover {
                background: #205BD4;
            }


            /* =====================================================
               LOADING
            ===================================================== */

            .interviewer-list-loading {
                min-height: 500px;

                display: flex;

                flex-direction: column;

                align-items: center;

                justify-content: center;
            }


            .interviewer-loading-spinner {
                width: 32px;

                height: 32px;

                border:
                    3px solid #E2E9F5;

                border-top-color:
                    #2867E8;

                border-radius: 50%;

                animation:
                    interviewerListSpin
                    0.8s linear infinite;

                margin-bottom: 12px;
            }


            .interviewer-list-loading p {
                margin: 0;

                color: #71819B;

                font-size: 11px;
            }


            @keyframes interviewerListSpin {

                to {
                    transform:
                        rotate(360deg);
                }

            }


            /* =====================================================
               RESPONSIVE
            ===================================================== */

            @media (max-width: 1200px) {

                .interviews-summary-grid {
                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0, 1fr)
                        );
                }

            }


            @media (max-width: 900px) {

                .interviews-table-toolbar {
                    flex-direction:
                        column;

                    align-items:
                        flex-start;
                }


                .interviews-toolbar-controls {
                    width: 100%;
                }


                .interviews-search {
                    flex: 1;
                }


                .interviews-pagination {
                    align-items:
                        flex-start;

                    flex-direction:
                        column;
                }


                .pagination-controls {
                    width: 100%;

                    justify-content:
                        space-between;
                }

            }


            @media (max-width: 700px) {

                .interviews-page-header {
                    flex-direction:
                        column;

                    align-items:
                        flex-start;
                }


                .interviews-summary-grid {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }


                .interviews-toolbar-controls {
                    flex-direction:
                        column;

                    align-items:
                        stretch;
                }


                .interviews-search {
                    width: 100%;
                }


                .interviews-status-filter {
                    width: 100%;
                }


                .pagination-controls {
                    flex-wrap:
                        wrap;

                    justify-content:
                        center;
                }

            }


            @media (max-width: 480px) {

                .interviews-summary-grid {
                    grid-template-columns:
                        1fr;
                }


                .pagination-info {
                    white-space:
                        normal;

                    text-align:
                        center;

                    width: 100%;
                }


                .interviews-pagination {
                    align-items:
                        center;
                }

            }

            `}
        </style>

    );


// ================================================================
// EXPORT
// ================================================================

export default InterviewerInterviews;