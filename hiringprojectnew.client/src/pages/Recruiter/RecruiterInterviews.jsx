import { useEffect, useState } from "react";

import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterInterviews = () => {
    // =========================================================
    // DATA
    // =========================================================

    const [interviews, setInterviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // FILTERS
    // =========================================================

    const [search, setSearch] = useState("");
    const [interviewType, setInterviewType] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // =========================================================
    // PAGINATION
    // =========================================================

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // =========================================================
    // MODALS
    // =========================================================

    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingInterview, setEditingInterview] =
        useState(null);

    const [selectedInterview, setSelectedInterview] =
        useState(null);

    // =========================================================
    // FORM
    // =========================================================

    const [form, setForm] = useState({
        applicationId: "",
        interviewType: "Technical",
        scheduledAt: "",
        durationMinutes: 60,
        meetingLink: "",
        location: "",
        interviewerName: "",
        interviewerEmail: "",
        notes: "",
    });

    // =========================================================
    // AUTH
    // =========================================================

    const token =
        localStorage.getItem("smartHireToken");

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDateTimeForInput = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const hours = String(
            date.getHours()
        ).padStart(2, "0");

        const minutes = String(
            date.getMinutes()
        ).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
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
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================================================
    // FETCH INTERVIEWS
    // =========================================================

    const fetchInterviews = async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.append(
                    "Search",
                    search.trim()
                );
            }

            if (interviewType) {
                params.append(
                    "InterviewType",
                    interviewType
                );
            }

            if (status) {
                params.append(
                    "Status",
                    status
                );
            }

            if (fromDate) {
                params.append(
                    "FromDate",
                    fromDate
                );
            }

            if (toDate) {
                params.append(
                    "ToDate",
                    toDate
                );
            }

            params.append(
                "PageNumber",
                pageNumber
            );

            params.append(
                "PageSize",
                pageSize
            );

            const queryString =
                params.toString();

            const response = await api.get(
                `/RecruiterInterview${queryString
                    ? `?${queryString}`
                    : ""
                }`,
                getHeaders()
            );

            setInterviews(
                response.data.interviews || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 1
            );
        } catch (err) {
            console.error(
                "Failed to load interviews:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load interviews."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchInterviews();
    }, [pageNumber]);

    // =========================================================
    // FILTERS
    // =========================================================

    const handleApplyFilter = () => {
        setPageNumber(1);

        setTimeout(() => {
            fetchInterviews();
        }, 0);
    };

    const handleClearFilter = () => {
        setSearch("");
        setInterviewType("");
        setStatus("");
        setFromDate("");
        setToDate("");
        setPageNumber(1);

        setTimeout(() => {
            fetchInterviews();
        }, 0);
    };

    // =========================================================
    // FORM RESET
    // =========================================================

    const resetForm = () => {
        setForm({
            applicationId: "",
            interviewType: "Technical",
            scheduledAt: "",
            durationMinutes: 60,
            meetingLink: "",
            location: "",
            interviewerName: "",
            interviewerEmail: "",
            notes: "",
        });
    };

    // =========================================================
    // CREATE
    // =========================================================

    const openCreateModal = () => {
        setEditingInterview(null);
        resetForm();

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // EDIT
    // =========================================================

    const openEditModal = (interview) => {
        setEditingInterview(interview);

        setForm({
            applicationId:
                interview.applicationId || "",

            interviewType:
                interview.interviewType ||
                "Technical",

            scheduledAt:
                formatDateTimeForInput(
                    interview.scheduledAt
                ),

            durationMinutes:
                interview.durationMinutes || 60,

            meetingLink:
                interview.meetingLink || "",

            location:
                interview.location || "",

            interviewerName:
                interview.interviewerName || "",

            interviewerEmail:
                interview.interviewerEmail || "",

            notes:
                interview.notes || "",
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // CLOSE CREATE / EDIT
    // =========================================================

    const closeFormModal = () => {
        if (actionLoading) {
            return;
        }

        setShowFormModal(false);
        setEditingInterview(null);

        resetForm();
    };

    // =========================================================
    // VIEW
    // =========================================================

    const openViewModal = async (interview) => {
        setError("");

        try {
            const response = await api.get(
                `/RecruiterInterview/${interview.id}`,
                getHeaders()
            );

            setSelectedInterview(
                response.data
            );

            setShowViewModal(true);
        } catch (err) {
            console.error(
                "Failed to load interview:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load interview details."
            );
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedInterview(null);
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        if (!form.applicationId) {
            setError(
                "Application ID is required."
            );

            return false;
        }

        if (!form.interviewType) {
            setError(
                "Interview type is required."
            );

            return false;
        }

        if (!form.scheduledAt) {
            setError(
                "Interview date and time are required."
            );

            return false;
        }

        const selectedDate =
            new Date(form.scheduledAt);

        if (
            Number.isNaN(
                selectedDate.getTime()
            )
        ) {
            setError(
                "Please enter a valid interview date and time."
            );

            return false;
        }

        if (
            selectedDate <= new Date()
        ) {
            setError(
                "Interview date and time must be in the future."
            );

            return false;
        }

        if (
            !form.durationMinutes ||
            Number(form.durationMinutes) < 15 ||
            Number(form.durationMinutes) > 480
        ) {
            setError(
                "Duration must be between 15 and 480 minutes."
            );

            return false;
        }

        if (
            form.interviewerEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.interviewerEmail
            )
        ) {
            setError(
                "Please enter a valid interviewer email."
            );

            return false;
        }

        return true;
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setActionLoading(true);

        try {
            const scheduledAt =
                new Date(
                    form.scheduledAt
                ).toISOString();

            const payload = {
                applicationId:
                    Number(
                        form.applicationId
                    ),

                interviewType:
                    form.interviewType,

                scheduledAt:
                    scheduledAt,

                durationMinutes:
                    Number(
                        form.durationMinutes
                    ),

                meetingLink:
                    form.meetingLink.trim(),

                location:
                    form.location.trim(),

                interviewerName:
                    form.interviewerName.trim(),

                interviewerEmail:
                    form.interviewerEmail.trim(),

                notes:
                    form.notes.trim(),
            };

            if (editingInterview) {
                await api.put(
                    `/RecruiterInterview/${editingInterview.id}`,
                    payload,
                    getHeaders()
                );

                setSuccess(
                    "Interview updated successfully."
                );
            } else {
                await api.post(
                    "/RecruiterInterview",
                    payload,
                    getHeaders()
                );

                setSuccess(
                    "Interview scheduled successfully."
                );
            }

            setShowFormModal(false);
            setEditingInterview(null);

            resetForm();

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Interview save failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save interview."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // STATUS
    // =========================================================

    const handleStatusChange = async (
        interview,
        newStatus
    ) => {
        setError("");
        setSuccess("");
        setActionLoading(true);

        try {
            await api.put(
                `/RecruiterInterview/${interview.id}/status`,
                newStatus,
                getHeaders()
            );

            setSuccess(
                `Interview marked as ${newStatus}.`
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Interview status update failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update interview status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (
        interview
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this interview?"
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setActionLoading(true);

        try {
            await api.delete(
                `/RecruiterInterview/${interview.id}`,
                getHeaders()
            );

            setSuccess(
                "Interview deleted successfully."
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Interview delete failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete interview."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        interviewStatus
    ) => {
        switch (interviewStatus) {
            case "Scheduled":
                return "interview-status interview-status-scheduled";

            case "Completed":
                return "interview-status interview-status-completed";

            case "Rescheduled":
                return "interview-status interview-status-rescheduled";

            case "Cancelled":
                return "interview-status interview-status-cancelled";

            case "No Show":
                return "interview-status interview-status-no-show";

            default:
                return "professional-status";
        }
    };

    const isFinalStatus = (
        interviewStatus
    ) => {
        return (
            interviewStatus ===
            "Completed" ||
            interviewStatus ===
            "Cancelled" ||
            interviewStatus ===
            "No Show"
        );
    };

    // =========================================================
    // MODAL STYLING
    // SAME AS JOB DETAILS SCREENSHOT
    // =========================================================

    const modalOverlayStyle = {
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        background:
            "rgba(15, 30, 55, 0.55)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter:
            "blur(7px)",
    };

    const modalContainerStyle = {
        width:
            "min(900px, calc(100vw - 40px))",
        maxHeight:
            "calc(100vh - 50px)",
        background: "#ffffff",
        borderRadius: "15px",
        overflow: "hidden",
        boxShadow:
            "0 25px 70px rgba(15, 30, 55, 0.28)",
        display: "flex",
        flexDirection: "column",
    };

    const modalHeaderStyle = {
        background:
            "linear-gradient(135deg, #21439a 0%, #2862e5 100%)",
        padding: "25px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexShrink: 0,
    };

    const modalEyebrowStyle = {
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.2px",
        textTransform: "uppercase",

        /*
         * Same blue text as Job Details screenshot.
         */
        color: "#3b6fd8",

        marginBottom: "7px",
    };

    const modalTitleStyle = {
        margin: "0 0 6px",
        fontSize: "24px",
        lineHeight: "1.2",

        /*
         * Dark navy like Job Details screenshot.
         */
        color: "#142d53",

        fontWeight: "700",
    };

    const modalSubtitleStyle = {
        margin: "0",
        fontSize: "13px",

        /*
         * Muted blue-gray like screenshot.
         */
        color: "#91a4c3",
    };

    const modalCloseButtonStyle = {
        width: "34px",
        height: "34px",
        border: "none",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#52709b",
        fontSize: "22px",
        cursor: "pointer",
        lineHeight: "1",
        flexShrink: 0,
    };

    const modalBodyStyle = {
        padding: "28px",
        overflowY: "auto",
        flex: 1,
    };

    const modalFooterStyle = {
        borderTop:
            "1px solid #e2e8f0",

        padding:
            "14px 24px",

        display: "flex",

        justifyContent:
            "flex-end",

        alignItems: "center",

        gap: "10px",

        background:
            "#ffffff",

        flexShrink: 0,
    };

    const modalInfoCardStyle = {
        padding: "16px",

        border:
            "1px solid #d8e2f0",

        background:
            "#f8fafc",

        borderRadius: "10px",
    };

    const modalInfoLabelStyle = {
        display: "block",

        fontSize: "10px",

        color: "#526984",

        marginBottom: "7px",

        fontWeight: "700",

        textTransform:
            "uppercase",

        letterSpacing:
            "0.5px",
    };

    const modalInfoValueStyle = {
        color: "#111827",
        fontSize: "14px",
        fontWeight: "700",
    };

    const modalInfoSmallStyle = {
        display: "block",

        marginTop: "5px",

        color: "#71839d",

        fontSize: "12px",
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <RecruiterLayout activePage="interviews">

            <div className="admin-page recruiters-page recruiter-interviews-page">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="recruiters-page-header">

                    <div>

                        <span className="page-eyebrow">
                            INTERVIEW MANAGEMENT
                        </span>

                        <h2>
                            Interviews
                        </h2>

                        <p>
                            Schedule and manage candidate
                            interviews throughout your
                            recruitment process.
                        </p>

                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                Total Interviews
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                        <button
                            type="button"
                            className="create-recruiter-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Schedule Interview
                        </button>

                    </div>

                </div>

                {/* =====================================================
                    ALERTS
                ===================================================== */}

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

                {/* =====================================================
                    MAIN CARD
                ===================================================== */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>

                            <h3>
                                Interview List
                            </h3>

                            <p>
                                Manage scheduled interviews
                                and candidate interview activity.
                            </p>

                        </div>

                    </div>

                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <div className="users-filter-section">

                        <div className="users-filter-grid recruiter-filter-grid">

                            {/* SEARCH */}

                            <div className="filter-field search-field">

                                <label>
                                    Search
                                </label>

                                <div className="search-input-wrapper">

                                    <span className="search-icon">
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        className="search-input"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search candidate, job or interviewer..."
                                    />

                                </div>

                            </div>

                            {/* INTERVIEW TYPE */}

                            <div className="filter-field">

                                <label>
                                    Interview Type
                                </label>

                                <select
                                    value={
                                        interviewType
                                    }
                                    onChange={(e) =>
                                        setInterviewType(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Types
                                    </option>

                                    <option value="Technical">
                                        Technical
                                    </option>

                                    <option value="HR">
                                        HR
                                    </option>

                                    <option value="Managerial">
                                        Managerial
                                    </option>

                                    <option value="Behavioral">
                                        Behavioral
                                    </option>

                                    <option value="Final">
                                        Final
                                    </option>

                                </select>

                            </div>

                            {/* STATUS */}

                            <div className="filter-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="Scheduled">
                                        Scheduled
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Rescheduled">
                                        Rescheduled
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                    <option value="No Show">
                                        No Show
                                    </option>

                                </select>

                            </div>

                            {/* FROM DATE */}

                            <div className="filter-field">

                                <label>
                                    From Date
                                </label>

                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) =>
                                        setFromDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* TO DATE */}

                            <div className="filter-field">

                                <label>
                                    To Date
                                </label>

                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) =>
                                        setToDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* BUTTONS */}

                            <div className="filter-actions">

                                <button
                                    type="button"
                                    className="apply-filter-button"
                                    onClick={
                                        handleApplyFilter
                                    }
                                >
                                    Apply Filter
                                </button>

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={
                                        handleClearFilter
                                    }
                                >
                                    Clear
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="users-table-container">

                        {loading ? (

                            <div className="table-empty-state">
                                Loading interviews...
                            </div>

                        ) : interviews.length === 0 ? (

                            <div className="table-empty-state">
                                No interviews found.
                            </div>

                        ) : (

                            <table className="professional-users-table">

                                <thead>

                                    <tr>

                                        <th>
                                            CANDIDATE
                                        </th>

                                        <th>
                                            JOB
                                        </th>

                                        <th>
                                            TYPE
                                        </th>

                                        <th>
                                            SCHEDULED
                                        </th>

                                        <th>
                                            INTERVIEWER
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            ACTIONS
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {interviews.map(
                                        (interview) => (

                                            <tr
                                                key={
                                                    interview.id
                                                }
                                            >

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {interview.candidateName
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    interview.candidateName
                                                                }
                                                            </strong>

                                                            <span className="professional-email">
                                                                {
                                                                    interview.candidateEmail
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="interview-job-cell">

                                                        <strong>
                                                            {
                                                                interview.jobTitle
                                                            }
                                                        </strong>

                                                        <span>
                                                            Application #
                                                            {
                                                                interview.applicationId
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="interview-type-badge">
                                                        {
                                                            interview.interviewType
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="interview-date-cell">

                                                        <strong>
                                                            {formatDateTime(
                                                                interview.scheduledAt
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {
                                                                interview.durationMinutes
                                                            }{" "}
                                                            minutes
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="interviewer-cell">

                                                        <strong>
                                                            {
                                                                interview.interviewerName ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                interview.interviewerEmail ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={getStatusClass(
                                                            interview.status
                                                        )}
                                                    >
                                                        {
                                                            interview.status
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="professional-actions">

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    interview
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        {!isFinalStatus(
                                                            interview.status
                                                        ) && (

                                                                <>

                                                                    <button
                                                                        type="button"
                                                                        className="professional-edit-button"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                interview
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    {interview.status !==
                                                                        "Completed" && (

                                                                            <button
                                                                                type="button"
                                                                                className="professional-activate"
                                                                                onClick={() =>
                                                                                    handleStatusChange(
                                                                                        interview,
                                                                                        "Completed"
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    actionLoading
                                                                                }
                                                                            >
                                                                                Complete
                                                                            </button>

                                                                        )}

                                                                    {interview.status !==
                                                                        "Cancelled" && (

                                                                            <button
                                                                                type="button"
                                                                                className="professional-deactivate"
                                                                                onClick={() =>
                                                                                    handleStatusChange(
                                                                                        interview,
                                                                                        "Cancelled"
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    actionLoading
                                                                                }
                                                                            >
                                                                                Cancel
                                                                            </button>

                                                                        )}

                                                                </>

                                                            )}

                                                        {interview.status !==
                                                            "Completed" && (

                                                                <button
                                                                    type="button"
                                                                    className="professional-delete-button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            interview
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>

                                                            )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {totalRecords > 0 && (

                        <div className="professional-pagination">

                            <div className="pagination-info">

                                Showing page{" "}

                                <strong>
                                    {pageNumber}
                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {totalPages}
                                </strong>

                            </div>

                            <div className="pagination-controls">

                                <button
                                    type="button"
                                    disabled={
                                        pageNumber <=
                                        1
                                    }
                                    onClick={() =>
                                        setPageNumber(
                                            (previous) =>
                                                Math.max(
                                                    1,
                                                    previous -
                                                    1
                                                )
                                        )
                                    }
                                >
                                    Previous
                                </button>

                                {Array.from(
                                    {
                                        length:
                                            totalPages,
                                    },
                                    (_, index) =>
                                        index + 1
                                )
                                    .slice(
                                        0,
                                        5
                                    )
                                    .map(
                                        (page) => (

                                            <button
                                                key={
                                                    page
                                                }
                                                type="button"
                                                className={
                                                    pageNumber ===
                                                        page
                                                        ? "pagination-active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setPageNumber(
                                                        page
                                                    )
                                                }
                                            >
                                                {page}
                                            </button>

                                        )
                                    )}

                                <button
                                    type="button"
                                    disabled={
                                        pageNumber >=
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPageNumber(
                                            (previous) =>
                                                Math.min(
                                                    totalPages,
                                                    previous +
                                                    1
                                                )
                                        )
                                    }
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    )}

                </div>

                {/* =====================================================
                    CREATE / EDIT INTERVIEW MODAL
                ===================================================== */}

                {showFormModal && (

                    <div
                        style={
                            modalOverlayStyle
                        }
                        onClick={
                            closeFormModal
                        }
                    >

                        <div
                            style={
                                modalContainerStyle
                            }
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            {/* HEADER */}

                            <div
                                style={
                                    modalHeaderStyle
                                }
                            >

                                <div>

                                    <div
                                        style={
                                            modalEyebrowStyle
                                        }
                                    >
                                        INTERVIEW MANAGEMENT
                                    </div>

                                    <h2
                                        style={
                                            modalTitleStyle
                                        }
                                    >
                                        {editingInterview
                                            ? "Edit Interview"
                                            : "Schedule Interview"}
                                    </h2>

                                    <p
                                        style={
                                            modalSubtitleStyle
                                        }
                                    >
                                        {editingInterview
                                            ? "Update or reschedule the candidate interview."
                                            : "Schedule a new interview for a candidate application."}
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
                                    style={
                                        modalCloseButtonStyle
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            {/* BODY */}

                            <form
                                className="create-recruiter-form"
                                onSubmit={
                                    handleSubmit
                                }
                                style={{
                                    overflowY:
                                        "auto",
                                }}
                            >

                                {(error ||
                                    success) && (

                                        <div
                                            className={
                                                error
                                                    ? "admin-alert admin-alert-error"
                                                    : "admin-alert admin-alert-success"
                                            }
                                        >
                                            {
                                                error ||
                                                success
                                            }
                                        </div>

                                    )}

                                <div className="interview-form-grid">

                                    {/* APPLICATION */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Application ID
                                        </label>

                                        <input
                                            type="number"
                                            name="applicationId"
                                            min="1"
                                            value={
                                                form.applicationId
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter application ID"
                                            disabled={
                                                Boolean(
                                                    editingInterview
                                                )
                                            }
                                        />

                                        <small>
                                            Use the application ID from the recruiter applicant list.
                                        </small>

                                    </div>

                                    {/* TYPE */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Interview Type
                                        </label>

                                        <select
                                            name="interviewType"
                                            value={
                                                form.interviewType
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        >

                                            <option value="Technical">
                                                Technical
                                            </option>

                                            <option value="HR">
                                                HR
                                            </option>

                                            <option value="Managerial">
                                                Managerial
                                            </option>

                                            <option value="Behavioral">
                                                Behavioral
                                            </option>

                                            <option value="Final">
                                                Final
                                            </option>

                                        </select>

                                    </div>

                                    {/* DATE */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Scheduled Date & Time
                                        </label>

                                        <input
                                            type="datetime-local"
                                            name="scheduledAt"
                                            value={
                                                form.scheduledAt
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>

                                    {/* DURATION */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Duration
                                        </label>

                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            min="15"
                                            max="480"
                                            value={
                                                form.durationMinutes
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>

                                    {/* INTERVIEWER NAME */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Interviewer Name
                                        </label>

                                        <input
                                            type="text"
                                            name="interviewerName"
                                            value={
                                                form.interviewerName
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter interviewer name"
                                        />

                                    </div>

                                    {/* INTERVIEWER EMAIL */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Interviewer Email
                                        </label>

                                        <input
                                            type="email"
                                            name="interviewerEmail"
                                            value={
                                                form.interviewerEmail
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter interviewer email"
                                        />

                                    </div>

                                    {/* MEETING LINK */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Meeting Link
                                        </label>

                                        <input
                                            type="url"
                                            name="meetingLink"
                                            value={
                                                form.meetingLink
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="https://..."
                                        />

                                    </div>

                                    {/* LOCATION */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Location
                                        </label>

                                        <input
                                            type="text"
                                            name="location"
                                            value={
                                                form.location
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Office / meeting room"
                                        />

                                    </div>

                                </div>

                                {/* NOTES */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={
                                            form.notes
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Add interview notes..."
                                        style={{
                                            width:
                                                "100%",
                                            minHeight:
                                                "90px",
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

                                {/* INFO */}

                                <div className="recruiter-create-info">

                                    <strong>
                                        Interview scheduling
                                    </strong>

                                    <span>
                                        New interviews are created with Scheduled status. Editing an existing interview marks it as Rescheduled.
                                    </span>

                                </div>

                                {/* FOOTER */}

                                <div
                                    style={
                                        modalFooterStyle
                                    }
                                >

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
                                            : editingInterview
                                                ? "Update Interview"
                                                : "Schedule Interview"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

                {/* =====================================================
                    VIEW INTERVIEW MODAL
                ===================================================== */}

                {showViewModal &&
                    selectedInterview && (

                        <div
                            style={
                                modalOverlayStyle
                            }
                            onClick={
                                closeViewModal
                            }
                        >

                            <div
                                style={
                                    modalContainerStyle
                                }
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >

                                {/* HEADER */}

                                <div
                                    style={
                                        modalHeaderStyle
                                    }
                                >

                                    <div>

                                        <div
                                            style={
                                                modalEyebrowStyle
                                            }
                                        >
                                            INTERVIEW DETAILS
                                        </div>

                                        <h2
                                            style={
                                                modalTitleStyle
                                            }
                                        >
                                            {
                                                selectedInterview.candidateName
                                            }
                                        </h2>

                                        <p
                                            style={
                                                modalSubtitleStyle
                                            }
                                        >
                                            {
                                                selectedInterview.jobTitle
                                            }
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closeViewModal
                                        }
                                        style={
                                            modalCloseButtonStyle
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                                {/* BODY */}

                                <div
                                    style={
                                        modalBodyStyle
                                    }
                                >

                                    {/* PROFILE */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap:
                                                "14px",
                                            paddingBottom:
                                                "20px",
                                            marginBottom:
                                                "22px",
                                            borderBottom:
                                                "1px solid #e2e8f0",
                                        }}
                                    >

                                        <div
                                            style={{
                                                width:
                                                    "52px",
                                                height:
                                                    "52px",
                                                borderRadius:
                                                    "11px",
                                                background:
                                                    "linear-gradient(135deg, #2454c4, #2862e5)",
                                                color:
                                                    "#ffffff",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                fontSize:
                                                    "20px",
                                                fontWeight:
                                                    "700",
                                                flexShrink:
                                                    0,
                                            }}
                                        >
                                            {selectedInterview
                                                .candidateName
                                                ?.charAt(
                                                    0
                                                )
                                                ?.toUpperCase() ||
                                                "C"}
                                        </div>

                                        <div>

                                            <div
                                                style={{
                                                    fontSize:
                                                        "17px",
                                                    fontWeight:
                                                        "700",
                                                    color:
                                                        "#111827",
                                                }}
                                            >
                                                {
                                                    selectedInterview.candidateName
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "3px",
                                                    fontSize:
                                                        "12px",
                                                    color:
                                                        "#526984",
                                                }}
                                            >
                                                Application #
                                                {
                                                    selectedInterview.applicationId
                                                }
                                            </div>

                                        </div>

                                    </div>

                                    {/* INFORMATION CARDS */}

                                    <div
                                        style={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "repeat(2, minmax(0, 1fr))",
                                            gap:
                                                "13px",
                                        }}
                                    >

                                        {/* CANDIDATE */}

                                        <div
                                            style={
                                                modalInfoCardStyle
                                            }
                                        >

                                            <span
                                                style={
                                                    modalInfoLabelStyle
                                                }
                                            >
                                                CANDIDATE
                                            </span>

                                            <strong
                                                style={
                                                    modalInfoValueStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.candidateName
                                                }
                                            </strong>

                                            <small
                                                style={
                                                    modalInfoSmallStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.candidateEmail ||
                                                    "-"
                                                }
                                            </small>

                                        </div>

                                        {/* JOB */}

                                        <div
                                            style={
                                                modalInfoCardStyle
                                            }
                                        >

                                            <span
                                                style={
                                                    modalInfoLabelStyle
                                                }
                                            >
                                                JOB
                                            </span>

                                            <strong
                                                style={
                                                    modalInfoValueStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.jobTitle ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>

                                        {/* TYPE */}

                                        <div
                                            style={
                                                modalInfoCardStyle
                                            }
                                        >

                                            <span
                                                style={
                                                    modalInfoLabelStyle
                                                }
                                            >
                                                INTERVIEW TYPE
                                            </span>

                                            <strong
                                                style={
                                                    modalInfoValueStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.interviewType ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>

                                        {/* SCHEDULED */}

                                        <div
                                            style={
                                                modalInfoCardStyle
                                            }
                                        >

                                            <span
                                                style={
                                                    modalInfoLabelStyle
                                                }
                                            >
                                                SCHEDULED
                                            </span>

                                            <strong
                                                style={
                                                    modalInfoValueStyle
                                                }
                                            >
                                                {formatDateTime(
                                                    selectedInterview.scheduledAt
                                                )}
                                            </strong>

                                            <small
                                                style={
                                                    modalInfoSmallStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.durationMinutes
                                                }{" "}
                                                minutes
                                            </small>

                                        </div>

                                        {/* INTERVIEWER */}

                                        <div
                                            style={
                                                modalInfoCardStyle
                                            }
                                        >

                                            <span
                                                style={
                                                    modalInfoLabelStyle
                                                }
                                            >
                                                INTERVIEWER
                                            </span>

                                            <strong
                                                style={
                                                    modalInfoValueStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.interviewerName ||
                                                    "-"
                                                }
                                            </strong>

                                            <small
                                                style={
                                                    modalInfoSmallStyle
                                                }
                                            >
                                                {
                                                    selectedInterview.interviewerEmail ||
                                                    "-"
                                                }
                                            </small>

                                        </div>

                                        {/* STATUS */}

                                        <div
                                            style={
                                                modalInfoCardStyle
                                            }
                                        >

                                            <span
                                                style={
                                                    modalInfoLabelStyle
                                                }
                                            >
                                                STATUS
                                            </span>

                                            <span
                                                className={getStatusClass(
                                                    selectedInterview.status
                                                )}
                                            >
                                                {
                                                    selectedInterview.status
                                                }
                                            </span>

                                        </div>

                                    </div>

                                    {/* MEETING */}

                                    <div
                                        style={{
                                            marginTop:
                                                "22px",
                                        }}
                                    >

                                        <div
                                            style={
                                                modalInfoLabelStyle
                                            }
                                        >
                                            MEETING LINK
                                        </div>

                                        <div
                                            style={{
                                                padding:
                                                    "13px 15px",
                                                background:
                                                    "#f8fafc",
                                                border:
                                                    "1px solid #e2e8f0",
                                                borderRadius:
                                                    "9px",
                                            }}
                                        >

                                            {selectedInterview.meetingLink ? (

                                                <a
                                                    href={
                                                        selectedInterview.meetingLink
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        color:
                                                            "#2862e5",
                                                        fontSize:
                                                            "14px",
                                                        fontWeight:
                                                            "600",
                                                        textDecoration:
                                                            "none",
                                                    }}
                                                >
                                                    {
                                                        selectedInterview.meetingLink
                                                    }
                                                </a>

                                            ) : (

                                                <span
                                                    style={{
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >
                                                    No meeting link provided
                                                </span>

                                            )}

                                        </div>

                                    </div>

                                    {/* LOCATION */}

                                    <div
                                        style={{
                                            marginTop:
                                                "20px",
                                        }}
                                    >

                                        <div
                                            style={
                                                modalInfoLabelStyle
                                            }
                                        >
                                            LOCATION
                                        </div>

                                        <div
                                            style={{
                                                color:
                                                    "#111827",
                                                fontSize:
                                                    "14px",
                                                padding:
                                                    "13px 15px",
                                                background:
                                                    "#f8fafc",
                                                border:
                                                    "1px solid #e2e8f0",
                                                borderRadius:
                                                    "9px",
                                            }}
                                        >
                                            {
                                                selectedInterview.location ||
                                                "No location provided"
                                            }
                                        </div>

                                    </div>

                                    {/* NOTES */}

                                    <div
                                        style={{
                                            marginTop:
                                                "20px",
                                        }}
                                    >

                                        <div
                                            style={
                                                modalInfoLabelStyle
                                            }
                                        >
                                            NOTES
                                        </div>

                                        <div
                                            style={{
                                                color:
                                                    "#334155",
                                                fontSize:
                                                    "14px",
                                                lineHeight:
                                                    "1.7",
                                                padding:
                                                    "13px 15px",
                                                background:
                                                    "#f8fafc",
                                                border:
                                                    "1px solid #e2e8f0",
                                                borderRadius:
                                                    "9px",
                                                whiteSpace:
                                                    "pre-wrap",
                                            }}
                                        >
                                            {
                                                selectedInterview.notes ||
                                                "No interview notes provided."
                                            }
                                        </div>

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div
                                    style={
                                        modalFooterStyle
                                    }
                                >

                                    <button
                                        type="button"
                                        className="clear-filter-button"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        Close
                                    </button>

                                    {!isFinalStatus(
                                        selectedInterview.status
                                    ) && (

                                            <button
                                                type="button"
                                                className="apply-filter-button"
                                                onClick={() => {
                                                    closeViewModal();

                                                    openEditModal(
                                                        selectedInterview
                                                    );
                                                }}
                                            >
                                                Edit Interview
                                            </button>

                                        )}

                                </div>

                            </div>

                        </div>

                    )}

            </div>

        </RecruiterLayout>
    );
};

export default RecruiterInterviews;