import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/RecruiterAnalytics"
            );

            setAnalytics(response.data);
        } catch (err) {
            console.error(
                "Failed to load analytics:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load recruiter analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // OVERVIEW CARDS
    // =========================================================

    const overviewCards = analytics
        ? [
            {
                label: "Total Jobs",
                value: analytics.totalJobs,
                icon: "▤",
                className: "analytics-card-blue",
            },
            {
                label: "Active Jobs",
                value: analytics.activeJobs,
                icon: "✓",
                className: "analytics-card-green",
            },
            {
                label: "Applicants",
                value: analytics.totalApplicants,
                icon: "♙",
                className: "analytics-card-purple",
            },
            {
                label: "Interviews",
                value: analytics.totalInterviews,
                icon: "◷",
                className: "analytics-card-orange",
            },
            {
                label: "Offers",
                value: analytics.totalOffers,
                icon: "▣",
                className: "analytics-card-teal",
            },
            {
                label: "Hired",
                value: analytics.totalHired,
                icon: "★",
                className: "analytics-card-dark",
            },
        ]
        : [];

    // =========================================================
    // PIPELINE DATA
    // =========================================================

    const pipelineStages = analytics
        ? [
            {
                label: "Applied",
                value: analytics.appliedCount,
            },
            {
                label: "Screening",
                value: analytics.screeningCount,
            },
            {
                label: "Shortlisted",
                value: analytics.shortlistedCount,
            },
            {
                label: "Assessment",
                value: analytics.assessmentCount,
            },
            {
                label: "Interview",
                value: analytics.interviewCount,
            },
            {
                label: "Selected",
                value: analytics.selectedCount,
            },
            {
                label: "Offer",
                value: analytics.offerCount,
            },
            {
                label: "Hired",
                value: analytics.hiredCount,
            },
            {
                label: "Rejected",
                value: analytics.rejectedCount,
            },
        ]
        : [];

    // =========================================================
    // INTERVIEW DATA
    // =========================================================

    const interviewStats = analytics
        ? [
            {
                label: "Scheduled",
                value: analytics.scheduledInterviews,
            },
            {
                label: "Completed",
                value: analytics.completedInterviews,
            },
            {
                label: "Rescheduled",
                value: analytics.rescheduledInterviews,
            },
            {
                label: "Cancelled",
                value: analytics.cancelledInterviews,
            },
            {
                label: "No Show",
                value: analytics.noShowInterviews,
            },
        ]
        : [];

    // =========================================================
    // OFFER DATA
    // =========================================================

    const offerStats = analytics
        ? [
            {
                label: "Draft",
                value: analytics.draftOffers,
            },
            {
                label: "Sent",
                value: analytics.sentOffers,
            },
            {
                label: "Accepted",
                value: analytics.acceptedOffers,
            },
            {
                label: "Rejected",
                value: analytics.rejectedOffers,
            },
            {
                label: "Expired",
                value: analytics.expiredOffers,
            },
            {
                label: "Withdrawn",
                value: analytics.withdrawnOffers,
            },
        ]
        : [];

    // =========================================================
    // CONVERSION DATA
    // =========================================================

    const conversionMetrics = analytics
        ? [
            {
                label: "Application → Interview",
                value:
                    analytics.applicationToInterviewRate,
            },
            {
                label: "Interview → Offer",
                value:
                    analytics.interviewToOfferRate,
            },
            {
                label: "Offer Acceptance",
                value:
                    analytics.offerAcceptanceRate,
            },
            {
                label: "Hiring Rate",
                value: analytics.hiringRate,
            },
        ]
        : [];

    // =========================================================
    // CHART DATA
    // =========================================================

    const interviewChartData =
        interviewStats.filter(
            (item) => item.value > 0
        );

    const offerChartData =
        offerStats.filter(
            (item) => item.value > 0
        );

    const interviewChartColors = [
        "#306ee8",
        "#1c9b5f",
        "#d97706",
        "#dc5b5b",
        "#7655c7",
    ];

    const offerChartColors = [
        "#64748b",
        "#306ee8",
        "#1c9b5f",
        "#dc5b5b",
        "#d97706",
        "#7655c7",
    ];

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <RecruiterLayout activePage="analytics">
                <div className="recruiter-analytics-page">
                    <div className="analytics-loading">
                        <div className="analytics-loading-spinner">
                            ⟳
                        </div>

                        <p>
                            Loading recruitment analytics...
                        </p>
                    </div>
                </div>
            </RecruiterLayout>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <RecruiterLayout activePage="analytics">
                <div className="recruiter-analytics-page">

                    <div className="analytics-page-header">
                        <div>
                            <span className="page-eyebrow">
                                RECRUITMENT INSIGHTS
                            </span>

                            <h1>
                                Analytics
                            </h1>

                            <p>
                                Track recruitment
                                performance and hiring
                                activity.
                            </p>
                        </div>
                    </div>

                    <div className="admin-alert admin-alert-error">
                        <span>!</span>

                        <div>
                            <strong>
                                Unable to load analytics
                            </strong>

                            <p>{error}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="apply-filter-button analytics-retry-button"
                        onClick={fetchAnalytics}
                    >
                        Retry
                    </button>

                </div>
            </RecruiterLayout>
        );
    }

    return (
        <RecruiterLayout activePage="analytics">

            <div className="recruiter-analytics-page">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="analytics-page-header">

                    <div>
                        <span className="page-eyebrow">
                            RECRUITMENT INSIGHTS
                        </span>

                        <h1>
                            Analytics
                        </h1>

                        <p>
                            Track recruitment performance,
                            candidate pipeline and hiring
                            activity.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="analytics-refresh-button"
                        onClick={fetchAnalytics}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                </div>


                {/* =====================================================
                    OVERVIEW
                ===================================================== */}

                <section className="analytics-section">

                    <div className="analytics-section-header">

                        <div>
                            <h2>
                                Recruitment Overview
                            </h2>

                            <p>
                                Current recruitment activity
                                across your jobs.
                            </p>
                        </div>

                    </div>

                    <div className="analytics-overview-grid">

                        {overviewCards.map((card) => (
                            <div
                                key={card.label}
                                className={`analytics-overview-card ${card.className}`}
                            >

                                <div className="analytics-card-top">

                                    <div className="analytics-card-icon">
                                        {card.icon}
                                    </div>

                                    <span className="analytics-card-label">
                                        {card.label}
                                    </span>

                                </div>

                                <div className="analytics-card-value">
                                    {card.value}
                                </div>

                            </div>
                        ))}

                    </div>

                </section>


                {/* =====================================================
                    RECRUITMENT PIPELINE CHART
                ===================================================== */}

                <section className="analytics-section">

                    <div className="analytics-section-header">

                        <div>
                            <h2>
                                Recruitment Pipeline
                            </h2>

                            <p>
                                Candidate distribution across
                                recruitment stages.
                            </p>
                        </div>

                        <div className="analytics-total-badge">
                            {analytics.totalApplicants}
                            {" "}
                            Applicants
                        </div>

                    </div>

                    <div className="analytics-chart-card">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >
                            <BarChart
                                data={pipelineStages}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e8edf3"
                                />

                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fill: "#718096",
                                        fontSize: 11,
                                    }}
                                    axisLine={{
                                        stroke: "#dfe5ef",
                                    }}
                                    tickLine={false}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    tick={{
                                        fill: "#718096",
                                        fontSize: 11,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "#f5f8fc",
                                    }}
                                    contentStyle={{
                                        border: "1px solid #dfe5ef",
                                        borderRadius: "8px",
                                        boxShadow:
                                            "0 4px 14px rgba(24, 50, 88, 0.08)",
                                    }}
                                />

                                <Bar
                                    dataKey="value"
                                    name="Candidates"
                                    fill="#306ee8"
                                    radius={[
                                        5,
                                        5,
                                        0,
                                        0,
                                    ]}
                                    barSize={34}
                                />

                            </BarChart>
                        </ResponsiveContainer>

                    </div>

                </section>


                {/* =====================================================
                    PIPELINE SUMMARY
                ===================================================== */}

                <section className="analytics-section">

                    <div className="analytics-section-header">

                        <div>
                            <h2>
                                Pipeline Summary
                            </h2>

                            <p>
                                Candidate distribution by
                                recruitment stage.
                            </p>
                        </div>

                    </div>

                    <div className="analytics-pipeline-card">

                        <div className="analytics-pipeline">

                            {pipelineStages.map(
                                (stage, index) => (
                                    <div
                                        key={stage.label}
                                        className="analytics-pipeline-stage"
                                    >

                                        <div className="analytics-pipeline-number">
                                            {stage.value}
                                        </div>

                                        <div className="analytics-pipeline-label">
                                            {stage.label}
                                        </div>

                                        {index <
                                            pipelineStages.length -
                                            1 && (
                                                <div className="analytics-pipeline-arrow">
                                                    →
                                                </div>
                                            )}

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    INTERVIEW + OFFER CHARTS
                ===================================================== */}

                <div className="analytics-two-column">

                    {/* INTERVIEW CHART */}

                    <section className="analytics-section analytics-half-section">

                        <div className="analytics-section-header">

                            <div>
                                <h2>
                                    Interview Statistics
                                </h2>

                                <p>
                                    Interview activity and
                                    outcomes.
                                </p>
                            </div>

                        </div>

                        <div className="analytics-chart-card analytics-pie-card">

                            {interviewChartData.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={280}
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                interviewChartData
                                            }
                                            dataKey="value"
                                            nameKey="label"
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                        >

                                            {interviewChartData.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={`interview-${entry.label}`}
                                                        fill={
                                                            interviewChartColors[
                                                            index %
                                                            interviewChartColors.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}

                                        </Pie>

                                        <Tooltip
                                            contentStyle={{
                                                border: "1px solid #dfe5ef",
                                                borderRadius:
                                                    "8px",
                                            }}
                                        />

                                    </PieChart>

                                </ResponsiveContainer>

                            ) : (

                                <div className="analytics-empty-chart">
                                    <span>
                                        ◷
                                    </span>

                                    <p>
                                        No interview activity
                                        available yet.
                                    </p>
                                </div>

                            )}

                            <div className="analytics-chart-legend">

                                {interviewStats.map(
                                    (item, index) => (
                                        <div
                                            key={item.label}
                                            className="analytics-legend-item"
                                        >

                                            <span
                                                className="analytics-legend-dot"
                                                style={{
                                                    background:
                                                        interviewChartColors[
                                                        index %
                                                        interviewChartColors.length
                                                        ],
                                                }}
                                            ></span>

                                            <span>
                                                {item.label}
                                            </span>

                                            <strong>
                                                {item.value}
                                            </strong>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                    </section>


                    {/* OFFER CHART */}

                    <section className="analytics-section analytics-half-section">

                        <div className="analytics-section-header">

                            <div>
                                <h2>
                                    Offer Statistics
                                </h2>

                                <p>
                                    Offer activity and
                                    outcomes.
                                </p>
                            </div>

                        </div>

                        <div className="analytics-chart-card analytics-pie-card">

                            {offerChartData.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={280}
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                offerChartData
                                            }
                                            dataKey="value"
                                            nameKey="label"
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                        >

                                            {offerChartData.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={`offer-${entry.label}`}
                                                        fill={
                                                            offerChartColors[
                                                            index %
                                                            offerChartColors.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}

                                        </Pie>

                                        <Tooltip
                                            contentStyle={{
                                                border: "1px solid #dfe5ef",
                                                borderRadius:
                                                    "8px",
                                            }}
                                        />

                                    </PieChart>

                                </ResponsiveContainer>

                            ) : (

                                <div className="analytics-empty-chart">
                                    <span>
                                        ▣
                                    </span>

                                    <p>
                                        No offer activity
                                        available yet.
                                    </p>
                                </div>

                            )}

                            <div className="analytics-chart-legend">

                                {offerStats.map(
                                    (item, index) => (
                                        <div
                                            key={item.label}
                                            className="analytics-legend-item"
                                        >

                                            <span
                                                className="analytics-legend-dot"
                                                style={{
                                                    background:
                                                        offerChartColors[
                                                        index %
                                                        offerChartColors.length
                                                        ],
                                                }}
                                            ></span>

                                            <span>
                                                {item.label}
                                            </span>

                                            <strong>
                                                {item.value}
                                            </strong>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                    </section>

                </div>


                {/* =====================================================
                    CONVERSION METRICS
                ===================================================== */}

                <section className="analytics-section">

                    <div className="analytics-section-header">

                        <div>
                            <h2>
                                Conversion Metrics
                            </h2>

                            <p>
                                Recruitment funnel conversion
                                percentages.
                            </p>
                        </div>

                    </div>

                    <div className="analytics-conversion-grid">

                        {conversionMetrics.map(
                            (metric) => (
                                <div
                                    key={metric.label}
                                    className="analytics-conversion-card"
                                >

                                    <div className="analytics-conversion-label">
                                        {metric.label}
                                    </div>

                                    <div className="analytics-conversion-value">

                                        {metric.value}

                                        <span>
                                            %
                                        </span>

                                    </div>

                                    <div className="analytics-progress-track">

                                        <div
                                            className="analytics-progress-fill"
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(
                                                        metric.value,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                            }}
                                        ></div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </section>


                {/* =====================================================
                    PIPELINE DETAILS
                ===================================================== */}

                <section className="analytics-section">

                    <div className="analytics-section-header">

                        <div>
                            <h2>
                                Pipeline Details
                            </h2>

                            <p>
                                Detailed candidate count by
                                recruitment stage.
                            </p>
                        </div>

                    </div>

                    <div className="users-card analytics-table-card">

                        <div className="users-table-container">

                            <table className="professional-users-table analytics-table">

                                <thead>

                                    <tr>
                                        <th>
                                            Stage
                                        </th>

                                        <th>
                                            Candidates
                                        </th>

                                        <th>
                                            Percentage
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {pipelineStages.map(
                                        (stage) => {

                                            const percentage =
                                                analytics.totalApplicants >
                                                    0
                                                    ? (
                                                        (stage.value /
                                                            analytics.totalApplicants) *
                                                        100
                                                    ).toFixed(2)
                                                    : "0.00";

                                            return (
                                                <tr
                                                    key={
                                                        stage.label
                                                    }
                                                >

                                                    <td>

                                                        <div className="analytics-stage-cell">

                                                            <span className="analytics-stage-dot"></span>

                                                            <strong>
                                                                {
                                                                    stage.label
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {
                                                            stage.value
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            percentage
                                                        }
                                                        %
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </section>

            </div>

        </RecruiterLayout>
    );
};

export default RecruiterAnalytics;