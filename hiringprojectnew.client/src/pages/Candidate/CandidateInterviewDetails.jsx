import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateLayout from "../../components/CandidateLayout";
import api from "../../services/api";

const CandidateInterviewDetails = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadInterview();
    }, [interviewId]);

    const loadInterview = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/CandidateInterview/${interviewId}`
            );

            setInterview(response.data);
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

    const formatDate = (dateString) => {
        if (!dateString) {
            return "Not available";
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

    const formatTime = (dateString) => {
        if (!dateString) {
            return "Not available";
        }

        return new Date(dateString).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "scheduled":
                return "status-scheduled";

            case "completed":
                return "status-completed";

            case "cancelled":
                return "status-cancelled";

            case "rescheduled":
                return "status-rescheduled";

            case "no show":
                return "status-no-show";

            default:
                return "status-default";
        }
    };

    if (loading) {
        return (
            <CandidateLayout activePage="interviews">
                <div className="interview-details-page">
                    <div className="state-card">
                        <div className="loader"></div>

                        <p>
                            Loading interview details...
                        </p>
                    </div>
                </div>

                <style>{`
                    .interview-details-page {
                        padding: 28px 32px;
                        color: #172033;
                    }

                    .state-card {
                        min-height: 400px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        background: #ffffff;
                        border: 1px solid #e4e9f1;
                        border-radius: 14px;
                    }

                    .state-card p {
                        color: #737d8e;
                        font-size: 14px;
                    }

                    .loader {
                        width: 34px;
                        height: 34px;
                        border: 3px solid #e4e9f1;
                        border-top-color: #2d6ee8;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin-bottom: 14px;
                    }

                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </CandidateLayout>
        );
    }

    if (error || !interview) {
        return (
            <CandidateLayout activePage="interviews">
                <div className="interview-details-page">
                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/candidate/interviews"
                            )
                        }
                    >
                        ← Back to Interviews
                    </button>

                    <div className="state-card error-state">
                        <div className="error-icon">
                            ⚠
                        </div>

                        <h2>
                            Interview Not Found
                        </h2>

                        <p>
                            {error ||
                                "The requested interview could not be found."}
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/candidate/interviews"
                                )
                            }
                        >
                            View My Interviews
                        </button>
                    </div>
                </div>

                <style>{`
                    .interview-details-page {
                        padding: 28px 32px;
                        color: #172033;
                    }

                    .back-button {
                        border: none;
                        background: transparent;
                        color: #2d6ee8;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        padding: 0;
                        margin-bottom: 22px;
                    }

                    .state-card {
                        min-height: 400px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        background: #ffffff;
                        border: 1px solid #e4e9f1;
                        border-radius: 14px;
                        padding: 40px;
                    }

                    .error-icon {
                        width: 58px;
                        height: 58px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff2f2;
                        border-radius: 50%;
                        font-size: 25px;
                        margin-bottom: 15px;
                    }

                    .state-card h2 {
                        margin: 0 0 8px;
                        color: #172033;
                    }

                    .state-card p {
                        max-width: 500px;
                        color: #737d8e;
                        line-height: 1.6;
                        font-size: 14px;
                    }

                    .primary-button {
                        margin-top: 15px;
                        border: none;
                        border-radius: 7px;
                        padding: 10px 18px;
                        background: #2d6ee8;
                        color: #ffffff;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                    }
                `}</style>
            </CandidateLayout>
        );
    }

    return (
        <CandidateLayout activePage="interviews">
            <div className="interview-details-page">

                {/* HEADER */}

                <div className="details-header">
                    <div>
                        <button
                            className="back-button"
                            onClick={() =>
                                navigate(
                                    "/candidate/interviews"
                                )
                            }
                        >
                            ← Back to Interviews
                        </button>

                        <div className="page-label">
                            INTERVIEW DETAILS
                        </div>

                        <h1>
                            {interview.jobTitle ||
                                "Interview"}
                        </h1>

                        <p>
                            Review the details of your
                            scheduled interview.
                        </p>
                    </div>

                    <span
                        className={`status-badge ${getStatusClass(
                            interview.status
                        )}`}
                    >
                        {interview.status ||
                            "Scheduled"}
                    </span>
                </div>

                {/* MAIN CONTENT */}

                <div className="details-grid">

                    {/* SCHEDULE CARD */}

                    <div className="details-card schedule-card">
                        <div className="card-title">
                            <span className="title-icon">
                                📅
                            </span>

                            <div>
                                <h2>
                                    Interview Schedule
                                </h2>

                                <p>
                                    Your interview timing
                                </p>
                            </div>
                        </div>

                        <div className="schedule-content">

                            <div className="schedule-item">
                                <span>
                                    Date
                                </span>

                                <strong>
                                    {formatDate(
                                        interview.scheduledAt
                                    )}
                                </strong>
                            </div>

                            <div className="schedule-item">
                                <span>
                                    Time
                                </span>

                                <strong>
                                    {formatTime(
                                        interview.scheduledAt
                                    )}
                                </strong>
                            </div>

                            <div className="schedule-item">
                                <span>
                                    Duration
                                </span>

                                <strong>
                                    {
                                        interview.durationMinutes
                                    }{" "}
                                    minutes
                                </strong>
                            </div>

                            <div className="schedule-item">
                                <span>
                                    Interview Type
                                </span>

                                <strong>
                                    {
                                        interview.interviewType
                                    }
                                </strong>
                            </div>

                        </div>
                    </div>

                    {/* INTERVIEWER CARD */}

                    <div className="details-card">
                        <div className="card-title">
                            <span className="title-icon">
                                👤
                            </span>

                            <div>
                                <h2>
                                    Interviewer
                                </h2>

                                <p>
                                    Interview contact
                                </p>
                            </div>
                        </div>

                        <div className="interviewer-detail">
                            <div className="large-avatar">
                                {(
                                    interview.interviewerName ||
                                    "I"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h3>
                                    {interview.interviewerName ||
                                        "Not specified"}
                                </h3>

                                {interview.interviewerEmail && (
                                    <p>
                                        {
                                            interview.interviewerEmail
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MEETING INFORMATION */}

                    <div className="details-card">
                        <div className="card-title">
                            <span className="title-icon">
                                🌐
                            </span>

                            <div>
                                <h2>
                                    Meeting Information
                                </h2>

                                <p>
                                    How to attend the
                                    interview
                                </p>
                            </div>
                        </div>

                        <div className="meeting-content">

                            {interview.meetingLink &&
                                [
                                    "scheduled",
                                    "rescheduled",
                                ].includes(
                                    interview.status?.toLowerCase()
                                ) && (
                                    <div className="meeting-row">
                                        <span>
                                            Meeting Link
                                        </span>

                                        <a
                                            href={
                                                interview.meetingLink
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="meeting-link"
                                        >
                                            Join Online Interview
                                            ↗
                                        </a>
                                    </div>
                                )}

                            {interview.location && (
                                <div className="meeting-row">
                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        📍{" "}
                                        {
                                            interview.location
                                        }
                                    </strong>
                                </div>
                            )}

                            {!interview.meetingLink &&
                                !interview.location && (
                                    <div className="no-meeting-info">
                                        No meeting location or
                                        online link has been
                                        provided.
                                    </div>
                                )}

                            {interview.meetingLink &&
                                ![
                                    "scheduled",
                                    "rescheduled",
                                ].includes(
                                    interview.status?.toLowerCase()
                                ) &&
                                !interview.location && (
                                    <div className="no-meeting-info">
                                        The online interview link
                                        is no longer available
                                        because this interview is
                                        {interview.status
                                            ? ` ${interview.status.toLowerCase()}`
                                            : " no longer active"}
                                        .
                                    </div>
                                )}

                        </div>
                    </div>

                    {/* NOTES */}

                    <div className="details-card">
                        <div className="card-title">
                            <span className="title-icon">
                                📝
                            </span>

                            <div>
                                <h2>
                                    Interview Notes
                                </h2>

                                <p>
                                    Additional information
                                </p>
                            </div>
                        </div>

                        <div className="notes-content">
                            {interview.notes ? (
                                <p>
                                    {interview.notes}
                                </p>
                            ) : (
                                <p className="muted-text">
                                    No additional notes
                                    have been provided.
                                </p>
                            )}
                        </div>
                    </div>

                </div>

                {/* BOTTOM ACTION */}

                <div className="bottom-actions">

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/candidate/interviews"
                            )
                        }
                    >
                        ← Back to Interviews
                    </button>

                    {interview.meetingLink &&
                        [
                            "scheduled",
                            "rescheduled",
                        ].includes(
                            interview.status?.toLowerCase()
                        ) && (
                            <a
                                href={
                                    interview.meetingLink
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="join-interview-button"
                            >
                                Join Interview ↗
                            </a>
                        )}

                </div>

            </div>

            <style>{`
                .interview-details-page {
                    padding: 28px 32px;
                    color: #172033;
                    max-width: 1250px;
                }

                .details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 20px;
                    margin-bottom: 26px;
                }

                .back-button {
                    border: none;
                    background: transparent;
                    color: #2d6ee8;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 17px;
                }

                .page-label {
                    color: #2d6ee8;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.8px;
                    margin-bottom: 6px;
                }

                .details-header h1 {
                    margin: 0 0 7px;
                    font-size: 30px;
                    color: #172033;
                }

                .details-header p {
                    margin: 0;
                    color: #697386;
                    font-size: 14px;
                }

                .status-badge {
                    padding: 7px 13px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .status-scheduled {
                    background: #eaf3ff;
                    color: #2563c7;
                }

                .status-completed {
                    background: #eaf8f0;
                    color: #20834c;
                }

                .status-cancelled {
                    background: #fff0f0;
                    color: #c43d3d;
                }

                .status-rescheduled {
                    background: #fff6df;
                    color: #9b6a00;
                }

                .status-default {
                    background: #f1f3f6;
                    color: #667085;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                    gap: 20px;
                }

                .details-card {
                    background: #ffffff;
                    border: 1px solid #e4e9f1;
                    border-radius: 14px;
                    padding: 22px;
                }

                .schedule-card {
                    grid-column: span 2;
                }

                .card-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 17px;
                    border-bottom: 1px solid #edf0f4;
                }

                .title-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eef5ff;
                    border-radius: 9px;
                    font-size: 18px;
                }

                .card-title h2 {
                    margin: 0 0 3px;
                    font-size: 16px;
                    color: #172033;
                }

                .card-title p {
                    margin: 0;
                    font-size: 12px;
                    color: #8a93a3;
                }

                .schedule-content {
                    display: grid;
                    grid-template-columns:
                        repeat(4, 1fr);
                    gap: 20px;
                    padding-top: 20px;
                }

                .schedule-item {
                    padding-right: 15px;
                    border-right: 1px solid #edf0f4;
                }

                .schedule-item:last-child {
                    border-right: none;
                }

                .schedule-item span {
                    display: block;
                    color: #8a93a3;
                    font-size: 11px;
                    margin-bottom: 6px;
                }

                .schedule-item strong {
                    display: block;
                    color: #263247;
                    font-size: 13px;
                }

                .interviewer-detail {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding-top: 20px;
                }

                .large-avatar {
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #e9f1ff;
                    color: #2d6ee8;
                    font-size: 18px;
                    font-weight: 700;
                }

                .interviewer-detail h3 {
                    margin: 0 0 5px;
                    color: #263247;
                    font-size: 15px;
                }

                .interviewer-detail p {
                    margin: 0;
                    color: #7b8494;
                    font-size: 12px;
                }

                .meeting-content {
                    padding-top: 20px;
                }

                .meeting-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    padding: 12px 0;
                    border-bottom: 1px solid #edf0f4;
                }

                .meeting-row:last-child {
                    border-bottom: none;
                }

                .meeting-row > span {
                    color: #8a93a3;
                    font-size: 12px;
                }

                .meeting-row strong {
                    color: #344054;
                    font-size: 12px;
                    text-align: right;
                }

                .meeting-link {
                    color: #2d6ee8;
                    font-size: 12px;
                    font-weight: 600;
                    text-decoration: none;
                }

                .meeting-link:hover {
                    text-decoration: underline;
                }

                .no-meeting-info {
                    padding: 14px;
                    background: #f8fafc;
                    border-radius: 8px;
                    color: #7b8494;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .notes-content {
                    padding-top: 20px;
                }

                .notes-content p {
                    margin: 0;
                    color: #4b5565;
                    font-size: 13px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                }

                .notes-content .muted-text {
                    color: #9aa2af;
                }

                .bottom-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-top: 24px;
                }

                .secondary-button,
                .join-interview-button {
                    min-height: 40px;
                    padding: 0 17px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 7px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                }

                .secondary-button {
                    border: 1px solid #d7deea;
                    background: #ffffff;
                    color: #344054;
                }

                .secondary-button:hover {
                    border-color: #2d6ee8;
                    color: #2d6ee8;
                }

                .join-interview-button {
                    border: 1px solid #2d6ee8;
                    background: #2d6ee8;
                    color: #ffffff;
                }

                .join-interview-button:hover {
                    background: #245ec7;
                }

                @media (max-width: 850px) {
                    .details-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .schedule-card {
                        grid-column: span 1;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .schedule-content {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }

                    .schedule-item:nth-child(2) {
                        border-right: none;
                    }
                }

                @media (max-width: 600px) {
                    .interview-details-page {
                        padding: 20px 15px;
                    }

                    .schedule-content {
                        grid-template-columns: 1fr;
                    }

                    .schedule-item {
                        border-right: none;
                        border-bottom: 1px solid #edf0f4;
                        padding-bottom: 12px;
                    }

                    .schedule-item:last-child {
                        border-bottom: none;
                    }

                    .meeting-row {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .meeting-row strong {
                        text-align: left;
                    }

                    .bottom-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            `}</style>
        </CandidateLayout>
    );
};

export default CandidateInterviewDetails;