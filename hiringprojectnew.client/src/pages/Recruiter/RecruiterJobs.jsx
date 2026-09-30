import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import RecruiterLayout from "../../components/RecruiterLayout";

const RecruiterJobs = () => {
    const navigate = useNavigate();

    // =========================================================
    // DATA
    // =========================================================

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // FILTERS
    // =========================================================

    const [search, setSearch] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [jobCategoryId, setJobCategoryId] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [status, setStatus] = useState("");

    // =========================================================
    // PAGINATION
    // =========================================================

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // =========================================================
    // MODALS
    // =========================================================

    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // =========================================================
    // FORM
    // =========================================================

    const initialForm = {
        title: "",
        departmentId: "",
        jobCategoryId: "",
        location: "",
        employmentType: "Full-Time",
        experienceLevel: "",
        minimumSalary: "",
        maximumSalary: "",
        requiredSkills: "",
        description: "",
        responsibilities: "",
        requirements: "",
        applicationDeadline: "",
    };

    const [formData, setFormData] = useState(initialForm);

    // =========================================================
    // LOOKUP DATA
    // =========================================================

    const [departments, setDepartments] = useState([]);
    const [jobCategories, setJobCategories] = useState([]);

    const employmentTypes = [
        "Full-Time",
        "Part-Time",
        "Internship",
        "Contract",
        "Remote",
    ];

    // =========================================================
    // AUTH
    // =========================================================

    const getAuthConfig = () => {
        const token = localStorage.getItem("smartHireToken");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // =========================================================
    // LOAD LOOKUP DATA
    // =========================================================

    const loadLookupData = async () => {
        try {
            const token = localStorage.getItem("smartHireToken");

            if (!token) {
                navigate("/login");
                return;
            }

            const [
                departmentResponse,
                categoryResponse,
            ] = await Promise.all([
                api.get(
                    "/Department",
                    getAuthConfig()
                ),
                api.get(
                    "/JobCategory",
                    getAuthConfig()
                ),
            ]);

            setDepartments(
                departmentResponse.data || []
            );

            setJobCategories(
                categoryResponse.data || []
            );
        } catch (err) {
            console.error(
                "Load lookup data error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );
                localStorage.removeItem(
                    "smartHireUser"
                );
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load departments and job categories."
            );
        }
    };

    // =========================================================
    // LOAD JOBS
    // =========================================================

    const loadJobs = async (
        currentPage = pageNumber,
        filterValues = {
            search,
            departmentId,
            jobCategoryId,
            employmentType,
            status,
        }
    ) => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            if (!token) {
                navigate("/login");
                return;
            }

            const params = {
                pageNumber: currentPage,
                pageSize,
            };

            if (filterValues.search?.trim()) {
                params.search =
                    filterValues.search.trim();
            }

            if (filterValues.departmentId) {
                params.departmentId = Number(
                    filterValues.departmentId
                );
            }

            if (filterValues.jobCategoryId) {
                params.jobCategoryId = Number(
                    filterValues.jobCategoryId
                );
            }

            if (filterValues.employmentType) {
                params.employmentType =
                    filterValues.employmentType;
            }

            if (filterValues.status) {
                params.isActive =
                    filterValues.status === "active";
            }

            const response = await api.get(
                "/RecruiterJob",
                {
                    params,
                    ...getAuthConfig(),
                }
            );

            setJobs(
                response.data.jobs || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 0
            );
        } catch (err) {
            console.error(
                "Load jobs error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );
                localStorage.removeItem(
                    "smartHireUser"
                );
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadLookupData();

        loadJobs(1, {
            search: "",
            departmentId: "",
            jobCategoryId: "",
            employmentType: "",
            status: "",
        });
    }, []);

    // =========================================================
    // FILTERS
    // =========================================================

    const handleApplyFilters = async () => {
        const filters = {
            search: search.trim(),
            departmentId,
            jobCategoryId,
            employmentType,
            status,
        };

        setPageNumber(1);

        await loadJobs(1, filters);
    };

    const handleClearFilters = async () => {
        setSearch("");
        setDepartmentId("");
        setJobCategoryId("");
        setEmploymentType("");
        setStatus("");
        setPageNumber(1);
        setError("");
        setSuccess("");

        await loadJobs(1, {
            search: "",
            departmentId: "",
            jobCategoryId: "",
            employmentType: "",
            status: "",
        });
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            handleApplyFilters();
        }
    };

    // =========================================================
    // FORM
    // =========================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingJob(null);
    };

    // =========================================================
    // CREATE
    // =========================================================

    const handleCreateJob = () => {
        resetForm();
        setError("");
        setSuccess("");
        setShowFormModal(true);
    };

    // =========================================================
    // EDIT
    // =========================================================

    const handleEditJob = (job) => {
        setEditingJob(job);

        setFormData({
            title: job.title || "",

            departmentId: job.departmentId
                ? String(job.departmentId)
                : "",

            jobCategoryId: job.jobCategoryId
                ? String(job.jobCategoryId)
                : "",

            location: job.location || "",

            employmentType:
                job.employmentType ||
                "Full-Time",

            experienceLevel:
                job.experienceLevel || "",

            minimumSalary:
                job.minimumSalary ?? "",

            maximumSalary:
                job.maximumSalary ?? "",

            requiredSkills:
                job.requiredSkills || "",

            description:
                job.description || "",

            responsibilities:
                job.responsibilities || "",

            requirements:
                job.requirements || "",

            applicationDeadline:
                job.applicationDeadline
                    ? job.applicationDeadline.substring(
                        0,
                        10
                    )
                    : "",
        });

        setError("");
        setSuccess("");
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        if (formLoading) return;

        setShowFormModal(false);
        resetForm();
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        if (!formData.title.trim()) {
            return "Job title is required.";
        }

        if (!formData.departmentId) {
            return "Please select a department.";
        }

        if (!formData.jobCategoryId) {
            return "Please select a job category.";
        }

        if (!formData.location.trim()) {
            return "Location is required.";
        }

        if (!formData.employmentType) {
            return "Employment type is required.";
        }

        if (!formData.description.trim()) {
            return "Job description is required.";
        }

        if (!formData.applicationDeadline) {
            return "Application deadline is required.";
        }

        if (
            formData.minimumSalary !== "" &&
            formData.maximumSalary !== "" &&
            Number(formData.minimumSalary) >
            Number(formData.maximumSalary)
        ) {
            return "Minimum salary cannot be greater than maximum salary.";
        }

        return "";
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setFormLoading(true);

            const payload = {
                title:
                    formData.title.trim(),

                departmentId:
                    Number(
                        formData.departmentId
                    ),

                jobCategoryId:
                    Number(
                        formData.jobCategoryId
                    ),

                location:
                    formData.location.trim(),

                employmentType:
                    formData.employmentType,

                experienceLevel:
                    formData.experienceLevel.trim(),

                minimumSalary:
                    formData.minimumSalary === ""
                        ? null
                        : Number(
                            formData.minimumSalary
                        ),

                maximumSalary:
                    formData.maximumSalary === ""
                        ? null
                        : Number(
                            formData.maximumSalary
                        ),

                requiredSkills:
                    formData.requiredSkills.trim(),

                description:
                    formData.description.trim(),

                responsibilities:
                    formData.responsibilities.trim(),

                requirements:
                    formData.requirements.trim(),

                applicationDeadline:
                    `${formData.applicationDeadline}T23:59:59`,
            };

            if (editingJob) {
                await api.put(
                    `/RecruiterJob/${editingJob.id}`,
                    payload,
                    getAuthConfig()
                );

                setSuccess(
                    "Job updated successfully."
                );
            } else {
                await api.post(
                    "/RecruiterJob",
                    payload,
                    getAuthConfig()
                );

                setSuccess(
                    "Job created successfully."
                );
            }

            setShowFormModal(false);
            resetForm();

            await loadJobs(
                pageNumber,
                {
                    search,
                    departmentId,
                    jobCategoryId,
                    employmentType,
                    status,
                }
            );
        } catch (err) {
            console.error(
                "Save job error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );

                localStorage.removeItem(
                    "smartHireUser"
                );

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to save job."
            );
        } finally {
            setFormLoading(false);
        }
    };

    // =========================================================
    // VIEW JOB
    // =========================================================

    const handleViewJob = async (id) => {
        try {
            setModalLoading(true);
            setSelectedJob(null);
            setError("");

            const response =
                await api.get(
                    `/RecruiterJob/${id}`,
                    getAuthConfig()
                );

            setSelectedJob(
                response.data
            );

            setShowViewModal(true);
        } catch (err) {
            console.error(
                "View job error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );

                localStorage.removeItem(
                    "smartHireUser"
                );

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load job details."
            );
        } finally {
            setModalLoading(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDeleteJob = async (job) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${job.title}"?`
            );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            await api.delete(
                `/RecruiterJob/${job.id}`,
                getAuthConfig()
            );

            setSuccess(
                "Job deleted successfully."
            );

            let newPage = pageNumber;

            if (
                jobs.length === 1 &&
                pageNumber > 1
            ) {
                newPage =
                    pageNumber - 1;

                setPageNumber(newPage);
            }

            await loadJobs(
                newPage,
                {
                    search,
                    departmentId,
                    jobCategoryId,
                    employmentType,
                    status,
                }
            );
        } catch (err) {
            console.error(
                "Delete job error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );

                localStorage.removeItem(
                    "smartHireUser"
                );

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to delete job."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // STATUS
    // =========================================================

    const handleStatusChange = async (
        job
    ) => {
        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            await api.put(
                `/RecruiterJob/${job.id}/status`,
                !job.isActive,
                getAuthConfig()
            );

            setSuccess(
                job.isActive
                    ? "Job deactivated successfully."
                    : "Job activated successfully."
            );

            await loadJobs(
                pageNumber,
                {
                    search,
                    departmentId,
                    jobCategoryId,
                    employmentType,
                    status,
                }
            );
        } catch (err) {
            console.error(
                "Update job status error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem(
                    "smartHireToken"
                );

                localStorage.removeItem(
                    "smartHireUser"
                );

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to update job status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const handlePreviousPage =
        async () => {
            if (pageNumber <= 1) return;

            const newPage =
                pageNumber - 1;

            setPageNumber(newPage);

            await loadJobs(
                newPage,
                {
                    search,
                    departmentId,
                    jobCategoryId,
                    employmentType,
                    status,
                }
            );
        };

    const handleNextPage =
        async () => {
            if (
                pageNumber >= totalPages
            ) {
                return;
            }

            const newPage =
                pageNumber + 1;

            setPageNumber(newPage);

            await loadJobs(
                newPage,
                {
                    search,
                    departmentId,
                    jobCategoryId,
                    employmentType,
                    status,
                }
            );
        };

    // =========================================================
    // CLOSE VIEW
    // =========================================================

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedJob(null);
    };

    // =========================================================
    // FORMAT
    // =========================================================

    const formatSalary = (
        minimum,
        maximum
    ) => {
        if (
            minimum === null &&
            maximum === null
        ) {
            return "Not specified";
        }

        if (
            minimum !== null &&
            maximum !== null
        ) {
            return `₹${Number(
                minimum
            ).toLocaleString(
                "en-IN"
            )} - ₹${Number(
                maximum
            ).toLocaleString(
                "en-IN"
            )}`;
        }

        if (minimum !== null) {
            return `₹${Number(
                minimum
            ).toLocaleString(
                "en-IN"
            )}+`;
        }

        return `Up to ₹${Number(
            maximum
        ).toLocaleString(
            "en-IN"
        )}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // MODAL STYLES
    // APPLICANT DETAILS STYLE
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

    // IMPORTANT:
    // This matches Applicant Details header.

    const modalHeaderStyle = {
        background:
            "linear-gradient(135deg, #21439a 0%, #2862e5 100%)",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexShrink: 0,
    };

    const closeButtonStyle = {
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

    const eyebrowStyle = {
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        color: "#3b6fd8",
        marginBottom: "7px",
    };

    const modalTitleStyle = {
        margin: "0 0 6px",
        fontSize: "24px",
        lineHeight: "1.2",
        color: "#142d53",
        fontWeight: "700",
    };

    const modalSubtitleStyle = {
        margin: "0",
        fontSize: "13px",
        color: "#91a4c3",
    };

    const detailCardStyle = {
        padding: "16px",
        border: "1px solid #dce4ef",
        background: "#f8fafc",
        borderRadius: "10px",
    };

    const detailLabelStyle = {
        display: "block",
        fontSize: "10px",
        color: "#526984",
        marginBottom: "7px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    };

    const detailValueStyle = {
        color: "#111827",
        fontSize: "14px",
    };

    const contentBoxStyle = {
        color: "#334155",
        fontSize: "14px",
        lineHeight: "1.7",
        padding: "13px 15px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
        whiteSpace: "pre-wrap",
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <RecruiterLayout activePage="jobs">

            <div className="admin-page recruiters-page recruiter-jobs-page">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="recruiters-page-header">

                    <div>

                        <span className="page-eyebrow">
                            JOB MANAGEMENT
                        </span>

                        <h1>
                            Jobs
                        </h1>

                        <p>
                            Create, manage and monitor
                            your recruitment openings.
                        </p>

                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                Total Jobs
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                        <button
                            type="button"
                            className="create-recruiter-button"
                            onClick={
                                handleCreateJob
                            }
                        >
                            + Create Job
                        </button>

                    </div>

                </div>

                {/* =====================================================
                    ALERTS
                ===================================================== */}

                {error && (
                    <div className="admin-alert admin-alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="admin-alert admin-alert-success">
                        {success}
                    </div>
                )}

                {/* =====================================================
                    FILTER CARD
                ===================================================== */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>

                            <span className="page-eyebrow">
                                JOB SEARCH
                            </span>

                            <h2>
                                Find Jobs
                            </h2>

                            <p>
                                Search and filter your
                                recruitment openings.
                            </p>

                        </div>

                    </div>

                    <div className="users-filter-section">

                        <div className="users-filter-grid">

                            {/* SEARCH */}

                            <div className="search-field">

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
                                        placeholder="Search by title, location..."
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={
                                            handleSearchKeyDown
                                        }
                                    />

                                </div>

                            </div>

                            {/* DEPARTMENT */}

                            <div className="filter-field">

                                <label>
                                    Department
                                </label>

                                <select
                                    value={
                                        departmentId
                                    }
                                    onChange={(event) =>
                                        setDepartmentId(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Departments
                                    </option>

                                    {departments.map(
                                        (
                                            department
                                        ) => (
                                            <option
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >
                                                {
                                                    department.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* JOB CATEGORY */}

                            <div className="filter-field">

                                <label>
                                    Job Category
                                </label>

                                <select
                                    value={
                                        jobCategoryId
                                    }
                                    onChange={(event) =>
                                        setJobCategoryId(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Categories
                                    </option>

                                    {jobCategories.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* EMPLOYMENT TYPE */}

                            <div className="filter-field">

                                <label>
                                    Employment Type
                                </label>

                                <select
                                    value={
                                        employmentType
                                    }
                                    onChange={(event) =>
                                        setEmploymentType(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Types
                                    </option>

                                    {employmentTypes.map(
                                        (type) => (
                                            <option
                                                key={
                                                    type
                                                }
                                                value={
                                                    type
                                                }
                                            >
                                                {type}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* STATUS */}

                            <div className="filter-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>

                            {/* FILTER ACTIONS */}

                            <div className="filter-actions">

                                <button
                                    type="button"
                                    className="apply-filter-button"
                                    onClick={
                                        handleApplyFilters
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

                </div>

                {/* =====================================================
                    JOB LIST
                ===================================================== */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>

                            <span className="page-eyebrow">
                                JOB LISTINGS
                            </span>

                            <h2>
                                Recruitment Openings
                            </h2>

                            <p>
                                Manage your active and
                                inactive job openings.
                            </p>

                        </div>

                        <div className="users-total-card">

                            <span>
                                Records
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                    </div>

                    <div className="users-table-container">

                        <table className="professional-users-table">

                            <thead>

                                <tr>
                                    <th>Job</th>
                                    <th>Department</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Salary</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="table-loading"
                                        >
                                            Loading jobs...
                                        </td>

                                    </tr>

                                ) : jobs.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="table-loading"
                                        >
                                            No jobs found.
                                        </td>

                                    </tr>

                                ) : (

                                    jobs.map(
                                        (job) => (

                                            <tr
                                                key={
                                                    job.id
                                                }
                                            >

                                                {/* JOB */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {job.title
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                "J"}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    job.title
                                                                }
                                                            </strong>

                                                            <span className="professional-email">
                                                                Job #
                                                                {
                                                                    job.id
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* DEPARTMENT */}

                                                <td>
                                                    {
                                                        job.departmentName ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* CATEGORY */}

                                                <td>
                                                    {
                                                        job.jobCategoryName ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* LOCATION */}

                                                <td>
                                                    {
                                                        job.location ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* SALARY */}

                                                <td>
                                                    {formatSalary(
                                                        job.minimumSalary,
                                                        job.maximumSalary
                                                    )}
                                                </td>

                                                {/* DEADLINE */}

                                                <td className="joined-date">

                                                    {formatDate(
                                                        job.applicationDeadline
                                                    )}

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`professional-status ${job.isActive
                                                                ? "professional-status-active"
                                                                : "professional-status-inactive"
                                                            }`}
                                                    >
                                                        {job.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="professional-actions">

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                handleViewJob(
                                                                    job.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="professional-edit-button"
                                                            onClick={() =>
                                                                handleEditJob(
                                                                    job
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={
                                                                job.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    job
                                                                )
                                                            }
                                                        >
                                                            {job.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="professional-delete-button"
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            onClick={() =>
                                                                handleDeleteJob(
                                                                    job
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}

                    <div className="professional-pagination">

                        <span>

                            Showing{" "}

                            {totalRecords === 0
                                ? 0
                                : (pageNumber -
                                    1) *
                                pageSize +
                                1}

                            {" "}to{" "}

                            {Math.min(
                                pageNumber *
                                pageSize,
                                totalRecords
                            )}

                            {" "}of{" "}

                            {totalRecords} jobs

                        </span>

                        <div className="pagination-controls">

                            <button
                                type="button"
                                disabled={
                                    pageNumber <=
                                    1 ||
                                    loading
                                }
                                onClick={
                                    handlePreviousPage
                                }
                            >
                                Previous
                            </button>

                            <span>
                                Page{" "}
                                {pageNumber}{" "}
                                of{" "}
                                {totalPages ||
                                    1}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    pageNumber >=
                                    totalPages ||
                                    loading
                                }
                                onClick={
                                    handleNextPage
                                }
                            >
                                Next
                            </button>

                        </div>

                    </div>

                </div>

                {/* =====================================================
                    CREATE / EDIT JOB MODAL
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

                            {/* APPLICANT DETAILS STYLE HEADER */}

                            <div
                                style={
                                    modalHeaderStyle
                                }
                            >

                                <div>

                                    <div
                                        style={
                                            eyebrowStyle
                                        }
                                    >
                                        JOB PROFILE
                                    </div>

                                    <h2
                                        style={
                                            modalTitleStyle
                                        }
                                    >
                                        {editingJob
                                            ? "Edit Job"
                                            : "Create Job"}
                                    </h2>

                                    <p
                                        style={
                                            modalSubtitleStyle
                                        }
                                    >
                                        {editingJob
                                            ? "Update recruitment opening information."
                                            : "Create a new recruitment opening."}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeFormModal
                                    }
                                    disabled={
                                        formLoading
                                    }
                                    style={
                                        closeButtonStyle
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            {/* FORM BODY */}

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

                                {error && (
                                    <div
                                        className="admin-alert admin-alert-error"
                                        style={{
                                            marginBottom:
                                                "20px",
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr",
                                        gap:
                                            "17px",
                                    }}
                                >

                                    {/* JOB TITLE */}

                                    <div
                                        className="recruiter-form-field"
                                        style={{
                                            gridColumn:
                                                "1 / -1",
                                        }}
                                    >

                                        <label>
                                            Job Title *
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="e.g. Junior Full Stack Developer"
                                            value={
                                                formData.title
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* DEPARTMENT */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Department *
                                        </label>

                                        <select
                                            name="departmentId"
                                            value={
                                                formData.departmentId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select Department
                                            </option>

                                            {departments.map(
                                                (
                                                    department
                                                ) => (
                                                    <option
                                                        key={
                                                            department.id
                                                        }
                                                        value={
                                                            department.id
                                                        }
                                                    >
                                                        {
                                                            department.name
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* CATEGORY */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Job Category *
                                        </label>

                                        <select
                                            name="jobCategoryId"
                                            value={
                                                formData.jobCategoryId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select Category
                                            </option>

                                            {jobCategories.map(
                                                (
                                                    category
                                                ) => (
                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >
                                                        {
                                                            category.name
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* LOCATION */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Location *
                                        </label>

                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Bangalore"
                                            value={
                                                formData.location
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* EMPLOYMENT TYPE */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Employment Type *
                                        </label>

                                        <select
                                            name="employmentType"
                                            value={
                                                formData.employmentType
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            {employmentTypes.map(
                                                (type) => (
                                                    <option
                                                        key={
                                                            type
                                                        }
                                                        value={
                                                            type
                                                        }
                                                    >
                                                        {type}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* EXPERIENCE */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Experience Level
                                        </label>

                                        <input
                                            type="text"
                                            name="experienceLevel"
                                            placeholder="Fresher / 1-2 Years / 2-5 Years"
                                            value={
                                                formData.experienceLevel
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* MINIMUM SALARY */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Minimum Salary
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            name="minimumSalary"
                                            placeholder="300000"
                                            value={
                                                formData.minimumSalary
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* MAXIMUM SALARY */}

                                    <div className="recruiter-form-field">

                                        <label>
                                            Maximum Salary
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            name="maximumSalary"
                                            placeholder="500000"
                                            value={
                                                formData.maximumSalary
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* SKILLS */}

                                    <div
                                        className="recruiter-form-field"
                                        style={{
                                            gridColumn:
                                                "1 / -1",
                                        }}
                                    >

                                        <label>
                                            Required Skills
                                        </label>

                                        <input
                                            type="text"
                                            name="requiredSkills"
                                            placeholder="React.js, C#, ASP.NET Core, SQL, Git"
                                            value={
                                                formData.requiredSkills
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* DESCRIPTION */}

                                    <div
                                        className="recruiter-form-field"
                                        style={{
                                            gridColumn:
                                                "1 / -1",
                                        }}
                                    >

                                        <label>
                                            Job Description *
                                        </label>

                                        <textarea
                                            name="description"
                                            placeholder="Enter detailed job description..."
                                            value={
                                                formData.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* RESPONSIBILITIES */}

                                    <div
                                        className="recruiter-form-field"
                                        style={{
                                            gridColumn:
                                                "1 / -1",
                                        }}
                                    >

                                        <label>
                                            Responsibilities
                                        </label>

                                        <textarea
                                            name="responsibilities"
                                            placeholder="Describe the responsibilities of this role..."
                                            value={
                                                formData.responsibilities
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* REQUIREMENTS */}

                                    <div
                                        className="recruiter-form-field"
                                        style={{
                                            gridColumn:
                                                "1 / -1",
                                        }}
                                    >

                                        <label>
                                            Requirements
                                        </label>

                                        <textarea
                                            name="requirements"
                                            placeholder="Describe the candidate requirements..."
                                            value={
                                                formData.requirements
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* DEADLINE */}

                                    <div
                                        className="recruiter-form-field"
                                        style={{
                                            gridColumn:
                                                "1 / -1",
                                        }}
                                    >

                                        <label>
                                            Application Deadline *
                                        </label>

                                        <input
                                            type="date"
                                            name="applicationDeadline"
                                            value={
                                                formData.applicationDeadline
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                </div>

                                {/* WORKFLOW INFO */}

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
                                        Recruitment workflow
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
                                        After creating a job,
                                        candidates can apply
                                        and move through the
                                        SmartHire recruitment
                                        pipeline.
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
                                            formLoading
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="apply-filter-button"
                                        disabled={
                                            formLoading
                                        }
                                    >
                                        {formLoading
                                            ? "Saving..."
                                            : editingJob
                                                ? "Update Job"
                                                : "Create Job"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

                {/* =====================================================
                    VIEW JOB MODAL
                ===================================================== */}

                {showViewModal && (

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

                            {/* APPLICANT DETAILS STYLE HEADER */}

                            <div
                                style={
                                    modalHeaderStyle
                                }
                            >

                                <div>

                                    <div
                                        style={
                                            eyebrowStyle
                                        }
                                    >
                                        JOB PROFILE
                                    </div>

                                    <h2
                                        style={
                                            modalTitleStyle
                                        }
                                    >
                                        Job Details
                                    </h2>

                                    <p
                                        style={
                                            modalSubtitleStyle
                                        }
                                    >
                                        Review recruitment
                                        opening information
                                        and job requirements.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeViewModal
                                    }
                                    style={
                                        closeButtonStyle
                                    }
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

                                {modalLoading ? (

                                    <div
                                        style={{
                                            padding:
                                                "50px",
                                            textAlign:
                                                "center",
                                            color:
                                                "#64748b",
                                        }}
                                    >
                                        Loading job details...
                                    </div>

                                ) : selectedJob ? (

                                    <>

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
                                                {selectedJob.title
                                                    ?.charAt(
                                                        0
                                                    )
                                                    ?.toUpperCase() ||
                                                    "J"}
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
                                                        selectedJob.title
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
                                                    Job #
                                                    {
                                                        selectedJob.id
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

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Department
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {
                                                        selectedJob.departmentName ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Category
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {
                                                        selectedJob.jobCategoryName ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Location
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {
                                                        selectedJob.location ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Employment Type
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {
                                                        selectedJob.employmentType ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Experience
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {
                                                        selectedJob.experienceLevel ||
                                                        "Not specified"
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Salary
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {formatSalary(
                                                        selectedJob.minimumSalary,
                                                        selectedJob.maximumSalary
                                                    )}
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Deadline
                                                </span>

                                                <strong
                                                    style={
                                                        detailValueStyle
                                                    }
                                                >
                                                    {formatDate(
                                                        selectedJob.applicationDeadline
                                                    )}
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    detailCardStyle
                                                }
                                            >
                                                <span
                                                    style={
                                                        detailLabelStyle
                                                    }
                                                >
                                                    Status
                                                </span>

                                                <span
                                                    className={`professional-status ${selectedJob.isActive
                                                            ? "professional-status-active"
                                                            : "professional-status-inactive"
                                                        }`}
                                                >
                                                    {selectedJob.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>

                                        </div>

                                        {/* REQUIRED SKILLS */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "25px",
                                            }}
                                        >

                                            <div
                                                style={
                                                    detailLabelStyle
                                                }
                                            >
                                                Required Skills
                                            </div>

                                            <div
                                                style={
                                                    contentBoxStyle
                                                }
                                            >
                                                {
                                                    selectedJob.requiredSkills ||
                                                    "No skills specified."
                                                }
                                            </div>

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px",
                                            }}
                                        >

                                            <div
                                                style={
                                                    detailLabelStyle
                                                }
                                            >
                                                Description
                                            </div>

                                            <div
                                                style={
                                                    contentBoxStyle
                                                }
                                            >
                                                {
                                                    selectedJob.description ||
                                                    "No description provided."
                                                }
                                            </div>

                                        </div>

                                        {/* RESPONSIBILITIES */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px",
                                            }}
                                        >

                                            <div
                                                style={
                                                    detailLabelStyle
                                                }
                                            >
                                                Responsibilities
                                            </div>

                                            <div
                                                style={
                                                    contentBoxStyle
                                                }
                                            >
                                                {
                                                    selectedJob.responsibilities ||
                                                    "No responsibilities specified."
                                                }
                                            </div>

                                        </div>

                                        {/* REQUIREMENTS */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px",
                                            }}
                                        >

                                            <div
                                                style={
                                                    detailLabelStyle
                                                }
                                            >
                                                Requirements
                                            </div>

                                            <div
                                                style={
                                                    contentBoxStyle
                                                }
                                            >
                                                {
                                                    selectedJob.requirements ||
                                                    "No requirements specified."
                                                }
                                            </div>

                                        </div>

                                    </>

                                ) : (

                                    <div
                                        style={{
                                            padding:
                                                "50px",
                                            textAlign:
                                                "center",
                                            color:
                                                "#64748b",
                                        }}
                                    >
                                        Job details not available.
                                    </div>

                                )}

                            </div>

                            {/* VIEW MODAL FOOTER */}

                            {!modalLoading &&
                                selectedJob && (

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
                                                const job =
                                                    selectedJob;

                                                closeViewModal();

                                                handleEditJob(
                                                    job
                                                );
                                            }}
                                        >
                                            Edit Job
                                        </button>

                                    </div>

                                )}

                        </div>

                    </div>

                )}

            </div>
        </RecruiterLayout>
    );
};

export default RecruiterJobs;