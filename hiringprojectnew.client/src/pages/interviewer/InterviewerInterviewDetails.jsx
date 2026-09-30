import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import InterviewerLayout from "../../components/InterviewerLayout";

// ================================================================
// INTERVIEWER INTERVIEW DETAILS
// ================================================================

const InterviewerInterviewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [interview, setInterview] = useState(null);
    const [evaluationExists, setEvaluationExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================================
    // LOAD INTERVIEW
    // ============================================================

    useEffect(() => {
        loadInterview();
    }, [id]);

    const loadInterview = async () => {
        try {
            setLoading(true);
            setError("");
            setEvaluationExists(false);

            const response = await api.get(
                `/Interviewer/interviews/${id}`
            );

            const interviewData = response.data;

            setInterview(interviewData);

            // ----------------------------------------------------
            // CHECK WHETHER COMPLETED INTERVIEW HAS EVALUATION
            // ----------------------------------------------------

            if (
                interviewData?.status?.toLowerCase() ===
                "completed"
            ) {
                try {
                    await api.get(
                        `/InterviewerEvaluation/${id}`
                    );

                    setEvaluationExists(true);
                } catch (evaluationError) {
                    // 404 means evaluation has not been submitted yet.
                    if (
                        evaluationError.response?.status !==
                        404
                    ) {
                        console.error(
                            "Error checking interview evaluation:",
                            evaluationError
                        );
                    }

                    setEvaluationExists(false);
                }
            }
        } catch (err) {
            console.error(
                "Error loading interview details:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load interview details."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (dateString) => {
        if (!dateString) {
            return "-";
        }

        return new Date(dateString).toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };

    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (dateString) => {
        if (!dateString) {
            return "-";
        }

        return new Date(dateString).toLocaleTimeString(
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

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "scheduled":
                return "details-status-scheduled";

            case "rescheduled":
                return "details-status-rescheduled";

            case "completed":
                return "details-status-completed";

            case "cancelled":
                return "details-status-cancelled";

            case "no show":
                return "details-status-no-show";

            default:
                return "details-status-default";
        }
    };

    // ============================================================
    // JOIN INTERVIEW CONDITION
    // ============================================================

    const canJoinInterview =
        Boolean(
            interview?.meetingLink &&
            [
                "scheduled",
                "rescheduled",
            ].includes(
                interview.status?.toLowerCase()
            )
        );

    // ============================================================
    // EVALUATION CONDITION
    // ============================================================

    const canEvaluateInterview =
        interview?.status?.toLowerCase() ===
        "completed";

    // ============================================================
    // OPEN EVALUATION
    // ============================================================

    const handleEvaluateCandidate = () => {
        navigate(
            `/interviewer/interviews/${id}/evaluation`
        );
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <InterviewerLayout activePage="interviews">
                <div className="details-loading">
                    <div className="details-spinner"></div>

                    <p>
                        Loading interview details...
                    </p>
                </div>

                <InterviewerInterviewDetailsStyles />
            </InterviewerLayout>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (error || !interview) {
        return (
            <InterviewerLayout activePage="interviews">
                <div className="details-error-wrapper">
                    <div className="details-error-card">

                        <div className="details-error-icon">
                            !
                        </div>

                        <h3>
                            Interview Not Found
                        </h3>

                        <p>
                            {error ||
                                "The requested interview could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/interviewer/interviews"
                                )
                            }
                        >
                            ← Back to Interviews
                        </button>

                    </div>
                </div>

                <InterviewerInterviewDetailsStyles />
            </InterviewerLayout>
        );
    }

    // ============================================================
    // MAIN
    // ============================================================

    return (
        <InterviewerLayout activePage="interviews">

            <div className="interviewer-details-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="details-page-header">

                    <div>
                        <div className="details-eyebrow">
                            INTERVIEWER PORTAL
                        </div>

                        <h2>
                            Interview Details
                        </h2>

                        <p>
                            View the details of your assigned
                            interview.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="details-back-button"
                        onClick={() =>
                            navigate(
                                "/interviewer/interviews"
                            )
                        }
                    >
                        ← My Interviews
                    </button>

                </div>

                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <div className="details-main-card">

                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="details-card-header">

                        <div className="details-header-left">

                            <div className="details-job-icon">
                                ▣
                            </div>

                            <div>

                                <h3>
                                    {
                                        interview.jobTitle ||
                                        "Interview"
                                    }
                                </h3>

                                <p>
                                    {
                                        interview.interviewType ||
                                        "Interview"
                                    }
                                </p>

                            </div>

                        </div>

                        <span
                            className={`details-status-badge ${getStatusClass(
                                interview.status
                            )}`}
                        >
                            {
                                interview.status ||
                                "Unknown"
                            }
                        </span>

                    </div>

                    {/* =================================================
                        INTERVIEW INFORMATION
                    ================================================= */}

                    <div className="details-section">

                        <div className="details-section-title">

                            <span className="section-title-icon">
                                ◷
                            </span>

                            <div>

                                <h4>
                                    Interview Information
                                </h4>

                                <p>
                                    Schedule and meeting details
                                </p>

                            </div>

                        </div>

                        <div className="details-info-grid">

                            {/* DATE */}

                            <div className="details-info-item">

                                <span className="details-info-label">
                                    DATE
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            interview.scheduledAt
                                        )
                                    }
                                </strong>

                            </div>

                            {/* TIME */}

                            <div className="details-info-item">

                                <span className="details-info-label">
                                    TIME
                                </span>

                                <strong>
                                    {
                                        formatTime(
                                            interview.scheduledAt
                                        )
                                    }
                                </strong>

                            </div>

                            {/* DURATION */}

                            <div className="details-info-item">

                                <span className="details-info-label">
                                    DURATION
                                </span>

                                <strong>
                                    {
                                        interview.durationMinutes
                                    }{" "}
                                    minutes
                                </strong>

                            </div>

                            {/* INTERVIEW TYPE */}

                            <div className="details-info-item">

                                <span className="details-info-label">
                                    INTERVIEW TYPE
                                </span>

                                <strong>
                                    {
                                        interview.interviewType ||
                                        "-"
                                    }
                                </strong>

                            </div>

                            {/* LOCATION */}

                            <div className="details-info-item">

                                <span className="details-info-label">
                                    LOCATION
                                </span>

                                <strong>
                                    {
                                        interview.location ||
                                        "Online"
                                    }
                                </strong>

                            </div>

                            {/* APPLICATION ID */}

                            <div className="details-info-item">

                                <span className="details-info-label">
                                    APPLICATION ID
                                </span>

                                <strong>
                                    #
                                    {
                                        interview.applicationId
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        MEETING INFORMATION
                    ================================================= */}

                    <div className="details-section">

                        <div className="details-section-title">

                            <span className="section-title-icon">
                                ◉
                            </span>

                            <div>

                                <h4>
                                    Meeting Information
                                </h4>

                                <p>
                                    Online meeting access
                                </p>

                            </div>

                        </div>

                        {canJoinInterview ? (

                            <div className="meeting-active-card">

                                <div>

                                    <strong>
                                        Online interview
                                    </strong>

                                    <span>
                                        The meeting link is available
                                        for this interview.
                                    </span>

                                </div>

                                <a
                                    href={
                                        interview.meetingLink
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="join-interview-button"
                                >
                                    Join Interview
                                    <span>
                                        →
                                    </span>
                                </a>

                            </div>

                        ) : (

                            <div className="meeting-inactive-card">

                                <div className="meeting-inactive-icon">
                                    ×
                                </div>

                                <div>

                                    <strong>
                                        Meeting link unavailable
                                    </strong>

                                    <span>
                                        This interview is not currently
                                        available to join.
                                    </span>

                                </div>

                            </div>

                        )}

                    </div>

                    {/* =================================================
                        CANDIDATE INFORMATION
                    ================================================= */}

                    <div className="details-section">

                        <div className="details-section-title">

                            <span className="section-title-icon">
                                ♙
                            </span>

                            <div>

                                <h4>
                                    Candidate Information
                                </h4>

                                <p>
                                    Candidate assigned to this interview
                                </p>

                            </div>

                        </div>

                        <div className="candidate-details-card">

                            <div className="candidate-details-avatar">
                                {
                                    interview.candidateName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                    "C"
                                }
                            </div>

                            <div className="candidate-details-info">

                                <strong>
                                    {
                                        interview.candidateName ||
                                        "Unknown Candidate"
                                    }
                                </strong>

                                <span>
                                    {
                                        interview.candidateEmail ||
                                        "-"
                                    }
                                </span>

                                <small>
                                    Candidate ID:{" "}
                                    {
                                        interview.candidateId ||
                                        "-"
                                    }
                                </small>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        INTERVIEW NOTES
                    ================================================= */}

                    {interview.notes && (

                        <div className="details-section">

                            <div className="details-section-title">

                                <span className="section-title-icon">
                                    ▤
                                </span>

                                <div>

                                    <h4>
                                        Interview Notes
                                    </h4>

                                    <p>
                                        Notes associated with this interview
                                    </p>

                                </div>

                            </div>

                            <div className="notes-card">

                                <p>
                                    {
                                        interview.notes
                                    }
                                </p>

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        INTERVIEWER INFORMATION
                    ================================================= */}

                    <div className="details-section">

                        <div className="details-section-title">

                            <span className="section-title-icon">
                                ♙
                            </span>

                            <div>

                                <h4>
                                    Interviewer Information
                                </h4>

                                <p>
                                    Interview assignment details
                                </p>

                            </div>

                        </div>

                        <div className="interviewer-details-card">

                            <div className="interviewer-details-avatar">
                                {
                                    interview.interviewerName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                    "I"
                                }
                            </div>

                            <div>

                                <strong>
                                    {
                                        interview.interviewerName ||
                                        "Interviewer"
                                    }
                                </strong>

                                <span>
                                    {
                                        interview.interviewerEmail ||
                                        "-"
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="details-footer">

                        <button
                            type="button"
                            className="footer-back-button"
                            onClick={() =>
                                navigate(
                                    "/interviewer/interviews"
                                )
                            }
                        >
                            ← Back to My Interviews
                        </button>

                        {/* ------------------------------------------------
                            COMPLETED INTERVIEW
                            - No evaluation -> Evaluate Candidate
                            - Evaluation exists -> View Evaluation
                        ------------------------------------------------ */}

                        {canEvaluateInterview && (
                            <button
                                type="button"
                                className="evaluate-candidate-button"
                                onClick={
                                    handleEvaluateCandidate
                                }
                            >
                                {
                                    evaluationExists
                                        ? "View Evaluation"
                                        : "Evaluate Candidate"
                                }

                                <span>
                                    →
                                </span>
                            </button>
                        )}

                    </div>

                </div>

            </div>

            <InterviewerInterviewDetailsStyles />

        </InterviewerLayout>
    );
};


// ================================================================
// STYLES
// ================================================================

const InterviewerInterviewDetailsStyles = () => (

    <style>
        {`

            /* =====================================================
               PAGE
            ===================================================== */

            .interviewer-details-page {
                width: 100%;
            }


            /* =====================================================
               PAGE HEADER
            ===================================================== */

            .details-page-header {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 20px;
                margin-bottom: 27px;
            }


            .details-eyebrow {
                color: #2867E8;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.14em;
                margin-bottom: 9px;
            }


            .details-page-header h2 {
                margin: 0;
                color: #10254A;
                font-size: 30px;
                font-weight: 750;
                line-height: 1.15;
                letter-spacing: -0.02em;
            }


            .details-page-header p {
                margin: 9px 0 0;
                color: #637695;
                font-size: 13px;
                line-height: 1.5;
            }


            /* =====================================================
               BACK BUTTON
            ===================================================== */

            .details-back-button {
                border: 1px solid #D6E0EF;
                background: #FFFFFF;
                color: #31557D;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 650;
                cursor: pointer;
                transition:
                    background 0.18s ease,
                    border-color 0.18s ease,
                    color 0.18s ease;
            }


            .details-back-button:hover {
                background: #F5F8FD;
                border-color: #BFCFE5;
                color: #2867E8;
            }


            /* =====================================================
               MAIN CARD
            ===================================================== */

            .details-main-card {
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
               CARD HEADER
            ===================================================== */

            .details-card-header {
                min-height: 98px;
                padding: 22px 25px;
                border-bottom: 1px solid #E6EBF2;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
            }


            .details-header-left {
                display: flex;
                align-items: center;
                gap: 14px;
            }


            .details-job-icon {
                width: 48px;
                height: 48px;
                min-width: 48px;
                border-radius: 10px;
                background: #EAF1FF;
                color: #2867E8;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 700;
            }


            .details-header-left h3 {
                margin: 0;
                color: #10254A;
                font-size: 18px;
                font-weight: 700;
                line-height: 1.3;
            }


            .details-header-left p {
                margin: 5px 0 0;
                color: #74849C;
                font-size: 11px;
                line-height: 1.3;
            }


            /* =====================================================
               STATUS
            ===================================================== */

            .details-status-badge {
                padding: 8px 14px;
                border-radius: 999px;
                font-size: 10px;
                font-weight: 650;
                white-space: nowrap;
            }


            .details-status-scheduled {
                background: #EAF2FF;
                color: #2867E8;
            }


            .details-status-rescheduled {
                background: #F1ECFF;
                color: #7253C7;
            }


            .details-status-completed {
                background: #EAF8F0;
                color: #29945C;
            }


            .details-status-cancelled {
                background: #FFF0F0;
                color: #D64545;
            }


            .details-status-no-show {
                background: #FFF4E5;
                color: #C77D20;
            }


            .details-status-default {
                background: #F0F2F5;
                color: #687995;
            }


            /* =====================================================
               SECTIONS
            ===================================================== */

            .details-section {
                padding: 26px 25px;
                border-bottom: 1px solid #EDF0F4;
            }


            .details-section-title {
                display: flex;
                align-items: center;
                gap: 11px;
                margin-bottom: 19px;
            }


            .section-title-icon {
                width: 35px;
                height: 35px;
                min-width: 35px;
                border-radius: 8px;
                background: #EEF3FF;
                color: #2867E8;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: 700;
            }


            .details-section-title h4 {
                margin: 0;
                color: #10254A;
                font-size: 15px;
                font-weight: 700;
                line-height: 1.3;
            }


            .details-section-title p {
                margin: 4px 0 0;
                color: #8491A3;
                font-size: 11px;
                line-height: 1.3;
            }


            /* =====================================================
               INTERVIEW INFORMATION
            ===================================================== */

            .details-info-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
                gap: 20px;
                padding: 19px;
                border: 1px solid #E4EAF2;
                border-radius: 9px;
                background: #FAFBFD;
            }


            .details-info-item {
                min-width: 0;
            }


            .details-info-label {
                display: block;
                color: #8491A3;
                font-size: 10px;
                font-weight: 750;
                letter-spacing: 0.06em;
                margin-bottom: 7px;
            }


            .details-info-item strong {
                display: block;
                color: #304763;
                font-size: 13px;
                font-weight: 650;
                line-height: 1.3;
            }


            /* =====================================================
               MEETING ACTIVE
            ===================================================== */

            .meeting-active-card {
                min-height: 78px;
                padding: 15px 17px;
                border: 1px solid #D9E5F7;
                border-radius: 9px;
                background: #F5F8FF;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
            }


            .meeting-active-card > div {
                display: flex;
                flex-direction: column;
            }


            .meeting-active-card strong {
                color: #304763;
                font-size: 13px;
                font-weight: 650;
                line-height: 1.3;
            }


            .meeting-active-card span {
                margin-top: 5px;
                color: #7A89A1;
                font-size: 11px;
                line-height: 1.4;
            }


            /* =====================================================
               JOIN BUTTON
            ===================================================== */

            .join-interview-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                text-decoration: none;
                background: #2867E8;
                color: #FFFFFF;
                padding: 10px 15px;
                border-radius: 7px;
                font-size: 11px;
                font-weight: 650;
                white-space: nowrap;
                transition:
                    background 0.18s ease;
            }


            .join-interview-button:hover {
                background: #205BD4;
            }


            /* =====================================================
               MEETING INACTIVE
            ===================================================== */

            .meeting-inactive-card {
                min-height: 72px;
                padding: 14px 16px;
                border: 1px solid #E7EAF0;
                border-radius: 9px;
                background: #FAFBFC;
                display: flex;
                align-items: center;
                gap: 12px;
            }


            .meeting-inactive-icon {
                width: 35px;
                height: 35px;
                min-width: 35px;
                border-radius: 8px;
                background: #F1F3F6;
                color: #8995A6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }


            .meeting-inactive-card strong {
                display: block;
                color: #56677E;
                font-size: 12px;
                line-height: 1.3;
            }


            .meeting-inactive-card span {
                display: block;
                margin-top: 4px;
                color: #8995A6;
                font-size: 11px;
                line-height: 1.4;
            }


            /* =====================================================
               CANDIDATE
            ===================================================== */

            .candidate-details-card {
                padding: 17px 18px;
                border: 1px solid #E4EAF2;
                border-radius: 9px;
                background: #FAFBFD;
                display: flex;
                align-items: center;
                gap: 13px;
            }


            .candidate-details-avatar {
                width: 45px;
                height: 45px;
                min-width: 45px;
                border-radius: 50%;
                background: #E8EFFF;
                color: #3157A4;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: 750;
            }


            .candidate-details-info {
                display: flex;
                flex-direction: column;
            }


            .candidate-details-info strong {
                color: #304763;
                font-size: 13px;
                font-weight: 700;
                line-height: 1.3;
            }


            .candidate-details-info span {
                margin-top: 4px;
                color: #71819B;
                font-size: 11px;
                line-height: 1.3;
            }


            .candidate-details-info small {
                margin-top: 4px;
                color: #98A4B4;
                font-size: 10px;
                line-height: 1.3;
            }


            /* =====================================================
               NOTES
            ===================================================== */

            .notes-card {
                padding: 17px 18px;
                border: 1px solid #E4EAF2;
                border-radius: 9px;
                background: #FAFBFD;
            }


            .notes-card p {
                margin: 0;
                color: #56677E;
                font-size: 12px;
                line-height: 1.6;
            }


            /* =====================================================
               INTERVIEWER INFORMATION
            ===================================================== */

            .interviewer-details-card {
                padding: 17px 18px;
                border: 1px solid #E4EAF2;
                border-radius: 9px;
                background: #FAFBFD;
                display: flex;
                align-items: center;
                gap: 13px;
            }


            .interviewer-details-avatar {
                width: 45px;
                height: 45px;
                min-width: 45px;
                border-radius: 50%;
                background: #EAF1FF;
                color: #2867E8;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: 750;
            }


            .interviewer-details-card strong {
                display: block;
                color: #304763;
                font-size: 13px;
                font-weight: 700;
                line-height: 1.3;
            }


            .interviewer-details-card span {
                display: block;
                margin-top: 4px;
                color: #71819B;
                font-size: 11px;
                line-height: 1.3;
            }


            /* =====================================================
               FOOTER
            ===================================================== */

            .details-footer {
                min-height: 75px;
                padding: 16px 25px;
                background: #FAFBFD;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }


            .footer-back-button {
                border: 1px solid #D6E0EF;
                background: #FFFFFF;
                color: #31557D;
                padding: 10px 15px;
                border-radius: 7px;
                font-size: 11px;
                font-weight: 650;
                cursor: pointer;
                transition:
                    background 0.18s ease,
                    color 0.18s ease;
            }


            .footer-back-button:hover {
                background: #F5F8FD;
                color: #2867E8;
            }


            /* =====================================================
               EVALUATE / VIEW EVALUATION BUTTON
            ===================================================== */

            .evaluate-candidate-button {
                border: none;
                background: #2867E8;
                color: #FFFFFF;
                padding: 10px 16px;
                border-radius: 7px;
                font-size: 11px;
                font-weight: 650;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                transition:
                    background 0.18s ease,
                    transform 0.18s ease;
            }


            .evaluate-candidate-button:hover {
                background: #205BD4;
                transform: translateY(-1px);
            }


            .evaluate-candidate-button span {
                font-size: 14px;
                line-height: 1;
            }


            /* =====================================================
               LOADING
            ===================================================== */

            .details-loading {
                min-height: 500px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }


            .details-spinner {
                width: 34px;
                height: 34px;
                border: 3px solid #E2E9F5;
                border-top-color: #2867E8;
                border-radius: 50%;
                animation:
                    detailsSpin
                    0.8s linear infinite;
                margin-bottom: 13px;
            }


            .details-loading p {
                margin: 0;
                color: #71819B;
                font-size: 12px;
            }


            @keyframes detailsSpin {
                to {
                    transform: rotate(360deg);
                }
            }


            /* =====================================================
               ERROR
            ===================================================== */

            .details-error-wrapper {
                min-height: 500px;
                display: flex;
                align-items: center;
                justify-content: center;
            }


            .details-error-card {
                width: min(430px, 100%);
                padding: 35px;
                border: 1px solid #DEE5EF;
                border-radius: 11px;
                background: #FFFFFF;
                text-align: center;
            }


            .details-error-icon {
                width: 46px;
                height: 46px;
                margin: 0 auto 14px;
                border-radius: 50%;
                background: #FFF0F0;
                color: #D64545;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 19px;
                font-weight: 750;
            }


            .details-error-card h3 {
                margin: 0 0 8px;
                color: #10254A;
                font-size: 17px;
            }


            .details-error-card p {
                margin: 0 0 18px;
                color: #71819B;
                font-size: 12px;
                line-height: 1.5;
            }


            .details-error-card button {
                border: none;
                background: #2867E8;
                color: #FFFFFF;
                padding: 10px 16px;
                border-radius: 7px;
                font-size: 11px;
                font-weight: 650;
                cursor: pointer;
            }


            /* =====================================================
               RESPONSIVE
            ===================================================== */

            @media (max-width: 900px) {

                .details-info-grid {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

            }


            @media (max-width: 650px) {

                .details-page-header {
                    flex-direction: column;
                    align-items: flex-start;
                }


                .details-card-header {
                    align-items: flex-start;
                    flex-direction: column;
                }


                .details-info-grid {
                    grid-template-columns: 1fr;
                }


                .meeting-active-card {
                    align-items: flex-start;
                    flex-direction: column;
                }


                .join-interview-button {
                    width: 100%;
                }


                .details-footer {
                    align-items: stretch;
                    flex-direction: column;
                }


                .footer-back-button,
                .evaluate-candidate-button {
                    width: 100%;
                }

            }

        `}
    </style>
);


// ================================================================
// EXPORT
// ================================================================

export default InterviewerInterviewDetails;