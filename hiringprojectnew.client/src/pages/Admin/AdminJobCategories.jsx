import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminJobCategories = () => {
    const [jobCategories, setJobCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingJobCategory, setEditingJobCategory] =
        useState(null);

    const [selectedJobCategory, setSelectedJobCategory] =
        useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const token = localStorage.getItem("smartHireToken");

    const getHeaders = () => ({
        Authorization: `Bearer ${token}`,
    });


    // =========================================================
    // LOAD JOB CATEGORIES
    // =========================================================

    const loadJobCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                pageNumber,
                pageSize,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (statusFilter !== "") {
                params.isActive = statusFilter;
            }

            const response = await api.get(
                "/Admin/job-categories",
                {
                    params,
                    headers: getHeaders(),
                }
            );

            const data = response.data;

            setJobCategories(data.jobCategories || []);
            setTotalRecords(data.totalRecords || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load job categories."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadJobCategories();
    }, [pageNumber]);


    // =========================================================
    // FILTERS
    // =========================================================

    const handleApplyFilter = () => {
        setPageNumber(1);

        setTimeout(() => {
            loadJobCategories();
        }, 0);
    };


    const handleClearFilter = () => {
        setSearch("");
        setStatusFilter("");
        setPageNumber(1);

        setTimeout(() => {
            loadJobCategories();
        }, 0);
    };


    // =========================================================
    // FORM HANDLERS
    // =========================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const openCreateModal = () => {
        setEditingJobCategory(null);

        setFormData({
            name: "",
            description: "",
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };


    const openEditModal = (jobCategory) => {
        setEditingJobCategory(jobCategory);

        setFormData({
            name: jobCategory.name || "",
            description: jobCategory.description || "",
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
        setEditingJobCategory(null);

        setFormData({
            name: "",
            description: "",
        });
    };


    // =========================================================
    // VIEW
    // =========================================================

    const handleView = async (id) => {
        try {
            setError("");

            const response = await api.get(
                `/Admin/job-categories/${id}`,
                {
                    headers: getHeaders(),
                }
            );

            setSelectedJobCategory(response.data);
            setShowViewModal(true);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load job category details."
            );
        }
    };


    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedJobCategory(null);
    };


    // =========================================================
    // CREATE / EDIT
    // =========================================================

    const handleSaveJobCategory = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Job category name is required.");
            return;
        }

        try {
            setActionLoading(true);

            if (editingJobCategory) {
                await api.put(
                    `/Admin/job-categories/${editingJobCategory.id}`,
                    {
                        name: formData.name.trim(),
                        description:
                            formData.description.trim(),
                    },
                    {
                        headers: getHeaders(),
                    }
                );

                setSuccess(
                    "Job category updated successfully."
                );
            } else {
                await api.post(
                    "/Admin/job-categories",
                    {
                        name: formData.name.trim(),
                        description:
                            formData.description.trim(),
                    },
                    {
                        headers: getHeaders(),
                    }
                );

                setSuccess(
                    "Job category created successfully."
                );
            }

            setShowFormModal(false);
            setEditingJobCategory(null);

            setFormData({
                name: "",
                description: "",
            });

            await loadJobCategories();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save job category."
            );
        } finally {
            setActionLoading(false);
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (jobCategory) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${jobCategory.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            setActionLoading(true);

            await api.delete(
                `/Admin/job-categories/${jobCategory.id}`,
                {
                    headers: getHeaders(),
                }
            );

            setSuccess(
                "Job category deleted successfully."
            );

            await loadJobCategories();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete job category."
            );
        } finally {
            setActionLoading(false);
        }
    };


    // =========================================================
    // STATUS
    // =========================================================

    const handleStatusChange = async (jobCategory) => {
        const newStatus = !jobCategory.isActive;

        const actionText = newStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} "${jobCategory.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            setActionLoading(true);

            await api.put(
                `/Admin/job-categories/${jobCategory.id}/status`,
                newStatus,
                {
                    headers: getHeaders(),
                }
            );

            setSuccess(
                newStatus
                    ? "Job category activated successfully."
                    : "Job category deactivated successfully."
            );

            await loadJobCategories();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update job category status."
            );
        } finally {
            setActionLoading(false);
        }
    };


    // =========================================================
    // PAGINATION
    // =========================================================

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber((previous) => previous - 1);
        }
    };


    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber((previous) => previous + 1);
        }
    };


    return (
        <AdminLayout activePage="job-categories">

            <div className="admin-page recruiters-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="recruiters-page-header">

                    <div>
                        <span className="page-eyebrow">
                            JOB MANAGEMENT
                        </span>

                        <h1>
                            Job Categories
                        </h1>

                        <p>
                            Manage recruitment job categories
                            used across the SmartHire platform.
                        </p>
                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">
                            <span>
                                Total Categories
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="create-recruiter-button"
                            onClick={openCreateModal}
                        >
                            + Add Job Category
                        </button>

                    </div>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

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


                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>
                            <h2>
                                Job Categories
                            </h2>

                            <p>
                                Search, filter and manage
                                available job categories.
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
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search by category name or description"
                                    />

                                </div>

                            </div>


                            <div className="filter-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
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
                                    onClick={handleApplyFilter}
                                >
                                    Apply Filter
                                </button>

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={handleClearFilter}
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

                        <table className="professional-users-table">

                            <thead>
                                <tr>
                                    <th>
                                        CATEGORY
                                    </th>

                                    <th>
                                        DESCRIPTION
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        CREATED
                                    </th>

                                    <th>
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px",
                                            }}
                                        >
                                            Loading job categories...
                                        </td>
                                    </tr>
                                ) : jobCategories.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px",
                                            }}
                                        >
                                            No job categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    jobCategories.map(
                                        (jobCategory) => (
                                            <tr
                                                key={
                                                    jobCategory.id
                                                }
                                            >

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">
                                                            {jobCategory.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    jobCategory.name
                                                                }
                                                            </strong>

                                                            <div className="professional-email">
                                                                ID: #
                                                                {
                                                                    jobCategory.id
                                                                }
                                                            </div>
                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div
                                                        style={{
                                                            maxWidth:
                                                                "320px",
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                        title={
                                                            jobCategory.description ||
                                                            "No description"
                                                        }
                                                    >
                                                        {jobCategory.description ||
                                                            "No description"}
                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`professional-status ${jobCategory.isActive
                                                                ? "professional-status-active"
                                                                : "professional-status-inactive"
                                                            }`}
                                                    >
                                                        {jobCategory.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="joined-date">

                                                        {jobCategory.createdAt
                                                            ? new Date(
                                                                jobCategory.createdAt
                                                            ).toLocaleDateString()
                                                            : "-"}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="professional-actions">

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                handleView(
                                                                    jobCategory.id
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
                                                                    jobCategory
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={
                                                                jobCategory.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    jobCategory
                                                                )
                                                            }
                                                        >
                                                            {jobCategory.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="professional-delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    jobCategory
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


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    <div className="professional-pagination">

                        <div>
                            Showing{" "}
                            <strong>
                                {jobCategories.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {totalRecords}
                            </strong>{" "}
                            categories
                        </div>


                        <div className="pagination-controls">

                            <button
                                type="button"
                                onClick={
                                    handlePreviousPage
                                }
                                disabled={
                                    pageNumber <= 1 ||
                                    loading
                                }
                            >
                                Previous
                            </button>

                            <span>
                                Page{" "}
                                <strong>
                                    {totalPages === 0
                                        ? 0
                                        : pageNumber}
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {totalPages || 0}
                                </strong>
                            </span>

                            <button
                                type="button"
                                onClick={
                                    handleNextPage
                                }
                                disabled={
                                    pageNumber >=
                                    totalPages ||
                                    totalPages === 0 ||
                                    loading
                                }
                            >
                                Next
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            {showFormModal && (
                <div
                    className="professional-modal-overlay"
                    onClick={closeFormModal}
                >

                    <div
                        className="professional-modal create-recruiter-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="professional-modal-header">

                            <div>

                                <span>
                                    JOB CATEGORY MANAGEMENT
                                </span>

                                <h2>
                                    {editingJobCategory
                                        ? "Edit Job Category"
                                        : "Add Job Category"}
                                </h2>

                                <p>
                                    {editingJobCategory
                                        ? "Update job category information."
                                        : "Create a new job category for the recruitment platform."}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeFormModal}
                                disabled={actionLoading}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="create-recruiter-form"
                            onSubmit={
                                handleSaveJobCategory
                            }
                        >

                            <div className="recruiter-form-field">

                                <label>
                                    Category name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Enter job category name"
                                    disabled={
                                        actionLoading
                                    }
                                />

                            </div>


                            <div className="recruiter-form-field">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Enter job category description"
                                    disabled={
                                        actionLoading
                                    }
                                    style={{
                                        width: "100%",
                                        minHeight:
                                            "110px",
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


                            <div className="recruiter-create-info">

                                <strong>
                                    Job category
                                </strong>

                                <span>
                                    This category will be
                                    available for recruiters
                                    when creating job
                                    postings.
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
                                        : editingJobCategory
                                            ? "Update Category"
                                            : "Create Category"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* =====================================================
                VIEW MODAL
            ===================================================== */}

            {showViewModal &&
                selectedJobCategory && (
                    <div
                        className="professional-modal-overlay"
                        onClick={
                            closeViewModal
                        }
                    >

                        <div
                            className="professional-modal create-recruiter-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="professional-modal-header">

                                <div>

                                    <span>
                                        JOB CATEGORY DETAILS
                                    </span>

                                    <h2>
                                        {
                                            selectedJobCategory.name
                                        }
                                    </h2>

                                    <p>
                                        View job category
                                        information.
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


                            <div className="create-recruiter-form">

                                <div className="recruiter-form-field">

                                    <label>
                                        Category name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            selectedJobCategory.name ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>


                                <div className="recruiter-form-field">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            selectedJobCategory.description ||
                                            "No description"
                                        }
                                        readOnly
                                        style={{
                                            width: "100%",
                                            minHeight:
                                                "110px",
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
                                                "#f8fafc",
                                            outline:
                                                "none",
                                            resize:
                                                "vertical",
                                            boxSizing:
                                                "border-box",
                                        }}
                                    />

                                </div>


                                <div className="recruiter-create-info">

                                    <strong>
                                        Status
                                    </strong>

                                    <span>
                                        {selectedJobCategory.isActive
                                            ? "This job category is currently active."
                                            : "This job category is currently inactive."}
                                    </span>

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

                                </div>

                            </div>

                        </div>

                    </div>
                )}

        </AdminLayout>
    );
};

export default AdminJobCategories;