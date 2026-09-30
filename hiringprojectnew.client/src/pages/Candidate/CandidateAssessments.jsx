import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateLayout from "../../components/CandidateLayout";
import api from "../../services/api";

const CandidateAssessments = () => {
    const navigate = useNavigate();

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAssessments();
    }, []);

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/CandidateAssessment"
            );

            setAssessments(response.data || []);
        } catch (error) {
            console.error(
                "Error loading assessments:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load assessments."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStartAssessment = (assessmentId) => {
        navigate(
            `/candidate/assessments/${assessmentId}`
        );
    };

    return (
        <CandidateLayout activePage="assessments">

            <div className="assessments-page">

                {/* HEADER */}

                <div className="page-header">

                    <div>
                        <span className="page-label">
                            CANDIDATE PORTAL
                        </span>

                        <h1>
                            Assessments
                        </h1>

                        <p>
                            Complete assessments assigned
                            to you as part of the
                            recruitment process.
                        </p>
                    </div>

                    <div className="availability">

                        <span className="availability-dot"></span>

                        Available

                    </div>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* LOADING */}

                {loading ? (

                    <div className="loading-card">

                        <div className="spinner"></div>

                        <h3>
                            Loading assessments...
                        </h3>

                    </div>

                ) : assessments.length === 0 ? (

                    <div className="empty-card">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h2>
                            No Assessments Available
                        </h2>

                        <p>
                            You currently don't have any
                            assessments assigned to you.
                        </p>

                    </div>

                ) : (

                    <div className="assessment-grid">

                        {assessments.map(
                            (assessment) => {

                                const hasQuestions =
                                    Number(
                                        assessment.totalQuestions
                                    ) > 0;

                                return (
                                    <div
                                        className="assessment-card"
                                        key={
                                            assessment.id
                                        }
                                    >

                                        {/* TOP */}

                                        <div className="card-top">

                                            <div className="assessment-icon">
                                                ✓
                                            </div>

                                            <span className="available-badge">
                                                <span></span>
                                                Available
                                            </span>

                                        </div>


                                        {/* TITLE */}

                                        <h2>
                                            {
                                                assessment.title
                                            }
                                        </h2>


                                        {/* JOB */}

                                        <div className="job-name">

                                            <span>
                                                💼
                                            </span>

                                            {
                                                assessment.jobTitle
                                            }

                                        </div>


                                        {/* DESCRIPTION */}

                                        <p className="description">
                                            {
                                                assessment.description
                                            }
                                        </p>


                                        {/* DETAILS */}

                                        <div className="details-row">

                                            <div className="detail-item">

                                                <div className="detail-icon">
                                                    ⏱
                                                </div>

                                                <span>
                                                    Duration
                                                </span>

                                                <strong>
                                                    {
                                                        assessment.durationMinutes
                                                    }{" "}
                                                    min
                                                </strong>

                                            </div>


                                            <div className="detail-item">

                                                <div className="detail-icon">
                                                    📝
                                                </div>

                                                <span>
                                                    Questions
                                                </span>

                                                <strong>
                                                    {
                                                        assessment.totalQuestions
                                                    }
                                                </strong>

                                            </div>


                                            <div className="detail-item">

                                                <div className="detail-icon">
                                                    🎯
                                                </div>

                                                <span>
                                                    Passing Score
                                                </span>

                                                <strong>
                                                    {
                                                        assessment.passingScore
                                                    }%
                                                </strong>

                                            </div>

                                        </div>


                                        {/* FOOTER */}

                                        <div className="card-footer">

                                            <span className="added-date">
                                                Added{" "}
                                                {new Date(
                                                    assessment.createdAt
                                                ).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </span>


                                            {hasQuestions ? (

                                                <button
                                                    className="start-button"
                                                    onClick={() =>
                                                        handleStartAssessment(
                                                            assessment.id
                                                        )
                                                    }
                                                >
                                                    Start Assessment
                                                    <span>
                                                        →
                                                    </span>
                                                </button>

                                            ) : (

                                                <button
                                                    className="pending-button"
                                                    disabled
                                                >
                                                    Questions Pending
                                                </button>

                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            <style>{`

                .assessments-page {
                    min-height: calc(100vh - 70px);
                    background: #f7f9fc;
                    padding: 28px 32px 50px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .page-label {
                    color: #2d6ee8;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .page-header h1 {
                    margin: 5px 0 7px;
                    color: #172033;
                    font-size: 25px;
                    font-weight: 700;
                }

                .page-header p {
                    margin: 0;
                    color: #727d8f;
                    font-size: 14px;
                }

                .availability {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #687487;
                    font-size: 13px;
                    padding-top: 7px;
                }

                .availability-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #16a05d;
                }

                .assessment-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                    gap: 22px;
                }

                .assessment-card {
                    background: white;
                    border: 1px solid #e2e7ef;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow:
                        0 4px 14px
                        rgba(31, 45, 61, 0.04);
                    transition: 0.2s ease;
                }

                .assessment-card:hover {
                    transform: translateY(-2px);
                    box-shadow:
                        0 8px 22px
                        rgba(31, 45, 61, 0.08);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .assessment-icon {
                    width: 46px;
                    height: 46px;
                    border-radius: 12px;
                    background: #eef4ff;
                    color: #2d6ee8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .available-badge {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 7px 14px;
                    border: 1px solid #c8eedb;
                    border-radius: 20px;
                    color: #16834b;
                    background: #f3fff8;
                    font-size: 12px;
                    font-weight: 600;
                }

                .available-badge span {
                    width: 6px;
                    height: 6px;
                    background: #16a05d;
                    border-radius: 50%;
                }

                .assessment-card h2 {
                    margin: 0 0 12px;
                    color: #172033;
                    font-size: 20px;
                    line-height: 1.35;
                }

                .job-name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #45546a;
                    font-size: 14px;
                    margin-bottom: 15px;
                }

                .description {
                    min-height: 46px;
                    margin: 0;
                    color: #737e90;
                    font-size: 13px;
                    line-height: 1.65;
                }

                .details-row {
                    display: grid;
                    grid-template-columns:
                        repeat(3, 1fr);
                    margin-top: 20px;
                    padding: 16px 0;
                    border-top: 1px solid #edf0f4;
                    border-bottom: 1px solid #edf0f4;
                }

                .detail-item {
                    text-align: center;
                    padding: 0 8px;
                }

                .detail-item + .detail-item {
                    border-left: 1px solid #edf0f4;
                }

                .detail-icon {
                    font-size: 16px;
                    margin-bottom: 5px;
                }

                .detail-item span {
                    display: block;
                    color: #8a94a6;
                    font-size: 11px;
                    margin-bottom: 5px;
                }

                .detail-item strong {
                    display: block;
                    color: #172033;
                    font-size: 13px;
                }

                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding-top: 17px;
                }

                .added-date {
                    color: #8a94a6;
                    font-size: 12px;
                }

                .start-button,
                .pending-button {
                    border-radius: 9px;
                    padding: 10px 15px;
                    font-size: 12px;
                    font-weight: 650;
                }

                .start-button {
                    border: none;
                    background: #2d6ee8;
                    color: white;
                    cursor: pointer;
                }

                .start-button:hover {
                    background: #205dcc;
                }

                .start-button span {
                    margin-left: 7px;
                }

                .pending-button {
                    border: none;
                    background: #dfe4eb;
                    color: white;
                    cursor: not-allowed;
                }

                .loading-card,
                .empty-card {
                    min-height: 300px;
                    background: white;
                    border: 1px solid #e2e7ef;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .loading-card h3,
                .empty-card h2 {
                    color: #172033;
                }

                .empty-card p {
                    color: #737e90;
                    font-size: 13px;
                }

                .empty-icon {
                    width: 55px;
                    height: 55px;
                    border-radius: 50%;
                    background: #eef4ff;
                    color: #2d6ee8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 25px;
                }

                .spinner {
                    width: 35px;
                    height: 35px;
                    border: 3px solid #e5eaf1;
                    border-top-color: #2d6ee8;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .error-message {
                    padding: 12px 15px;
                    margin-bottom: 20px;
                    border-radius: 9px;
                    background: #fff1f1;
                    border: 1px solid #f0c4c4;
                    color: #c03939;
                    font-size: 13px;
                }

                @media (max-width: 850px) {

                    .assessment-grid {
                        grid-template-columns: 1fr;
                    }

                }

                @media (max-width: 600px) {

                    .assessments-page {
                        padding: 20px 15px 35px;
                    }

                    .page-header {
                        flex-direction: column;
                    }

                    .details-row {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }

                    .detail-item + .detail-item {
                        border-left: none;
                    }

                    .card-footer {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .start-button,
                    .pending-button {
                        width: 100%;
                    }

                }

            `}</style>

        </CandidateLayout>
    );
};

export default CandidateAssessments;