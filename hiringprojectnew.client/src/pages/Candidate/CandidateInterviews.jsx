import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateLayout from "../../components/CandidateLayout";
import api from "../../services/api";

const CandidateInterviews = () => {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadInterviews();
    }, []);

    const loadInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/CandidateInterview"
            );

            setInterviews(response.data || []);
        } catch (err) {
            console.error(
                "Error loading interviews:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load your interviews."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "Not scheduled";
        }

        return new Date(dateString).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatTime = (dateString) => {
        if (!dateString) {
            return "";
        }

        return new Date(dateString).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const isUpcoming = (dateString) => {
        if (!dateString) {
            return false;
        }

        return (
            new Date(dateString).getTime() >
            new Date().getTime()
        );
    };

    const upcomingInterviews = useMemo(
        () =>
            interviews.filter((interview) =>
                isUpcoming(interview.scheduledAt)
            ),
        [interviews]
    );

    const pastInterviews = useMemo(
        () =>
            interviews.filter(
                (interview) =>
                    !isUpcoming(interview.scheduledAt)
            ),
        [interviews]
    );

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

            default:
                return "status-default";
        }
    };

    const InterviewCard = ({ interview }) => {
        const upcoming = isUpcoming(
            interview.scheduledAt
        );

        return (
            <div className="interview-card">
                <div className="interview-card-top">
                    <div>
                        <div className="job-label">
                            INTERVIEW
                        </div>

                        <h3>
                            {interview.jobTitle ||
                                "Job Position"}
                        </h3>
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

                <div className="interview-info-grid">
                    <div className="info-item">
                        <span className="info-icon">
                            📅
                        </span>

                        <div>
                            <small>Date</small>
                            <strong>
                                {formatDate(
                                    interview.scheduledAt
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-icon">
                            🕐
                        </span>

                        <div>
                            <small>Time</small>
                            <strong>
                                {formatTime(
                                    interview.scheduledAt
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-icon">
                            ⏱
                        </span>

                        <div>
                            <small>Duration</small>
                            <strong>
                                {interview.durationMinutes ||
                                    0}{" "}
                                minutes
                            </strong>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-icon">
                            🎯
                        </span>

                        <div>
                            <small>Type</small>
                            <strong>
                                {interview.interviewType ||
                                    "Interview"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="interviewer-section">
                    <div className="interviewer-avatar">
                        {(
                            interview.interviewerName ||
                            "I"
                        )
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <small>Interviewer</small>

                        <strong>
                            {interview.interviewerName ||
                                "Not specified"}
                        </strong>

                        {interview.interviewerEmail && (
                            <span>
                                {
                                    interview.interviewerEmail
                                }
                            </span>
                        )}
                    </div>
                </div>

                {interview.location && (
                    <div className="location-row">
                        <span>📍</span>
                        <span>
                            {interview.location}
                        </span>
                    </div>
                )}

                <div className="interview-card-footer">
                    <button
                        className="details-button"
                        onClick={() =>
                            navigate(
                                `/candidate/interviews/${interview.id}`
                            )
                        }
                    >
                        View Details
                    </button>

                    {upcoming &&
                        interview.meetingLink && (
                            <a
                                href={
                                    interview.meetingLink
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="join-button"
                            >
                                Join Interview
                            </a>
                        )}
                </div>
            </div>
        );
    };

    return (
        <CandidateLayout activePage="interviews">
            <div className="candidate-interviews-page">
                <div className="page-header">
                    <div>
                        <h1>My Interviews</h1>

                        <p>
                            View and manage your scheduled
                            recruitment interviews.
                        </p>
                    </div>

                    <div className="interview-summary">
                        <div className="summary-box">
                            <span>
                                Total
                            </span>

                            <strong>
                                {interviews.length}
                            </strong>
                        </div>

                        <div className="summary-box upcoming">
                            <span>
                                Upcoming
                            </span>

                            <strong>
                                {
                                    upcomingInterviews.length
                                }
                            </strong>
                        </div>

                        <div className="summary-box completed">
                            <span>
                                Past
                            </span>

                            <strong>
                                {
                                    pastInterviews.length
                                }
                            </strong>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="state-card">
                        <div className="loader"></div>

                        <p>
                            Loading your interviews...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-card error-state">
                        <div className="state-icon">
                            ⚠
                        </div>

                        <h3>
                            Unable to load interviews
                        </h3>

                        <p>{error}</p>

                        <button
                            onClick={loadInterviews}
                            className="retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading &&
                    !error &&
                    interviews.length === 0 && (
                        <div className="state-card empty-state">
                            <div className="empty-icon">
                                📅
                            </div>

                            <h2>
                                No interviews scheduled
                            </h2>

                            <p>
                                You don't have any
                                interviews scheduled
                                yet. Once a recruiter
                                schedules an interview,
                                it will appear here.
                            </p>

                            <button
                                className="browse-jobs-button"
                                onClick={() =>
                                    navigate(
                                        "/candidate/jobs"
                                    )
                                }
                            >
                                Browse Jobs
                            </button>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    upcomingInterviews.length >
                    0 && (
                        <section className="interview-section">
                            <div className="section-heading">
                                <div>
                                    <h2>
                                        Upcoming Interviews
                                    </h2>

                                    <p>
                                        Your scheduled
                                        interviews
                                    </p>
                                </div>

                                <span className="section-count">
                                    {
                                        upcomingInterviews.length
                                    }
                                </span>
                            </div>

                            <div className="interview-grid">
                                {upcomingInterviews.map(
                                    (interview) => (
                                        <InterviewCard
                                            key={
                                                interview.id
                                            }
                                            interview={
                                                interview
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </section>
                    )}

                {!loading &&
                    !error &&
                    pastInterviews.length > 0 && (
                        <section className="interview-section past-section">
                            <div className="section-heading">
                                <div>
                                    <h2>
                                        Previous Interviews
                                    </h2>

                                    <p>
                                        Your completed
                                        and past
                                        interviews
                                    </p>
                                </div>

                                <span className="section-count">
                                    {
                                        pastInterviews.length
                                    }
                                </span>
                            </div>

                            <div className="interview-grid">
                                {pastInterviews.map(
                                    (interview) => (
                                        <InterviewCard
                                            key={
                                                interview.id
                                            }
                                            interview={
                                                interview
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </section>
                    )}
            </div>

            <style>{`
                .candidate-interviews-page {
                    padding: 28px 32px;
                    color: #172033;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 24px;
                    margin-bottom: 30px;
                }

                .page-header h1 {
                    margin: 0 0 8px;
                    font-size: 30px;
                    font-weight: 700;
                    color: #172033;
                }

                .page-header p {
                    margin: 0;
                    color: #697386;
                    font-size: 15px;
                }

                .interview-summary {
                    display: flex;
                    gap: 12px;
                }

                .summary-box {
                    min-width: 90px;
                    padding: 13px 16px;
                    background: #ffffff;
                    border: 1px solid #e4e9f1;
                    border-radius: 10px;
                    text-align: center;
                }

                .summary-box span {
                    display: block;
                    font-size: 12px;
                    color: #697386;
                    margin-bottom: 5px;
                }

                .summary-box strong {
                    font-size: 20px;
                    color: #172033;
                }

                .summary-box.upcoming strong {
                    color: #2d6ee8;
                }

                .summary-box.completed strong {
                    color: #64748b;
                }

                .interview-section {
                    margin-bottom: 34px;
                }

                .section-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .section-heading h2 {
                    margin: 0 0 4px;
                    font-size: 20px;
                    color: #172033;
                }

                .section-heading p {
                    margin: 0;
                    color: #7b8494;
                    font-size: 13px;
                }

                .section-count {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 30px;
                    height: 30px;
                    padding: 0 9px;
                    background: #eef5ff;
                    color: #2d6ee8;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .interview-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(340px, 1fr)
                        );
                    gap: 20px;
                }

                .interview-card {
                    background: #ffffff;
                    border: 1px solid #e4e9f1;
                    border-radius: 14px;
                    padding: 21px;
                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease,
                        border-color 0.2s ease;
                }

                .interview-card:hover {
                    transform: translateY(-2px);
                    border-color: #cbd8eb;
                    box-shadow:
                        0 8px 25px
                        rgba(25, 45, 75, 0.08);
                }

                .interview-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .job-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.8px;
                    color: #2d6ee8;
                    margin-bottom: 6px;
                }

                .interview-card h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #172033;
                }

                .status-badge {
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 11px;
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

                .interview-info-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, 1fr);
                    gap: 15px;
                    padding: 16px 0;
                    border-top: 1px solid #edf0f4;
                    border-bottom: 1px solid #edf0f4;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .info-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f4f7fb;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .info-item small,
                .interviewer-section small {
                    display: block;
                    color: #8a93a3;
                    font-size: 11px;
                    margin-bottom: 3px;
                }

                .info-item strong {
                    display: block;
                    color: #263247;
                    font-size: 13px;
                    font-weight: 600;
                }

                .interviewer-section {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    margin-top: 17px;
                }

                .interviewer-avatar {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #e9f1ff;
                    color: #2d6ee8;
                    font-weight: 700;
                    font-size: 14px;
                }

                .interviewer-section strong {
                    display: block;
                    color: #263247;
                    font-size: 13px;
                }

                .interviewer-section span {
                    display: block;
                    margin-top: 2px;
                    color: #8a93a3;
                    font-size: 11px;
                }

                .location-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 14px;
                    padding: 10px 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 12px;
                }

                .interview-card-footer {
                    display: flex;
                    gap: 10px;
                    margin-top: 18px;
                }

                .details-button,
                .join-button {
                    flex: 1;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 7px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    transition: 0.2s ease;
                }

                .details-button {
                    border: 1px solid #d7deea;
                    background: #ffffff;
                    color: #344054;
                }

                .details-button:hover {
                    border-color: #2d6ee8;
                    color: #2d6ee8;
                }

                .join-button {
                    background: #2d6ee8;
                    color: #ffffff;
                    border: 1px solid #2d6ee8;
                }

                .join-button:hover {
                    background: #245ec7;
                }

                .state-card {
                    min-height: 280px;
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

                .state-card p {
                    color: #737d8e;
                    font-size: 14px;
                    max-width: 500px;
                    line-height: 1.6;
                }

                .empty-icon,
                .state-icon {
                    width: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #eef5ff;
                    font-size: 25px;
                    margin-bottom: 15px;
                }

                .state-icon {
                    background: #fff2f2;
                }

                .state-card h2,
                .state-card h3 {
                    margin: 0 0 5px;
                    color: #172033;
                }

                .browse-jobs-button,
                .retry-button {
                    margin-top: 12px;
                    border: none;
                    border-radius: 7px;
                    padding: 10px 18px;
                    background: #2d6ee8;
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .retry-button {
                    background: #344054;
                }

                .loader {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e4e9f1;
                    border-top-color: #2d6ee8;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 12px;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 900px) {
                    .page-header {
                        flex-direction: column;
                    }

                    .interview-summary {
                        width: 100%;
                    }

                    .summary-box {
                        flex: 1;
                    }
                }

                @media (max-width: 600px) {
                    .candidate-interviews-page {
                        padding: 20px 15px;
                    }

                    .interview-info-grid {
                        grid-template-columns: 1fr;
                    }

                    .interview-grid {
                        grid-template-columns: 1fr;
                    }

                    .interview-card-footer {
                        flex-direction: column;
                    }
                }
            `}</style>
        </CandidateLayout>
    );
};

export default CandidateInterviews;