import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminRecruiters = () => {
    const navigate = useNavigate();

    // =========================================================
    // DATA
    // =========================================================

    const [recruiters, setRecruiters] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    // =========================================================
    // FILTERS
    // =========================================================

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("");

    // =========================================================
    // PAGINATION
    // =========================================================

    const [pageNumber, setPageNumber] = useState(1);

    const pageSize = 10;

    const [totalRecords, setTotalRecords] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    // =========================================================
    // CREATE MODAL
    // =========================================================

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [createLoading, setCreateLoading] =
        useState(false);

    const [recruiterName, setRecruiterName] =
        useState("");

    const [recruiterEmail, setRecruiterEmail] =
        useState("");

    const [recruiterPassword, setRecruiterPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    // =========================================================
    // EDIT MODAL
    // =========================================================

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [editLoading, setEditLoading] =
        useState(false);

    const [editingRecruiter, setEditingRecruiter] =
        useState(null);

    const [editName, setEditName] =
        useState("");

    const [editEmail, setEditEmail] =
        useState("");

    // =========================================================
    // VIEW MODAL
    // =========================================================

    const [selectedRecruiter, setSelectedRecruiter] =
        useState(null);

    const [modalLoading, setModalLoading] =
        useState(false);

    // =========================================================
    // DELETE MODAL
    // =========================================================

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [deletingRecruiter, setDeletingRecruiter] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    // =========================================================
    // LOAD RECRUITERS
    // =========================================================

    const loadRecruiters = async (
        filterValues = {
            search,
            status,
        },
        currentPage = pageNumber
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
                pageSize: pageSize,
            };

            if (
                filterValues.search &&
                filterValues.search.trim() !== ""
            ) {
                params.search =
                    filterValues.search.trim();
            }

            if (
                filterValues.status &&
                filterValues.status !== ""
            ) {
                params.isActive =
                    filterValues.status === "active";
            }

            const response = await api.get(
                "/Admin/recruiters",
                {
                    params,
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setRecruiters(
                response.data.recruiters || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 0
            );

        } catch (error) {
            console.error(
                "Load recruiters error:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                localStorage.removeItem(
                    "smartHireToken"
                );

                localStorage.removeItem(
                    "smartHireUser"
                );

                navigate("/login");

                return;
            }

            if (
                error.response?.status === 403
            ) {
                setError(
                    "You are not authorized to manage recruiters."
                );

                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load recruiters."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadRecruiters(
            {
                search: "",
                status: "",
            },
            1
        );
    }, []);

    // =========================================================
    // APPLY FILTERS
    // =========================================================

    const handleApplyFilters = async () => {
        setError("");

        setSuccess("");

        const filters = {
            search: search.trim(),
            status,
        };

        setPageNumber(1);

        await loadRecruiters(
            filters,
            1
        );
    };

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const handleClearFilters = async () => {
        setSearch("");

        setStatus("");

        setPageNumber(1);

        setError("");

        setSuccess("");

        await loadRecruiters(
            {
                search: "",
                status: "",
            },
            1
        );
    };

    // =========================================================
    // SEARCH ENTER
    // =========================================================

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            handleApplyFilters();
        }
    };

    // =========================================================
    // CREATE RECRUITER
    // =========================================================

    const handleCreateRecruiter = async (
        event
    ) => {
        event.preventDefault();

        setError("");

        setSuccess("");

        if (
            !recruiterName.trim() ||
            !recruiterEmail.trim() ||
            !recruiterPassword
        ) {
            setError(
                "Please fill in all recruiter details."
            );

            return;
        }

        if (
            recruiterPassword.length < 6
        ) {
            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }

        try {
            setCreateLoading(true);

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.post(
                "/Admin/recruiters",
                {
                    fullName:
                        recruiterName.trim(),

                    email:
                        recruiterEmail.trim(),

                    password:
                        recruiterPassword,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                "Recruiter account created successfully."
            );

            setRecruiterName("");

            setRecruiterEmail("");

            setRecruiterPassword("");

            setShowCreateModal(false);

            setPageNumber(1);

            await loadRecruiters(
                {
                    search,
                    status,
                },
                1
            );

        } catch (error) {
            console.error(
                "Create recruiter error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to create recruiter."
            );
        } finally {
            setCreateLoading(false);
        }
    };

    // =========================================================
    // VIEW RECRUITER
    // =========================================================

    const handleViewRecruiter = async (
        id
    ) => {
        try {
            setModalLoading(true);

            setSelectedRecruiter(null);

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            const response = await api.get(
                `/Admin/recruiters/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSelectedRecruiter(
                response.data
            );

        } catch (error) {
            console.error(error);

            setError(
                "Unable to load recruiter details."
            );
        } finally {
            setModalLoading(false);
        }
    };

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const handleOpenEdit = (
        recruiter
    ) => {
        setEditingRecruiter(
            recruiter
        );

        setEditName(
            recruiter.fullName || ""
        );

        setEditEmail(
            recruiter.email || ""
        );

        setError("");

        setSuccess("");

        setShowEditModal(true);
    };

    // =========================================================
    // EDIT RECRUITER
    // =========================================================

    const handleEditRecruiter = async (
        event
    ) => {
        event.preventDefault();

        setError("");

        setSuccess("");

        if (
            !editName.trim() ||
            !editEmail.trim()
        ) {
            setError(
                "Please enter both name and email."
            );

            return;
        }

        if (!editingRecruiter) {
            return;
        }

        try {
            setEditLoading(true);

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.put(
                `/Admin/recruiters/${editingRecruiter.id}`,
                {
                    fullName:
                        editName.trim(),

                    email:
                        editEmail.trim(),
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                "Recruiter updated successfully."
            );

            setShowEditModal(false);

            setEditingRecruiter(null);

            await loadRecruiters(
                {
                    search,
                    status,
                },
                pageNumber
            );

        } catch (error) {
            console.error(
                "Edit recruiter error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update recruiter."
            );
        } finally {
            setEditLoading(false);
        }
    };

    // =========================================================
    // OPEN DELETE MODAL
    // =========================================================

    const handleOpenDelete = (
        recruiter
    ) => {
        setDeletingRecruiter(
            recruiter
        );

        setError("");

        setSuccess("");

        setShowDeleteModal(true);
    };

    // =========================================================
    // DELETE RECRUITER
    // =========================================================

    const handleDeleteRecruiter = async () => {
        if (!deletingRecruiter) {
            return;
        }

        try {
            setDeleteLoading(true);

            setError("");

            setSuccess("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.delete(
                `/Admin/recruiters/${deletingRecruiter.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                "Recruiter deleted successfully."
            );

            setShowDeleteModal(false);

            setDeletingRecruiter(null);

            let newPage = pageNumber;

            if (
                recruiters.length === 1 &&
                pageNumber > 1
            ) {
                newPage =
                    pageNumber - 1;

                setPageNumber(
                    newPage
                );
            }

            await loadRecruiters(
                {
                    search,
                    status,
                },
                newPage
            );

        } catch (error) {
            console.error(
                "Delete recruiter error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to delete recruiter."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    // =========================================================
    // STATUS CHANGE
    // =========================================================

    const handleStatusChange = async (
        recruiter
    ) => {
        try {
            setError("");

            setSuccess("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.put(
                `/Admin/recruiters/${recruiter.id}/status`,
                !recruiter.isActive,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                recruiter.isActive
                    ? "Recruiter deactivated successfully."
                    : "Recruiter activated successfully."
            );

            await loadRecruiters(
                {
                    search,
                    status,
                },
                pageNumber
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to update recruiter status."
            );
        }
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const handlePreviousPage =
        async () => {
            if (pageNumber <= 1) {
                return;
            }

            const newPage =
                pageNumber - 1;

            setPageNumber(
                newPage
            );

            await loadRecruiters(
                {
                    search,
                    status,
                },
                newPage
            );
        };

    const handleNextPage =
        async () => {
            if (
                pageNumber >=
                totalPages
            ) {
                return;
            }

            const newPage =
                pageNumber + 1;

            setPageNumber(
                newPage
            );

            await loadRecruiters(
                {
                    search,
                    status,
                },
                newPage
            );
        };

    // =========================================================
    // CLOSE VIEW MODAL
    // =========================================================

    const handleCloseDetails = () => {
        setSelectedRecruiter(null);
    };

    // =========================================================
    // CLOSE CREATE MODAL
    // =========================================================

    const handleCloseCreate = () => {
        if (createLoading) {
            return;
        }

        setShowCreateModal(false);

        setRecruiterName("");

        setRecruiterEmail("");

        setRecruiterPassword("");

        setShowPassword(false);
    };

    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    const handleCloseEdit = () => {
        if (editLoading) {
            return;
        }

        setShowEditModal(false);

        setEditingRecruiter(null);

        setEditName("");

        setEditEmail("");
    };

    // =========================================================
    // CLOSE DELETE MODAL
    // =========================================================

    const handleCloseDelete = () => {
        if (deleteLoading) {
            return;
        }

        setShowDeleteModal(false);

        setDeletingRecruiter(null);
    };

    // =========================================================
    // INITIAL LOADING
    // =========================================================

    if (
        loading &&
        recruiters.length === 0
    ) {
        return (
            <AdminLayout
                activePage="recruiters"
            >
                <div className="dashboard-loading">
                    Loading recruiters...
                </div>
            </AdminLayout>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <AdminLayout
            activePage="recruiters"
        >

            <div className="admin-page recruiters-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="recruiters-page-header">

                    <div>

                        <span className="page-eyebrow">
                            RECRUITMENT MANAGEMENT
                        </span>

                        <h2>
                            Recruiter Management
                        </h2>

                        <p>
                            Create, edit and manage
                            SmartHire recruiter accounts.
                        </p>

                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                TOTAL RECRUITERS
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                        <button
                            className="create-recruiter-button"
                            onClick={() =>
                                setShowCreateModal(
                                    true
                                )
                            }
                        >
                            + Add Recruiter
                        </button>

                    </div>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (
                    <div className="admin-alert admin-alert-error">

                        <span>
                            !
                        </span>

                        {error}

                    </div>
                )}

                {success && (
                    <div className="admin-alert admin-alert-success">

                        <span>
                            ✓
                        </span>

                        {success}

                    </div>
                )}


                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>

                            <h3>
                                All Recruiters
                            </h3>

                            <p>
                                Search and manage
                                SmartHire recruiter
                                accounts.
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
                                    Search recruiter
                                </label>

                                <div className="search-input-wrapper">

                                    <span>
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        value={search}
                                        placeholder="Search by name or email..."
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


                            <div className="filter-actions">

                                <button
                                    className="apply-filter-button"
                                    onClick={
                                        handleApplyFilters
                                    }
                                >
                                    Search
                                </button>

                                <button
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

                        <table className="professional-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        Recruiter
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Joined
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="empty-table"
                                        >
                                            Loading recruiters...
                                        </td>

                                    </tr>

                                ) : recruiters.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="empty-table"
                                        >

                                            <div className="empty-state">

                                                <div className="empty-icon">
                                                    ◌
                                                </div>

                                                <strong>
                                                    No recruiters found
                                                </strong>

                                                <span>
                                                    Try changing
                                                    your filters.
                                                </span>

                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    recruiters.map(
                                        (recruiter) => (

                                            <tr
                                                key={
                                                    recruiter.id
                                                }
                                            >

                                                {/* USER */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {recruiter.fullName
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    recruiter.fullName
                                                                }
                                                            </strong>

                                                            <span>
                                                                Recruiter ID #
                                                                {
                                                                    recruiter.id
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td>

                                                    <span className="professional-email">

                                                        {
                                                            recruiter.email
                                                        }

                                                    </span>

                                                </td>


                                                {/* ROLE */}

                                                <td>

                                                    <span className="professional-role professional-role-recruiter">

                                                        Recruiter

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`professional-status ${recruiter.isActive
                                                                ? "professional-status-active"
                                                                : "professional-status-inactive"
                                                            }`}
                                                    >

                                                        <span />

                                                        {recruiter.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                {/* JOINED */}

                                                <td>

                                                    <span className="joined-date">

                                                        {recruiter.createdAt
                                                            ? new Date(
                                                                recruiter.createdAt
                                                            ).toLocaleDateString(
                                                                "en-IN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                            : "-"}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="professional-actions">

                                                        <button
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                handleViewRecruiter(
                                                                    recruiter.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className="professional-edit-button"
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    recruiter
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className={
                                                                recruiter.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    recruiter
                                                                )
                                                            }
                                                        >
                                                            {recruiter.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            className="professional-delete-button"
                                                            onClick={() =>
                                                                handleOpenDelete(
                                                                    recruiter
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
                                {recruiters.length}
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {totalRecords}
                            </strong>

                            {" "}recruiters

                        </div>


                        <div className="pagination-controls">

                            <button
                                onClick={
                                    handlePreviousPage
                                }
                                disabled={
                                    pageNumber <= 1
                                }
                            >
                                ← Previous
                            </button>

                            <span>
                                Page{" "}
                                <strong>
                                    {pageNumber}
                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {totalPages || 1}
                                </strong>
                            </span>

                            <button
                                onClick={
                                    handleNextPage
                                }
                                disabled={
                                    pageNumber >=
                                    totalPages
                                }
                            >
                                Next →
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                CREATE RECRUITER MODAL
            ===================================================== */}

            {showCreateModal && (

                <div
                    className="professional-modal-overlay"
                    onClick={
                        handleCloseCreate
                    }
                >

                    <div
                        className="professional-modal create-recruiter-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="professional-modal-header">

                            <div>

                                <span>
                                    RECRUITER MANAGEMENT
                                </span>

                                <h2>
                                    Add Recruiter
                                </h2>

                                <p>
                                    Create a new recruiter
                                    account.
                                </p>

                            </div>

                            <button
                                onClick={
                                    handleCloseCreate
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="create-recruiter-form"
                            onSubmit={
                                handleCreateRecruiter
                            }
                        >

                            <div className="recruiter-form-field">

                                <label>
                                    Full name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter recruiter name"
                                    value={
                                        recruiterName
                                    }
                                    onChange={(event) =>
                                        setRecruiterName(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="recruiter-form-field">

                                <label>
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    placeholder="recruiter@company.com"
                                    value={
                                        recruiterEmail
                                    }
                                    onChange={(event) =>
                                        setRecruiterEmail(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="recruiter-form-field">

                                <label>
                                    Temporary password
                                </label>

                                <div className="recruiter-password-wrapper">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Minimum 6 characters"
                                        value={
                                            recruiterPassword
                                        }
                                        onChange={(event) =>
                                            setRecruiterPassword(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                previous =>
                                                    !previous
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>


                            <div className="recruiter-create-info">

                                <strong>
                                    Recruiter role
                                </strong>

                                <span>
                                    This account will
                                    automatically be created
                                    with the Recruiter role.
                                </span>

                            </div>


                            <div className="create-recruiter-actions">

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={
                                        handleCloseCreate
                                    }
                                    disabled={
                                        createLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="apply-filter-button"
                                    disabled={
                                        createLoading
                                    }
                                >
                                    {createLoading
                                        ? "Creating..."
                                        : "Create Recruiter"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                EDIT RECRUITER MODAL
            ===================================================== */}

            {showEditModal && (

                <div
                    className="professional-modal-overlay"
                    onClick={
                        handleCloseEdit
                    }
                >

                    <div
                        className="professional-modal create-recruiter-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="professional-modal-header">

                            <div>

                                <span>
                                    RECRUITER MANAGEMENT
                                </span>

                                <h2>
                                    Edit Recruiter
                                </h2>

                                <p>
                                    Update recruiter account
                                    information.
                                </p>

                            </div>

                            <button
                                onClick={
                                    handleCloseEdit
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="create-recruiter-form"
                            onSubmit={
                                handleEditRecruiter
                            }
                        >

                            <div className="recruiter-form-field">

                                <label>
                                    Full name
                                </label>

                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="recruiter-form-field">

                                <label>
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(event) =>
                                        setEditEmail(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="recruiter-create-info">

                                <strong>
                                    Password
                                </strong>

                                <span>
                                    The recruiter's existing
                                    password will remain
                                    unchanged.
                                </span>

                            </div>


                            <div className="create-recruiter-actions">

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={
                                        handleCloseEdit
                                    }
                                    disabled={
                                        editLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="apply-filter-button"
                                    disabled={
                                        editLoading
                                    }
                                >
                                    {editLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                VIEW RECRUITER MODAL
            ===================================================== */}

            {(selectedRecruiter ||
                modalLoading) && (

                    <div
                        className="professional-modal-overlay"
                        onClick={
                            handleCloseDetails
                        }
                    >

                        <div
                            className="professional-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="professional-modal-header">

                                <div>

                                    <span>
                                        RECRUITER PROFILE
                                    </span>

                                    <h2>
                                        Recruiter Details
                                    </h2>

                                    <p>
                                        SmartHire recruiter
                                        account.
                                    </p>

                                </div>

                                <button
                                    onClick={
                                        handleCloseDetails
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {modalLoading ? (

                                <div className="professional-modal-loading">
                                    Loading recruiter details...
                                </div>

                            ) : selectedRecruiter ? (

                                <div className="professional-modal-body">

                                    <div className="professional-modal-profile">

                                        <div className="professional-modal-avatar">

                                            {selectedRecruiter.fullName
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}

                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    selectedRecruiter.fullName
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    selectedRecruiter.email
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="professional-detail-grid">

                                        <div>

                                            <span>
                                                Recruiter ID
                                            </span>

                                            <strong>
                                                #
                                                {
                                                    selectedRecruiter.id
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Role
                                            </span>

                                            <strong>
                                                Recruiter
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {
                                                    selectedRecruiter.isActive
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Joined
                                            </span>

                                            <strong>
                                                {selectedRecruiter.createdAt
                                                    ? new Date(
                                                        selectedRecruiter.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "-"}
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            ) : null}

                        </div>

                    </div>

                )}


            {/* =====================================================
                DELETE CONFIRMATION MODAL
            ===================================================== */}

            {showDeleteModal &&
                deletingRecruiter && (

                    <div
                        className="professional-modal-overlay"
                        onClick={
                            handleCloseDelete
                        }
                    >

                        <div
                            className="professional-modal delete-recruiter-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="delete-modal-icon">
                                !
                            </div>

                            <h2>
                                Delete Recruiter?
                            </h2>

                            <p>
                                Are you sure you want
                                to permanently delete
                                this recruiter account?
                            </p>

                            <div className="delete-recruiter-profile">

                                <div className="professional-modal-avatar">

                                    {deletingRecruiter.fullName
                                        ?.charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <strong>
                                        {
                                            deletingRecruiter.fullName
                                        }
                                    </strong>

                                    <span>
                                        {
                                            deletingRecruiter.email
                                        }
                                    </span>

                                </div>

                            </div>

                            <div className="delete-warning">

                                This action cannot be
                                undone.

                            </div>


                            <div className="delete-modal-actions">

                                <button
                                    className="clear-filter-button"
                                    onClick={
                                        handleCloseDelete
                                    }
                                    disabled={
                                        deleteLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="professional-delete-confirm"
                                    onClick={
                                        handleDeleteRecruiter
                                    }
                                    disabled={
                                        deleteLoading
                                    }
                                >
                                    {deleteLoading
                                        ? "Deleting..."
                                        : "Delete Recruiter"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </AdminLayout>
    );
};

export default AdminRecruiters;