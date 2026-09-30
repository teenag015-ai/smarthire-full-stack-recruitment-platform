import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterAssessmentQuestions = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const [form, setForm] = useState({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        marks: 1,
    });

    const token = localStorage.getItem("smartHireToken");

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const fetchAssessment = async () => {
        try {
            const response = await api.get(
                `/RecruiterAssessment/${assessmentId}`,
                getHeaders()
            );

            setAssessment(response.data);
        } catch (err) {
            console.error(
                "Failed to load assessment:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load assessment."
            );
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/RecruiterAssessmentQuestion/assessment/${assessmentId}`,
                getHeaders()
            );

            setQuestions(response.data || []);
        } catch (err) {
            console.error(
                "Failed to load assessment questions:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load assessment questions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!assessmentId) {
            setError("Assessment ID is missing.");
            setLoading(false);
            return;
        }

        fetchAssessment();
        fetchQuestions();
    }, [assessmentId]);

    const resetForm = () => {
        setForm({
            questionText: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            marks: 1,
        });
    };

    const openCreateModal = () => {
        setEditingQuestion(null);
        resetForm();

        setError("");
        setSuccess("");
        setShowFormModal(true);
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);

        setForm({
            questionText: question.questionText || "",
            optionA: question.optionA || "",
            optionB: question.optionB || "",
            optionC: question.optionC || "",
            optionD: question.optionD || "",
            correctAnswer:
                question.correctAnswer || "",
            marks: question.marks || 1,
        });

        setError("");
        setSuccess("");
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        if (actionLoading) {
            return;
        }

        setShowFormModal(false);
        setEditingQuestion(null);
        resetForm();
    };

    const openViewModal = async (question) => {
        setError("");

        try {
            const response = await api.get(
                `/RecruiterAssessmentQuestion/${question.id}`,
                getHeaders()
            );

            setSelectedQuestion(response.data);
            setShowViewModal(true);
        } catch (err) {
            console.error(
                "Failed to load question:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load question details."
            );
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedQuestion(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!form.questionText.trim()) {
            setError("Question text is required.");
            return false;
        }

        if (!form.optionA.trim()) {
            setError("Option A is required.");
            return false;
        }

        if (!form.optionB.trim()) {
            setError("Option B is required.");
            return false;
        }

        if (!form.optionC.trim()) {
            setError("Option C is required.");
            return false;
        }

        if (!form.optionD.trim()) {
            setError("Option D is required.");
            return false;
        }

        if (!form.correctAnswer) {
            setError("Please select the correct answer.");
            return false;
        }

        if (
            !form.marks ||
            Number(form.marks) < 1 ||
            Number(form.marks) > 100
        ) {
            setError("Marks must be between 1 and 100.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setActionLoading(true);

        try {
            if (editingQuestion) {
                const payload = {
                    questionText:
                        form.questionText.trim(),
                    optionA: form.optionA.trim(),
                    optionB: form.optionB.trim(),
                    optionC: form.optionC.trim(),
                    optionD: form.optionD.trim(),
                    correctAnswer:
                        form.correctAnswer,
                    marks: Number(form.marks),
                };

                await api.put(
                    `/RecruiterAssessmentQuestion/${editingQuestion.id}`,
                    payload,
                    getHeaders()
                );

                setSuccess(
                    "Question updated successfully."
                );
            } else {
                const payload = {
                    assessmentId: Number(assessmentId),
                    questionText:
                        form.questionText.trim(),
                    optionA: form.optionA.trim(),
                    optionB: form.optionB.trim(),
                    optionC: form.optionC.trim(),
                    optionD: form.optionD.trim(),
                    correctAnswer:
                        form.correctAnswer,
                    marks: Number(form.marks),
                };

                await api.post(
                    "/RecruiterAssessmentQuestion",
                    payload,
                    getHeaders()
                );

                setSuccess(
                    "Question created successfully."
                );
            }

            setShowFormModal(false);
            setEditingQuestion(null);
            resetForm();

            await fetchQuestions();
        } catch (err) {
            console.error(
                "Question save failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save question."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async (question) => {
        setError("");
        setSuccess("");
        setActionLoading(true);

        try {
            await api.put(
                `/RecruiterAssessmentQuestion/${question.id}/status`,
                !question.isActive,
                getHeaders()
            );

            setSuccess(
                question.isActive
                    ? "Question deactivated successfully."
                    : "Question activated successfully."
            );

            await fetchQuestions();
        } catch (err) {
            console.error(
                "Question status update failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update question status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (question) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setActionLoading(true);

        try {
            await api.delete(
                `/RecruiterAssessmentQuestion/${question.id}`,
                getHeaders()
            );

            setSuccess(
                "Question deleted successfully."
            );

            await fetchQuestions();
        } catch (err) {
            console.error(
                "Question delete failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete question."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusClass = (active) => {
        return active
            ? "professional-status professional-status-active"
            : "professional-status professional-status-inactive";
    };

    return (
        <RecruiterLayout activePage="assessments">
            <div className="admin-page recruiters-page recruiter-assessment-questions-page">

                {/* =========================
                    PAGE HEADER
                ========================= */}

                <div className="recruiters-page-header">

                    <div>
                        <button
                            type="button"
                            className="assessment-back-button"
                            onClick={() =>
                                navigate(
                                    "/recruiter/assessments"
                                )
                            }
                        >
                            ← Back to Assessments
                        </button>

                        <span className="page-eyebrow">
                            QUESTION MANAGEMENT
                        </span>

                        <h2>
                            Assessment Questions
                        </h2>

                        <p>
                            Create and manage questions for this
                            recruitment assessment.
                        </p>
                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">
                            <span>
                                Total Questions
                            </span>

                            <strong>
                                {questions.length}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="create-recruiter-button"
                            onClick={openCreateModal}
                            disabled={
                                !assessment ||
                                !assessment.isActive
                            }
                        >
                            + Add Question
                        </button>

                    </div>
                </div>

                {/* =========================
                    ASSESSMENT INFO
                ========================= */}

                {assessment && (
                    <div className="assessment-question-summary">

                        <div className="assessment-question-summary-main">
                            <span>
                                ASSESSMENT
                            </span>

                            <h3>
                                {assessment.title}
                            </h3>

                            <p>
                                {assessment.description ||
                                    "No assessment description provided."}
                            </p>
                        </div>

                        <div className="assessment-question-summary-stats">

                            <div>
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

                            <div>
                                <span>
                                    Passing Score
                                </span>

                                <strong>
                                    {
                                        assessment.passingScore
                                    }
                                    %
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Status
                                </span>

                                <strong
                                    className={
                                        assessment.isActive
                                            ? "summary-status-active"
                                            : "summary-status-inactive"
                                    }
                                >
                                    {assessment.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </strong>
                            </div>

                        </div>
                    </div>
                )}

                {/* =========================
                    ALERTS
                ========================= */}

                {error &&
                    !showFormModal &&
                    !showViewModal && (
                        <div className="admin-alert admin-alert-error">
                            {error}
                        </div>
                    )}

                {success &&
                    !showFormModal &&
                    !showViewModal && (
                        <div className="admin-alert admin-alert-success">
                            {success}
                        </div>
                    )}

                {/* =========================
                    QUESTION CARD
                ========================= */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>
                            <h3>
                                Question List
                            </h3>

                            <p>
                                Manage multiple-choice questions
                                included in this assessment.
                            </p>
                        </div>

                    </div>

                    <div className="users-table-container">

                        {loading ? (
                            <div className="table-empty-state">
                                Loading questions...
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="questions-empty-state">

                                <div className="questions-empty-icon">
                                    ?
                                </div>

                                <h4>
                                    No questions added yet
                                </h4>

                                <p>
                                    Add questions to build this
                                    assessment.
                                </p>

                                <button
                                    type="button"
                                    className="create-recruiter-button"
                                    onClick={
                                        openCreateModal
                                    }
                                    disabled={
                                        !assessment ||
                                        !assessment.isActive
                                    }
                                >
                                    + Add First Question
                                </button>

                            </div>
                        ) : (
                            <table className="professional-users-table">

                                <thead>
                                    <tr>
                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Question
                                        </th>

                                        <th>
                                            Correct Answer
                                        </th>

                                        <th>
                                            Marks
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created
                                        </th>

                                        <th>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {questions.map(
                                        (question, index) => (
                                            <tr
                                                key={
                                                    question.id
                                                }
                                            >

                                                <td>
                                                    <div className="question-number">
                                                        {index + 1}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="question-table-cell">

                                                        <strong>
                                                            {
                                                                question.questionText
                                                            }
                                                        </strong>

                                                        <span>
                                                            Question #
                                                            {
                                                                question.id
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="correct-answer-badge">
                                                        {
                                                            question.correctAnswer
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="question-marks">
                                                        {
                                                            question.marks
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={getStatusClass(
                                                            question.isActive
                                                        )}
                                                    >
                                                        {question.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="joined-date">
                                                        {new Date(
                                                            question.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="professional-actions">

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    question
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="professional-edit-button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    question
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={
                                                                question.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    question
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            {question.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="professional-delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    question
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>
                        )}

                    </div>

                </div>

                {/* =========================
                    CREATE / EDIT MODAL
                ========================= */}

                {showFormModal && (
                    <div
                        className="professional-modal-overlay"
                        onClick={closeFormModal}
                    >
                        <div
                            className="professional-modal question-form-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="professional-modal-header">

                                <div>
                                    <span>
                                        QUESTION MANAGEMENT
                                    </span>

                                    <h2>
                                        {editingQuestion
                                            ? "Edit Question"
                                            : "Add Question"}
                                    </h2>

                                    <p>
                                        {editingQuestion
                                            ? "Update the assessment question."
                                            : "Add a new multiple-choice question to this assessment."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeFormModal
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            {(error || success) && (
                                <div
                                    className={
                                        error
                                            ? "admin-alert admin-alert-error"
                                            : "admin-alert admin-alert-success"
                                    }
                                >
                                    {error || success}
                                </div>
                            )}

                            <form
                                className="create-recruiter-form"
                                onSubmit={handleSubmit}
                            >

                                <div className="recruiter-form-field">

                                    <label>
                                        Question
                                    </label>

                                    <textarea
                                        name="questionText"
                                        value={
                                            form.questionText
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter the assessment question"
                                        style={{
                                            width: "100%",
                                            minHeight: "90px",
                                            padding:
                                                "12px 14px",
                                            border:
                                                "1px solid #d9dee8",
                                            borderRadius:
                                                "8px",
                                            fontSize:
                                                "14px",
                                            fontFamily:
                                                "inherit",
                                            color:
                                                "#1f2937",
                                            backgroundColor:
                                                "#ffffff",
                                            outline:
                                                "none",
                                            resize:
                                                "vertical",
                                            boxSizing:
                                                "border-box",
                                        }}
                                    />

                                </div>

                                <div className="question-options-grid">

                                    <div className="recruiter-form-field">
                                        <label>
                                            Option A
                                        </label>

                                        <input
                                            type="text"
                                            name="optionA"
                                            value={
                                                form.optionA
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter option A"
                                        />
                                    </div>

                                    <div className="recruiter-form-field">
                                        <label>
                                            Option B
                                        </label>

                                        <input
                                            type="text"
                                            name="optionB"
                                            value={
                                                form.optionB
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter option B"
                                        />
                                    </div>

                                    <div className="recruiter-form-field">
                                        <label>
                                            Option C
                                        </label>

                                        <input
                                            type="text"
                                            name="optionC"
                                            value={
                                                form.optionC
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter option C"
                                        />
                                    </div>

                                    <div className="recruiter-form-field">
                                        <label>
                                            Option D
                                        </label>

                                        <input
                                            type="text"
                                            name="optionD"
                                            value={
                                                form.optionD
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter option D"
                                        />
                                    </div>

                                </div>

                                <div className="question-form-grid">

                                    <div className="recruiter-form-field">

                                        <label>
                                            Correct Answer
                                        </label>

                                        <select
                                            name="correctAnswer"
                                            value={
                                                form.correctAnswer
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        >
                                            <option value="">
                                                Select Correct Answer
                                            </option>

                                            <option value="A">
                                                Option A
                                            </option>

                                            <option value="B">
                                                Option B
                                            </option>

                                            <option value="C">
                                                Option C
                                            </option>

                                            <option value="D">
                                                Option D
                                            </option>
                                        </select>

                                    </div>

                                    <div className="recruiter-form-field">

                                        <label>
                                            Marks
                                        </label>

                                        <input
                                            type="number"
                                            name="marks"
                                            min="1"
                                            max="100"
                                            value={
                                                form.marks
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="recruiter-create-info">

                                    <strong>
                                        Question configuration
                                    </strong>

                                    <span>
                                        Select the correct option
                                        and assign marks for this
                                        question.
                                    </span>

                                </div>

                                <div className="create-recruiter-actions">

                                    <button
                                        type="button"
                                        className="clear-filter-button"
                                        onClick={
                                            closeFormModal
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="apply-filter-button"
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        {actionLoading
                                            ? "Saving..."
                                            : editingQuestion
                                                ? "Update Question"
                                                : "Add Question"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* =========================
                    VIEW MODAL
                ========================= */}

                {showViewModal &&
                    selectedQuestion && (
                        <div
                            className="professional-modal-overlay"
                            onClick={
                                closeViewModal
                            }
                        >

                            <div
                                className="professional-modal question-view-modal"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >

                                <div className="professional-modal-header">

                                    <div>
                                        <span>
                                            QUESTION DETAILS
                                        </span>

                                        <h2>
                                            Question #
                                            {
                                                selectedQuestion.id
                                            }
                                        </h2>

                                        <p>
                                            View the complete
                                            assessment question.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                                <div className="question-view-content">

                                    <div className="question-view-text">
                                        <span>
                                            QUESTION
                                        </span>

                                        <p>
                                            {
                                                selectedQuestion.questionText
                                            }
                                        </p>
                                    </div>

                                    <div className="question-view-options">

                                        <div className="question-view-option">
                                            <span>
                                                A
                                            </span>

                                            <strong>
                                                {
                                                    selectedQuestion.optionA
                                                }
                                            </strong>
                                        </div>

                                        <div className="question-view-option">
                                            <span>
                                                B
                                            </span>

                                            <strong>
                                                {
                                                    selectedQuestion.optionB
                                                }
                                            </strong>
                                        </div>

                                        <div className="question-view-option">
                                            <span>
                                                C
                                            </span>

                                            <strong>
                                                {
                                                    selectedQuestion.optionC
                                                }
                                            </strong>
                                        </div>

                                        <div className="question-view-option">
                                            <span>
                                                D
                                            </span>

                                            <strong>
                                                {
                                                    selectedQuestion.optionD
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="question-view-summary">

                                        <div>
                                            <span>
                                                Correct Answer
                                            </span>

                                            <strong>
                                                {
                                                    selectedQuestion.correctAnswer
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Marks
                                            </span>

                                            <strong>
                                                {
                                                    selectedQuestion.marks
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {selectedQuestion.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                                <div className="create-recruiter-actions">

                                    <button
                                        type="button"
                                        className="clear-filter-button"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        className="apply-filter-button"
                                        onClick={() => {
                                            closeViewModal();

                                            openEditModal(
                                                selectedQuestion
                                            );
                                        }}
                                    >
                                        Edit Question
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}

            </div>
        </RecruiterLayout>
    );
};

export default RecruiterAssessmentQuestions;