import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterAssessments = () => {
    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [assessments, setAssessments] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filters
    const [search, setSearch] = useState("");
    const [jobId, setJobId] = useState("");
    const [isActive, setIsActive] = useState("");

    // Pagination
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingAssessment, setEditingAssessment] =
        useState(null);

    const [selectedAssessment, setSelectedAssessment] =
        useState(null);

    // Form
    const [form, setForm] = useState({
        title: "",
        description: "",
        jobId: "",
        durationMinutes: 30,
        passingScore: 60,
    });

    // =========================================================
    // AUTH
    // =========================================================

    const getHeaders = () => {
        const token =
            localStorage.getItem("smartHireToken");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // =========================================================
    // FETCH JOBS
    // =========================================================

    const fetchJobs = async () => {
        try {
            const response = await api.get(
                "/RecruiterJob?pageNumber=1&pageSize=100&isActive=true",
                getHeaders()
            );

            setJobs(response.data.jobs || []);
        } catch (err) {
            console.error(
                "Failed to load jobs:",
                err
            );
        }
    };

    // =========================================================
    // FETCH ASSESSMENTS
    // =========================================================

    const fetchAssessments = async (
        page = pageNumber,
        currentSearch = search,
        currentJobId = jobId,
        currentStatus = isActive
    ) => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            params.append(
                "pageNumber",
                page
            );

            params.append(
                "pageSize",
                pageSize
            );

            if (currentSearch.trim()) {
                params.append(
                    "search",
                    currentSearch.trim()
                );
            }

            if (currentJobId) {
                params.append(
                    "jobId",
                    currentJobId
                );
            }

            if (currentStatus !== "") {
                params.append(
                    "isActive",
                    currentStatus
                );
            }

            const response = await api.get(
                `/RecruiterAssessment?${params.toString()}`,
                getHeaders()
            );

            setAssessments(
                response.data.assessments || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 1
            );
        } catch (err) {
            console.error(
                "Failed to load assessments:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );

                navigate("/login");

                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load assessments."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        fetchAssessments(
            pageNumber,
            search,
            jobId,
            isActive
        );
    }, [pageNumber]);

    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearch = () => {
        setPageNumber(1);

        fetchAssessments(
            1,
            search,
            jobId,
            isActive
        );
    };

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const handleClearFilters = () => {
        setSearch("");
        setJobId("");
        setIsActive("");
        setPageNumber(1);

        fetchAssessments(
            1,
            "",
            "",
            ""
        );
    };

    // =========================================================
    // CREATE MODAL
    // =========================================================

    const openCreateModal = () => {
        setEditingAssessment(null);

        setForm({
            title: "",
            description: "",
            jobId: "",
            durationMinutes: 30,
            passingScore: 60,
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // EDIT MODAL
    // =========================================================

    const openEditModal = (assessment) => {
        setEditingAssessment(
            assessment
        );

        setForm({
            title:
                assessment.title || "",

            description:
                assessment.description || "",

            jobId:
                assessment.jobId?.toString() ||
                "",

            durationMinutes:
                assessment.durationMinutes ||
                30,

            passingScore:
                assessment.passingScore ??
                60,
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // CLOSE FORM MODAL
    // =========================================================

    const closeFormModal = () => {
        if (actionLoading) {
            return;
        }

        setShowFormModal(false);
        setEditingAssessment(null);

        setForm({
            title: "",
            description: "",
            jobId: "",
            durationMinutes: 30,
            passingScore: 60,
        });
    };

    // =========================================================
    // VIEW MODAL
    // =========================================================

    const openViewModal = async (
        assessment
    ) => {
        setError("");

        try {
            const response = await api.get(
                `/RecruiterAssessment/${assessment.id}`,
                getHeaders()
            );

            setSelectedAssessment(
                response.data
            );

            setShowViewModal(true);
        } catch (err) {
            console.error(
                "Failed to load assessment:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load assessment details."
            );
        }
    };

    // =========================================================
    // CLOSE VIEW MODAL
    // =========================================================

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedAssessment(null);
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        if (!form.title.trim()) {
            setError(
                "Assessment title is required."
            );

            return false;
        }

        if (!form.jobId) {
            setError(
                "Please select a job."
            );

            return false;
        }

        if (
            !form.durationMinutes ||
            Number(form.durationMinutes) < 1
        ) {
            setError(
                "Duration must be at least 1 minute."
            );

            return false;
        }

        if (
            form.passingScore === "" ||
            Number(form.passingScore) < 0 ||
            Number(form.passingScore) > 100
        ) {
            setError(
                "Passing score must be between 0 and 100."
            );

            return false;
        }

        return true;
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setActionLoading(true);

        const payload = {
            title:
                form.title.trim(),

            description:
                form.description.trim(),

            jobId:
                Number(form.jobId),

            durationMinutes:
                Number(
                    form.durationMinutes
                ),

            passingScore:
                Number(
                    form.passingScore
                ),
        };

        try {
            if (editingAssessment) {
                await api.put(
                    `/RecruiterAssessment/${editingAssessment.id}`,
                    payload,
                    getHeaders()
                );

                setSuccess(
                    "Assessment updated successfully."
                );
            } else {
                await api.post(
                    "/RecruiterAssessment",
                    payload,
                    getHeaders()
                );

                setSuccess(
                    "Assessment created successfully."
                );
            }

            setShowFormModal(false);
            setEditingAssessment(null);

            setForm({
                title: "",
                description: "",
                jobId: "",
                durationMinutes: 30,
                passingScore: 60,
            });

            await fetchAssessments(
                pageNumber,
                search,
                jobId,
                isActive
            );
        } catch (err) {
            console.error(
                "Assessment save failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save assessment."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (
        assessment
    ) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${assessment.title}"?`
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setActionLoading(true);

        try {
            await api.delete(
                `/RecruiterAssessment/${assessment.id}`,
                getHeaders()
            );

            setSuccess(
                "Assessment deleted successfully."
            );

            await fetchAssessments(
                pageNumber,
                search,
                jobId,
                isActive
            );
        } catch (err) {
            console.error(
                "Assessment delete failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete assessment."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    const handleStatusChange = async (
        assessment
    ) => {
        setError("");
        setSuccess("");
        setActionLoading(true);

        try {
            await api.put(
                `/RecruiterAssessment/${assessment.id}/status`,
                !assessment.isActive,
                getHeaders()
            );

            setSuccess(
                assessment.isActive
                    ? "Assessment deactivated successfully."
                    : "Assessment activated successfully."
            );

            await fetchAssessments(
                pageNumber,
                search,
                jobId,
                isActive
            );
        } catch (err) {
            console.error(
                "Assessment status update failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update assessment status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // QUESTIONS
    // =========================================================

    const handleManageQuestions = (
        assessment
    ) => {
        navigate(
            `/recruiter/assessments/${assessment.id}/questions`
        );
    };

    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        active
    ) => {
        return active
            ? "professional-status professional-status-active"
            : "professional-status professional-status-inactive";
    };

    // =========================================================
    // COMMON MODAL OVERLAY STYLE
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

    // =========================================================
    // COMMON MODAL CONTAINER STYLE
    // =========================================================

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

    // =========================================================
    // COMMON BLUE HEADER STYLE
    // =========================================================

    const modalHeaderStyle = {
        background:
            "linear-gradient(135deg, #21439a 0%, #2862e5 100%)",
        padding: "24px",
        color: "#ffffff",
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "flex-start",
        flexShrink: 0,
    };

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <RecruiterLayout
            activePage="assessments"
        >
            <div className="admin-page recruiters-page recruiter-assessments-page">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="recruiters-page-header">

                    <div>

                        <span className="page-eyebrow">
                            ASSESSMENT MANAGEMENT
                        </span>

                        <h2>
                            Assessments
                        </h2>

                        <p>
                            Create and manage technical
                            assessments for your
                            recruitment process.
                        </p>

                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                Total Assessments
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
                            + Create Assessment
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
                                Assessment List
                            </h3>

                            <p>
                                Manage assessments
                                created for your jobs.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <div className="users-filter-section">

                        <div className="users-filter-grid recruiter-filter-grid">

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
                                        placeholder="Search assessment..."
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key ===
                                                "Enter"
                                            ) {
                                                handleSearch();
                                            }
                                        }}
                                    />

                                </div>

                            </div>


                            <div className="filter-field">

                                <label>
                                    Job
                                </label>

                                <select
                                    value={jobId}
                                    onChange={(event) => {
                                        setJobId(
                                            event.target.value
                                        );
                                        setPageNumber(1);
                                    }}
                                >

                                    <option value="">
                                        All Jobs
                                    </option>

                                    {jobs.map(
                                        (job) => (
                                            <option
                                                key={
                                                    job.id
                                                }
                                                value={
                                                    job.id
                                                }
                                            >
                                                {
                                                    job.title
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="filter-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={isActive}
                                    onChange={(event) => {
                                        setIsActive(
                                            event.target.value
                                        );
                                        setPageNumber(1);
                                    }}
                                >

                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="true">
                                        Active
                                    </option>

                                    <option value="false">
                                        Inactive
                                    </option>

                                </select>

                            </div>


                            <div className="filter-actions">

                                <button
                                    type="button"
                                    className="apply-filter-button"
                                    onClick={
                                        handleSearch
                                    }
                                >
                                    Apply Filter
                                </button>

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={
                                        handleClearFilters
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
                                Loading assessments...
                            </div>

                        ) : assessments.length ===
                            0 ? (

                            <div className="table-empty-state">
                                No assessments found.
                            </div>

                        ) : (

                            <table className="professional-users-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Assessment
                                        </th>

                                        <th>
                                            Job
                                        </th>

                                        <th>
                                            Duration
                                        </th>

                                        <th>
                                            Passing Score
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

                                    {assessments.map(
                                        (assessment) => (

                                            <tr
                                                key={
                                                    assessment.id
                                                }
                                            >

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {assessment.title
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    assessment.title
                                                                }
                                                            </strong>

                                                            <span className="professional-email">
                                                                Assessment #
                                                                {
                                                                    assessment.id
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="job-title-cell">
                                                        {
                                                            assessment.jobTitle ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        assessment.durationMinutes
                                                    }{" "}
                                                    min

                                                </td>


                                                <td>

                                                    {
                                                        assessment.passingScore
                                                    }
                                                    %

                                                </td>


                                                <td>

                                                    <span
                                                        className={getStatusClass(
                                                            assessment.isActive
                                                        )}
                                                    >

                                                        {
                                                            assessment.isActive
                                                                ? "Active"
                                                                : "Inactive"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="joined-date">

                                                        {assessment.createdAt
                                                            ? new Date(
                                                                assessment.createdAt
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )
                                                            : "-"}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="professional-actions">

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    assessment
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
                                                                    assessment
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="assessment-manage-questions-button"
                                                            onClick={() =>
                                                                handleManageQuestions(
                                                                    assessment
                                                                )
                                                            }
                                                        >
                                                            Questions
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                assessment.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    assessment
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            {assessment.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="professional-delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    assessment
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


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {!loading &&
                        assessments.length >
                        0 && (

                            <div className="professional-pagination">

                                <span>

                                    Showing page{" "}

                                    <strong>
                                        {pageNumber}
                                    </strong>

                                    {" "}of{" "}

                                    <strong>
                                        {totalPages}
                                    </strong>

                                </span>


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
                                                    previous -
                                                    1
                                            )
                                        }
                                    >
                                        Previous
                                    </button>


                                    <button
                                        type="button"
                                        disabled={
                                            pageNumber >=
                                            totalPages
                                        }
                                        onClick={() =>
                                            setPageNumber(
                                                (previous) =>
                                                    previous +
                                                    1
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
                    CREATE / EDIT ASSESSMENT MODAL
                    SAME BLUE HEADER STYLE
                ===================================================== */}

                {showFormModal && (

                    <div
                        onClick={
                            closeFormModal
                        }
                        style={
                            modalOverlayStyle
                        }
                    >

                        <div
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            style={
                                modalContainerStyle
                            }
                        >

                            {/* BLUE HEADER */}

                            <div
                                style={
                                    modalHeaderStyle
                                }
                            >

                                <div>

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",
                                            fontWeight:
                                                "700",
                                            letterSpacing:
                                                "1.2px",
                                            textTransform:
                                                "uppercase",
                                            color:
                                                "#b9ccff",
                                            marginBottom:
                                                "7px",
                                        }}
                                    >
                                        ASSESSMENT PROFILE
                                    </div>


                                    <h2
                                        style={{
                                            margin:
                                                "0 0 6px",
                                            fontSize:
                                                "24px",
                                            lineHeight:
                                                "1.2",
                                            color:
                                                "#0b234f",
                                            fontWeight:
                                                "700",
                                        }}
                                    >
                                        {editingAssessment
                                            ? "Edit Assessment"
                                            : "Create Assessment"}
                                    </h2>


                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "13px",
                                            color:
                                                "#9fb5df",
                                        }}
                                    >
                                        {editingAssessment
                                            ? "Update assessment information."
                                            : "Create a new assessment for a recruitment job."}
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
                                    style={{
                                        width:
                                            "34px",
                                        height:
                                            "34px",
                                        border:
                                            "none",
                                        borderRadius:
                                            "8px",
                                        background:
                                            "#ffffff",
                                        color:
                                            "#52709b",
                                        fontSize:
                                            "22px",
                                        cursor:
                                            "pointer",
                                        lineHeight:
                                            "1",
                                        flexShrink:
                                            0,
                                    }}
                                >
                                    ×
                                </button>

                            </div>


                            {/* FORM */}

                            {(error ||
                                success) && (

                                    <div
                                        className={
                                            error
                                                ? "admin-alert admin-alert-error"
                                                : "admin-alert admin-alert-success"
                                        }
                                        style={{
                                            margin:
                                                "18px 28px 0",
                                        }}
                                    >
                                        {
                                            error ||
                                            success
                                        }
                                    </div>

                                )}


                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                style={{
                                    padding:
                                        "28px",
                                    overflowY:
                                        "auto",
                                }}
                            >

                                {/* PROFILE ROW */}

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
                                        {form.title
                                            ?.charAt(
                                                0
                                            )
                                            ?.toUpperCase() ||
                                            "A"}
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
                                                form.title ||
                                                "New Assessment"
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
                                            Assessment configuration
                                        </div>

                                    </div>

                                </div>


                                {/* TITLE */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Assessment Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter assessment title"
                                    />

                                </div>


                                {/* JOB */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Job
                                    </label>

                                    <select
                                        name="jobId"
                                        value={
                                            form.jobId
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >

                                        <option value="">
                                            Select Job
                                        </option>

                                        {jobs.map(
                                            (job) => (
                                                <option
                                                    key={
                                                        job.id
                                                    }
                                                    value={
                                                        job.id
                                                    }
                                                >
                                                    {
                                                        job.title
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* DESCRIPTION */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter assessment description"
                                        style={{
                                            width:
                                                "100%",
                                            minHeight:
                                                "100px",
                                            padding:
                                                "12px 14px",
                                            border:
                                                "1px solid #dce4ef",
                                            borderRadius:
                                                "8px",
                                            fontSize:
                                                "14px",
                                            fontFamily:
                                                "inherit",
                                            color:
                                                "#111827",
                                            background:
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


                                {/* DURATION + PASSING SCORE */}

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr",
                                        gap:
                                            "13px",
                                    }}
                                >

                                    <div className="recruiter-form-field">

                                        <label>
                                            Duration (Minutes)
                                        </label>

                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            min="1"
                                            max="300"
                                            value={
                                                form.durationMinutes
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>


                                    <div className="recruiter-form-field">

                                        <label>
                                            Passing Score (%)
                                        </label>

                                        <input
                                            type="number"
                                            name="passingScore"
                                            min="0"
                                            max="100"
                                            value={
                                                form.passingScore
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>

                                </div>


                                {/* INFORMATION BOX */}

                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "15px 17px",
                                        background:
                                            "#f8fafc",
                                        border:
                                            "1px solid #dce4ef",
                                        borderRadius:
                                            "10px",
                                    }}
                                >

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#183153",
                                            fontSize:
                                                "13px",
                                            marginBottom:
                                                "4px",
                                        }}
                                    >
                                        Assessment workflow
                                    </strong>

                                    <span
                                        style={{
                                            color:
                                                "#526984",
                                            fontSize:
                                                "13px",
                                            lineHeight:
                                                "1.6",
                                        }}
                                    >
                                        After creating the
                                        assessment, you can
                                        add multiple-choice
                                        questions and
                                        configure the
                                        evaluation process.
                                    </span>

                                </div>


                                {/* FOOTER */}

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "flex-end",
                                        gap:
                                            "10px",
                                        marginTop:
                                            "22px",
                                        paddingTop:
                                            "18px",
                                        borderTop:
                                            "1px solid #e2e8f0",
                                    }}
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
                                            : editingAssessment
                                                ? "Update Assessment"
                                                : "Create Assessment"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* =====================================================
                    VIEW ASSESSMENT MODAL
                    SAME STYLE AS APPLICANT DETAILS
                ===================================================== */}

                {showViewModal &&
                    selectedAssessment && (

                        <div
                            onClick={
                                closeViewModal
                            }
                            style={
                                modalOverlayStyle
                            }
                        >

                            <div
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                                style={
                                    modalContainerStyle
                                }
                            >

                                {/* BLUE HEADER */}

                                <div
                                    style={
                                        modalHeaderStyle
                                    }
                                >

                                    <div>

                                        <div
                                            style={{
                                                fontSize:
                                                    "11px",
                                                fontWeight:
                                                    "700",
                                                letterSpacing:
                                                    "1.2px",
                                                textTransform:
                                                    "uppercase",
                                                color:
                                                    "#b9ccff",
                                                marginBottom:
                                                    "7px",
                                            }}
                                        >
                                            ASSESSMENT PROFILE
                                        </div>


                                        <h2
                                            style={{
                                                margin:
                                                    "0 0 6px",
                                                fontSize:
                                                    "24px",
                                                lineHeight:
                                                    "1.2",
                                                color:
                                                    "#0b234f",
                                                fontWeight:
                                                    "700",
                                            }}
                                        >
                                            Assessment Details
                                        </h2>


                                        <p
                                            style={{
                                                margin:
                                                    "0",
                                                fontSize:
                                                    "13px",
                                                color:
                                                    "#9fb5df",
                                            }}
                                        >
                                            Review assessment
                                            information and
                                            recruitment progress.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            closeViewModal
                                        }
                                        style={{
                                            width:
                                                "34px",
                                            height:
                                                "34px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "8px",
                                            background:
                                                "#ffffff",
                                            color:
                                                "#52709b",
                                            fontSize:
                                                "22px",
                                            cursor:
                                                "pointer",
                                            lineHeight:
                                                "1",
                                            flexShrink:
                                                0,
                                        }}
                                    >
                                        ×
                                    </button>

                                </div>


                                {/* BODY */}

                                <div
                                    style={{
                                        padding:
                                            "28px",
                                        overflowY:
                                            "auto",
                                    }}
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
                                            {selectedAssessment.title
                                                ?.charAt(
                                                    0
                                                )
                                                ?.toUpperCase() ||
                                                "A"}
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
                                                    selectedAssessment.title
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
                                                Assessment #

                                                {
                                                    selectedAssessment.id
                                                }
                                            </div>

                                        </div>

                                    </div>


                                    {/* DETAIL CARDS */}

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

                                        {/* JOB */}

                                        <div
                                            style={{
                                                padding:
                                                    "16px",
                                                border:
                                                    "1px solid #dce4ef",
                                                background:
                                                    "#f8fafc",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "#526984",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                Job
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "14px",
                                                }}
                                            >
                                                {
                                                    selectedAssessment.jobTitle ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        {/* RECRUITER */}

                                        <div
                                            style={{
                                                padding:
                                                    "16px",
                                                border:
                                                    "1px solid #dce4ef",
                                                background:
                                                    "#f8fafc",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "#526984",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                Recruiter
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "14px",
                                                }}
                                            >
                                                {
                                                    selectedAssessment.recruiterName ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        {/* DURATION */}

                                        <div
                                            style={{
                                                padding:
                                                    "16px",
                                                border:
                                                    "1px solid #dce4ef",
                                                background:
                                                    "#f8fafc",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "#526984",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                Duration
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "14px",
                                                }}
                                            >
                                                {
                                                    selectedAssessment.durationMinutes
                                                }{" "}
                                                minutes
                                            </strong>

                                        </div>


                                        {/* PASSING SCORE */}

                                        <div
                                            style={{
                                                padding:
                                                    "16px",
                                                border:
                                                    "1px solid #dce4ef",
                                                background:
                                                    "#f8fafc",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "#526984",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                Passing Score
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "14px",
                                                }}
                                            >
                                                {
                                                    selectedAssessment.passingScore
                                                }
                                                %
                                            </strong>

                                        </div>


                                        {/* STATUS */}

                                        <div
                                            style={{
                                                padding:
                                                    "16px",
                                                border:
                                                    "1px solid #dce4ef",
                                                background:
                                                    "#f8fafc",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "#526984",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                Status
                                            </span>

                                            <span
                                                className={getStatusClass(
                                                    selectedAssessment.isActive
                                                )}
                                            >
                                                {
                                                    selectedAssessment.isActive
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                            </span>

                                        </div>


                                        {/* CREATED */}

                                        <div
                                            style={{
                                                padding:
                                                    "16px",
                                                border:
                                                    "1px solid #dce4ef",
                                                background:
                                                    "#f8fafc",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "#526984",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                Created
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "14px",
                                                }}
                                            >
                                                {selectedAssessment.createdAt
                                                    ? new Date(
                                                        selectedAssessment.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day:
                                                                "2-digit",
                                                            month:
                                                                "short",
                                                            year:
                                                                "numeric",
                                                        }
                                                    )
                                                    : "-"}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div
                                        style={{
                                            marginTop:
                                                "24px",
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    "700",
                                                textTransform:
                                                    "uppercase",
                                                letterSpacing:
                                                    "0.7px",
                                                color:
                                                    "#526984",
                                                marginBottom:
                                                    "7px",
                                            }}
                                        >
                                            Description
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
                                                    "14px 16px",
                                                background:
                                                    "#f8fafc",
                                                border:
                                                    "1px solid #dce4ef",
                                                borderRadius:
                                                    "10px",
                                                whiteSpace:
                                                    "pre-wrap",
                                            }}
                                        >
                                            {
                                                selectedAssessment.description ||
                                                "No description provided."
                                            }
                                        </div>

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div
                                    style={{
                                        borderTop:
                                            "1px solid #e2e8f0",
                                        padding:
                                            "14px 24px",
                                        display:
                                            "flex",
                                        justifyContent:
                                            "flex-end",
                                        gap:
                                            "10px",
                                        background:
                                            "#ffffff",
                                        flexShrink:
                                            0,
                                    }}
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


                                    <button
                                        type="button"
                                        className="apply-filter-button"
                                        onClick={() => {
                                            const assessment =
                                                selectedAssessment;

                                            closeViewModal();

                                            openEditModal(
                                                assessment
                                            );
                                        }}
                                    >
                                        Edit Assessment
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

            </div>
        </RecruiterLayout>
    );
};

export default RecruiterAssessments;