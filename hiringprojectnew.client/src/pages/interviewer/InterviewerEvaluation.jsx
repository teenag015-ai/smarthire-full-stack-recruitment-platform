import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import InterviewerLayout from "../../components/InterviewerLayout";

const initialForm = {
    technicalSkills: 0,
    problemSolving: 0,
    communication: 0,
    jobKnowledge: 0,
    overallRating: 0,
    strengths: "",
    weaknesses: "",
    comments: "",
    recommendation: "",
};

const ratingFields = [
    {
        key: "technicalSkills",
        label: "Technical Skills",
    },
    {
        key: "problemSolving",
        label: "Problem Solving",
    },
    {
        key: "communication",
        label: "Communication",
    },
    {
        key: "jobKnowledge",
        label: "Job Knowledge",
    },
    {
        key: "overallRating",
        label: "Overall Rating",
    },
];

const InterviewerEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // LOAD INTERVIEW AND EXISTING EVALUATION
    // =========================================================

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");
                setSuccess("");
                setEvaluation(null);
                setInterview(null);
                setForm(initialForm);
                setEditing(false);

                // -------------------------------------------------
                // Load interview
                // -------------------------------------------------

                const interviewResponse = await api.get(
                    `/Interviewer/interviews/${id}`
                );

                if (!active) return;

                const interviewData = interviewResponse.data;

                setInterview(interviewData);

                // -------------------------------------------------
                // Only completed interviews can be evaluated
                // -------------------------------------------------

                if (
                    interviewData.status?.toLowerCase() !==
                    "completed"
                ) {
                    return;
                }

                // -------------------------------------------------
                // Try to load existing evaluation
                // -------------------------------------------------

                try {
                    const evaluationResponse =
                        await api.get(
                            `/InterviewerEvaluation/${id}`
                        );

                    if (!active) return;

                    const evaluationData =
                        evaluationResponse.data;

                    setEvaluation(evaluationData);

                    // -------------------------------------------------
                    // Load existing evaluation values into form
                    // -------------------------------------------------

                    setForm({
                        technicalSkills:
                            evaluationData.technicalSkills || 0,

                        problemSolving:
                            evaluationData.problemSolving || 0,

                        communication:
                            evaluationData.communication || 0,

                        jobKnowledge:
                            evaluationData.jobKnowledge || 0,

                        overallRating:
                            evaluationData.overallRating || 0,

                        strengths:
                            evaluationData.strengths || "",

                        weaknesses:
                            evaluationData.weaknesses || "",

                        comments:
                            evaluationData.comments || "",

                        recommendation:
                            evaluationData.recommendation || "",
                    });
                } catch (evaluationError) {
                    if (!active) return;

                    // 404 means evaluation does not exist yet.
                    if (
                        evaluationError.response?.status !==
                        404
                    ) {
                        throw evaluationError;
                    }
                }
            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    "Unable to load interview evaluation."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [id]);

    // =========================================================
    // FORM HANDLING
    // =========================================================

    const updateField = (name, value) => {
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // =========================================================
    // START EDITING
    // =========================================================

    const handleEdit = () => {
        if (!evaluation) return;

        setForm({
            technicalSkills:
                evaluation.technicalSkills || 0,

            problemSolving:
                evaluation.problemSolving || 0,

            communication:
                evaluation.communication || 0,

            jobKnowledge:
                evaluation.jobKnowledge || 0,

            overallRating:
                evaluation.overallRating || 0,

            strengths:
                evaluation.strengths || "",

            weaknesses:
                evaluation.weaknesses || "",

            comments:
                evaluation.comments || "",

            recommendation:
                evaluation.recommendation || "",
        });

        setEditing(true);
        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // CANCEL EDITING
    // =========================================================

    const handleCancelEdit = () => {
        if (!evaluation) return;

        setForm({
            technicalSkills:
                evaluation.technicalSkills || 0,

            problemSolving:
                evaluation.problemSolving || 0,

            communication:
                evaluation.communication || 0,

            jobKnowledge:
                evaluation.jobKnowledge || 0,

            overallRating:
                evaluation.overallRating || 0,

            strengths:
                evaluation.strengths || "",

            weaknesses:
                evaluation.weaknesses || "",

            comments:
                evaluation.comments || "",

            recommendation:
                evaluation.recommendation || "",
        });

        setEditing(false);
        setError("");
        setSuccess("");
    };

    // =========================================================
    // SUBMIT / UPDATE EVALUATION
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) return;

        // -----------------------------------------------------
        // Validate ratings
        // -----------------------------------------------------

        const invalidRating = ratingFields.some(
            (field) =>
                form[field.key] < 1 ||
                form[field.key] > 5
        );

        if (invalidRating) {
            setError(
                "Please provide all five ratings before submitting."
            );
            return;
        }

        // -----------------------------------------------------
        // Validate recommendation
        // -----------------------------------------------------

        if (!form.recommendation) {
            setError(
                "Please select a recommendation."
            );
            return;
        }

        // -----------------------------------------------------
        // Confirmation message
        // -----------------------------------------------------

        const confirmationMessage = evaluation
            ? "Update this evaluation?"
            : "Submit this evaluation? You can edit it later if needed.";

        if (!window.confirm(confirmationMessage)) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            // -------------------------------------------------
            // UPDATE EXISTING EVALUATION
            // -------------------------------------------------

            if (evaluation) {
                const updatePayload = {
                    technicalSkills:
                        Number(form.technicalSkills),

                    problemSolving:
                        Number(form.problemSolving),

                    communication:
                        Number(form.communication),

                    jobKnowledge:
                        Number(form.jobKnowledge),

                    overallRating:
                        Number(form.overallRating),

                    strengths:
                        form.strengths.trim(),

                    weaknesses:
                        form.weaknesses.trim(),

                    comments:
                        form.comments.trim(),

                    recommendation:
                        form.recommendation,
                };

                const response = await api.put(
                    `/InterviewerEvaluation/${id}`,
                    updatePayload
                );

                // -------------------------------------------------
                // Store updated evaluation
                // -------------------------------------------------

                setEvaluation(response.data);

                // -------------------------------------------------
                // Update form with saved values
                // -------------------------------------------------

                setForm({
                    technicalSkills:
                        response.data.technicalSkills || 0,

                    problemSolving:
                        response.data.problemSolving || 0,

                    communication:
                        response.data.communication || 0,

                    jobKnowledge:
                        response.data.jobKnowledge || 0,

                    overallRating:
                        response.data.overallRating || 0,

                    strengths:
                        response.data.strengths || "",

                    weaknesses:
                        response.data.weaknesses || "",

                    comments:
                        response.data.comments || "",

                    recommendation:
                        response.data.recommendation || "",
                });

                setEditing(false);

                setSuccess(
                    "Candidate evaluation updated successfully."
                );

                return;
            }

            // -------------------------------------------------
            // CREATE NEW EVALUATION
            // -------------------------------------------------

            const payload = {
                interviewId: Number(id),

                technicalSkills:
                    Number(form.technicalSkills),

                problemSolving:
                    Number(form.problemSolving),

                communication:
                    Number(form.communication),

                jobKnowledge:
                    Number(form.jobKnowledge),

                overallRating:
                    Number(form.overallRating),

                strengths:
                    form.strengths.trim(),

                weaknesses:
                    form.weaknesses.trim(),

                comments:
                    form.comments.trim(),

                recommendation:
                    form.recommendation,
            };

            const response = await api.post(
                "/InterviewerEvaluation",
                payload
            );

            // -------------------------------------------------
            // Store created evaluation
            // -------------------------------------------------

            setEvaluation(response.data);

            // -------------------------------------------------
            // Store submitted values
            // -------------------------------------------------

            setForm({
                technicalSkills:
                    response.data.technicalSkills || 0,

                problemSolving:
                    response.data.problemSolving || 0,

                communication:
                    response.data.communication || 0,

                jobKnowledge:
                    response.data.jobKnowledge || 0,

                overallRating:
                    response.data.overallRating || 0,

                strengths:
                    response.data.strengths || "",

                weaknesses:
                    response.data.weaknesses || "",

                comments:
                    response.data.comments || "",

                recommendation:
                    response.data.recommendation || "",
            });

            setEditing(false);

            setSuccess(
                "Candidate evaluation submitted successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save evaluation. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // RATING COMPONENT
    // =========================================================

    const renderRating = (name, label) => {
        const value = form[name] || 0;

        const isReadOnly =
            Boolean(evaluation) && !editing;

        return (
            <div
                className="evaluation-rating-row"
                key={name}
            >
                <div>
                    <strong>{label}</strong>

                    <small>
                        Rate from 1 to 5
                    </small>
                </div>

                <div className="evaluation-rating-right">
                    <div className="evaluation-stars">
                        {[1, 2, 3, 4, 5].map(
                            (number) => (
                                <button
                                    key={number}
                                    type="button"
                                    disabled={isReadOnly}
                                    className={
                                        number <= value
                                            ? "evaluation-star active"
                                            : "evaluation-star"
                                    }
                                    onClick={() =>
                                        updateField(
                                            name,
                                            number
                                        )
                                    }
                                    aria-label={`${label}: ${number} out of 5`}
                                >
                                    ★
                                </button>
                            )
                        )}
                    </div>

                    <span className="evaluation-rating-value">
                        {value}/5
                    </span>
                </div>
            </div>
        );
    };

    // =========================================================
    // BACK
    // =========================================================

    const goBack = () => {
        navigate(
            `/interviewer/interviews/${id}`
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <InterviewerLayout activePage="interviews">
                <div className="evaluation-loading">
                    Loading evaluation...
                </div>

                <EvaluationStyles />
            </InterviewerLayout>
        );
    }

    // =========================================================
    // ERROR / INTERVIEW NOT FOUND
    // =========================================================

    if (!interview) {
        return (
            <InterviewerLayout activePage="interviews">
                <div className="evaluation-message-card">
                    <h2>
                        Evaluation Unavailable
                    </h2>

                    <p>
                        {error ||
                            "Interview not found."}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/interviewer/interviews"
                            )
                        }
                    >
                        Back to My Interviews
                    </button>
                </div>

                <EvaluationStyles />
            </InterviewerLayout>
        );
    }

    // =========================================================
    // INTERVIEW NOT COMPLETED
    // =========================================================

    if (
        interview.status?.toLowerCase() !==
        "completed"
    ) {
        return (
            <InterviewerLayout activePage="interviews">
                <div className="evaluation-message-card">
                    <h2>
                        Evaluation Not Available
                    </h2>

                    <p>
                        Only completed interviews
                        can be evaluated. This
                        interview is currently
                        marked as{" "}
                        <strong>
                            {interview.status}
                        </strong>.
                    </p>

                    <button onClick={goBack}>
                        Back to Interview Details
                    </button>
                </div>

                <EvaluationStyles />
            </InterviewerLayout>
        );
    }

    // =========================================================
    // DISPLAY DATA
    // =========================================================

    const isReadOnly =
        Boolean(evaluation) && !editing;

    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (
        <InterviewerLayout activePage="interviews">
            <div className="evaluation-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="evaluation-page-header">
                    <div>
                        <span className="evaluation-eyebrow">
                            INTERVIEWER PORTAL
                        </span>

                        <h1>
                            {evaluation
                                ? editing
                                    ? "Edit Candidate Evaluation"
                                    : "Candidate Evaluation"
                                : "Evaluate Candidate"}
                        </h1>

                        <p>
                            {evaluation
                                ? editing
                                    ? "Update the candidate's performance and recommendation."
                                    : "View the submitted interview evaluation."
                                : "Assess the candidate's performance and provide your recommendation."}
                        </p>
                    </div>

                    <button
                        className="evaluation-back"
                        onClick={goBack}
                    >
                        ← Interview Details
                    </button>
                </div>

                {/* =================================================
                    CANDIDATE CARD
                ================================================= */}

                <div className="evaluation-card evaluation-candidate-card">
                    <div className="evaluation-avatar">
                        {interview.candidateName
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "C"}
                    </div>

                    <div className="evaluation-candidate-info">
                        <h3>
                            {interview.candidateName}
                        </h3>

                        <p>
                            {interview.candidateEmail}
                        </p>

                        <div className="evaluation-meta">
                            <span>
                                {interview.jobTitle}
                            </span>

                            <span>
                                {interview.interviewType}{" "}
                                Interview
                            </span>

                            <span>
                                Interview #
                                {interview.id}
                            </span>
                        </div>
                    </div>

                    <span className="evaluation-status">
                        {evaluation
                            ? editing
                                ? "Editing"
                                : "Evaluated"
                            : "Completed"}
                    </span>
                </div>

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                {success && (
                    <div className="evaluation-success">
                        ✓ {success}
                    </div>
                )}

                {error && (
                    <div className="evaluation-error">
                        {error}
                    </div>
                )}

                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleSubmit}>

                    {/* =================================================
                        PERFORMANCE RATINGS
                    ================================================= */}

                    <div className="evaluation-card">
                        <div className="evaluation-section-header">
                            <h3>
                                Performance Ratings
                            </h3>

                            <p>
                                Evaluate the candidate
                                in each category.
                            </p>
                        </div>

                        <div className="evaluation-section-body">
                            {ratingFields.map(
                                (field) =>
                                    renderRating(
                                        field.key,
                                        field.label
                                    )
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        WRITTEN FEEDBACK
                    ================================================= */}

                    <div className="evaluation-card">
                        <div className="evaluation-section-header">
                            <h3>
                                Interview Feedback
                            </h3>

                            <p>
                                Record your
                                observations from
                                the interview.
                            </p>
                        </div>

                        <div className="evaluation-section-body">

                            {/* Strengths */}

                            <div className="evaluation-field">
                                <label>
                                    Candidate Strengths
                                </label>

                                <textarea
                                    rows={4}
                                    maxLength={2000}
                                    placeholder="Describe the candidate's strengths..."
                                    disabled={isReadOnly}
                                    value={
                                        form.strengths ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "strengths",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* Weaknesses */}

                            <div className="evaluation-field">
                                <label>
                                    Areas for Improvement
                                </label>

                                <textarea
                                    rows={4}
                                    maxLength={2000}
                                    placeholder="Mention areas where the candidate can improve..."
                                    disabled={isReadOnly}
                                    value={
                                        form.weaknesses ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "weaknesses",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* Comments */}

                            <div className="evaluation-field">
                                <label>
                                    Interviewer Comments
                                </label>

                                <textarea
                                    rows={5}
                                    maxLength={3000}
                                    placeholder="Enter your overall interview feedback..."
                                    disabled={isReadOnly}
                                    value={
                                        form.comments ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "comments",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        RECOMMENDATION
                    ================================================= */}

                    <div className="evaluation-card">
                        <div className="evaluation-section-header">
                            <h3>
                                Final Recommendation
                            </h3>

                            <p>
                                Select your
                                recommendation for
                                this candidate.
                            </p>
                        </div>

                        <div className="evaluation-section-body">

                            <div className="evaluation-recommendations">

                                {[
                                    "Reject",
                                    "Next Round",
                                    "Hire",
                                ].map((option) => (
                                    <label
                                        key={option}
                                        className={
                                            form.recommendation ===
                                                option
                                                ? "recommendation-option selected"
                                                : "recommendation-option"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="recommendation"
                                            value={option}
                                            disabled={
                                                isReadOnly
                                            }
                                            checked={
                                                form.recommendation ===
                                                option
                                            }
                                            onChange={() =>
                                                updateField(
                                                    "recommendation",
                                                    option
                                                )
                                            }
                                        />

                                        <span>
                                            {option}
                                        </span>
                                    </label>
                                ))}

                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="evaluation-footer">

                        <button
                            type="button"
                            className="evaluation-cancel"
                            onClick={
                                editing
                                    ? handleCancelEdit
                                    : goBack
                            }
                        >
                            {editing
                                ? "Cancel Edit"
                                : "Back to Interview"}
                        </button>

                        {/* -------------------------------------------------
                            NEW EVALUATION
                        ------------------------------------------------- */}

                        {!evaluation && (
                            <button
                                type="submit"
                                className="evaluation-submit"
                                disabled={
                                    submitting
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Evaluation →"}
                            </button>
                        )}

                        {/* -------------------------------------------------
                            EXISTING EVALUATION - EDIT MODE
                        ------------------------------------------------- */}

                        {evaluation &&
                            editing && (
                                <button
                                    type="submit"
                                    className="evaluation-submit"
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Updating..."
                                        : "Update Evaluation →"}
                                </button>
                            )}

                        {/* -------------------------------------------------
                            EXISTING EVALUATION - READ ONLY
                        ------------------------------------------------- */}

                        {evaluation &&
                            !editing && (
                                <div className="evaluation-footer-actions">

                                    <button
                                        type="button"
                                        className="evaluation-edit"
                                        onClick={
                                            handleEdit
                                        }
                                    >
                                        ✎ Edit Evaluation
                                    </button>

                                    <span className="evaluation-saved">
                                        ✓ Evaluation Submitted
                                    </span>

                                </div>
                            )}

                    </div>

                    {/* =================================================
                        UPDATED INFORMATION
                    ================================================= */}

                    {evaluation &&
                        !editing &&
                        evaluation.updatedAt && (
                            <div className="evaluation-updated-info">
                                Last updated:{" "}
                                {new Date(
                                    evaluation.updatedAt
                                ).toLocaleString()}
                            </div>
                        )}

                </form>
            </div>

            <EvaluationStyles />
        </InterviewerLayout>
    );
};

// =============================================================
// STYLING
// =============================================================

const EvaluationStyles = () => (
    <style>{`
        .evaluation-page {
            width: 100%;
            padding-bottom: 30px;
        }

        .evaluation-page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-bottom: 25px;
        }

        .evaluation-eyebrow {
            color: #2867e8;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.5px;
        }

        .evaluation-page-header h1 {
            margin: 8px 0;
            font-size: 30px;
            color: #10254a;
            font-weight: 750;
        }

        .evaluation-page-header p {
            font-size: 13px;
            color: #71819b;
            margin: 0;
        }

        .evaluation-back,
        .evaluation-cancel {
            background: white;
            border: 1px solid #d6e0ef;
            border-radius: 8px;
            padding: 11px 17px;
            color: #31557d;
            cursor: pointer;
            font-size: 12px;
            font-weight: 650;
        }

        .evaluation-back:hover,
        .evaluation-cancel:hover {
            border-color: #2867e8;
            color: #2867e8;
        }

        .evaluation-card {
            background: white;
            border: 1px solid #dee5ef;
            border-radius: 11px;
            margin-bottom: 20px;
            overflow: hidden;
        }

        .evaluation-candidate-card {
            padding: 22px 25px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .evaluation-avatar {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #e8efff;
            color: #2867e8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
            font-weight: 750;
            flex-shrink: 0;
        }

        .evaluation-candidate-info {
            flex: 1;
            min-width: 0;
        }

        .evaluation-candidate-info h3 {
            font-size: 17px;
            color: #10254a;
            margin: 0 0 5px;
        }

        .evaluation-candidate-info p {
            font-size: 12px;
            color: #71819b;
            margin: 0;
        }

        .evaluation-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }

        .evaluation-meta span {
            background: #f1f5fc;
            color: #52709b;
            font-size: 11px;
            border-radius: 5px;
            padding: 6px 10px;
        }

        .evaluation-status {
            background: #eaf8f0;
            color: #29945c;
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 11px;
            font-weight: 700;
        }

        .evaluation-section-header {
            padding: 22px 25px;
            border-bottom: 1px solid #edf0f4;
        }

        .evaluation-section-header h3 {
            margin: 0;
            color: #10254a;
            font-size: 17px;
            font-weight: 700;
        }

        .evaluation-section-header p {
            margin: 6px 0 0;
            color: #8491a3;
            font-size: 12px;
        }

        .evaluation-section-body {
            padding: 22px 25px;
        }

        .evaluation-rating-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #edf0f4;
        }

        .evaluation-rating-row:last-child {
            border-bottom: none;
        }

        .evaluation-rating-row strong {
            display: block;
            font-size: 13px;
            color: #304763;
        }

        .evaluation-rating-row small {
            display: block;
            font-size: 11px;
            color: #8491a3;
            margin-top: 5px;
        }

        .evaluation-rating-right {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .evaluation-stars {
            display: flex;
            gap: 5px;
        }

        .evaluation-star {
            border: none;
            background: transparent;
            color: #d5dce7;
            font-size: 26px;
            cursor: pointer;
            padding: 2px;
        }

        .evaluation-star.active {
            color: #f4ad31;
        }

        .evaluation-star:disabled {
            cursor: default;
        }

        .evaluation-rating-value {
            color: #31557d;
            font-size: 13px;
            font-weight: 750;
            min-width: 30px;
        }

        .evaluation-field {
            margin-bottom: 22px;
        }

        .evaluation-field:last-child {
            margin-bottom: 0;
        }

        .evaluation-field label {
            display: block;
            font-size: 13px;
            font-weight: 650;
            color: #304763;
            margin-bottom: 10px;
        }

        .evaluation-field textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #dce4ef;
            border-radius: 8px;
            padding: 13px;
            resize: vertical;
            font-family: inherit;
            font-size: 13px;
            color: #304763;
            outline: none;
        }

        .evaluation-field textarea:focus {
            border-color: #2867e8;
        }

        .evaluation-field textarea:disabled {
            background: #f8fafc;
            color: #56677e;
            cursor: default;
        }

        .evaluation-recommendations {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 13px;
        }

        .recommendation-option {
            border: 1px solid #dce4ef;
            border-radius: 8px;
            padding: 17px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #304763;
            cursor: pointer;
            font-weight: 650;
        }

        .recommendation-option.selected {
            background: #eef4ff;
            border-color: #2867e8;
            color: #205bd4;
        }

        .recommendation-option input {
            accent-color: #2867e8;
        }

        .recommendation-option:has(input:disabled) {
            cursor: default;
        }

        .evaluation-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-top: 20px;
        }

        .evaluation-footer-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .evaluation-submit {
            background: #2867e8;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 22px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .evaluation-submit:hover {
            background: #205bd4;
        }

        .evaluation-submit:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }

        .evaluation-edit {
            background: white;
            color: #2867e8;
            border: 1px solid #2867e8;
            border-radius: 8px;
            padding: 12px 18px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .evaluation-edit:hover {
            background: #eef4ff;
        }

        .evaluation-saved {
            background: #eaf8f0;
            color: #29945c;
            padding: 12px 17px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
        }

        .evaluation-updated-info {
            text-align: right;
            margin-top: 8px;
            color: #8491a3;
            font-size: 11px;
        }

        .evaluation-error,
        .evaluation-success {
            padding: 14px 18px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 13px;
        }

        .evaluation-error {
            background: #fff0f0;
            color: #c43838;
        }

        .evaluation-success {
            background: #eaf8f0;
            color: #29945c;
        }

        .evaluation-loading {
            padding: 70px;
            text-align: center;
            color: #71819b;
        }

        .evaluation-message-card {
            padding: 35px;
            background: white;
            border: 1px solid #dee5ef;
            border-radius: 11px;
        }

        .evaluation-message-card h2 {
            color: #10254a;
            font-size: 22px;
            margin-top: 0;
        }

        .evaluation-message-card p {
            color: #71819b;
            font-size: 13px;
            margin-bottom: 20px;
        }

        .evaluation-message-card button {
            background: #2867e8;
            color: white;
            border: none;
            border-radius: 7px;
            padding: 11px 17px;
            cursor: pointer;
        }

        @media (max-width: 700px) {
            .evaluation-page-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .evaluation-candidate-card {
                flex-wrap: wrap;
            }

            .evaluation-rating-row {
                align-items: flex-start;
                flex-direction: column;
            }

            .evaluation-recommendations {
                grid-template-columns: 1fr;
            }

            .evaluation-footer {
                flex-direction: column;
                align-items: stretch;
            }

            .evaluation-footer-actions {
                flex-direction: column;
                align-items: stretch;
            }

            .evaluation-edit,
            .evaluation-saved {
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }
        }
    `}</style>
);

export default InterviewerEvaluation;