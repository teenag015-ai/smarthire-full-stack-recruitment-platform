import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminUsers = () => {
    const navigate = useNavigate();

    // =========================================================
    // DATA
    // =========================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    // =========================================================
    // FILTER VALUES
    // =========================================================

    const [search, setSearch] = useState("");

    const [role, setRole] = useState("");

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
    // MODAL
    // =========================================================

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [modalLoading, setModalLoading] =
        useState(false);

    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers = async (
        filterValues = {
            search,
            role,
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

            // =================================================
            // BUILD API PARAMETERS DIRECTLY
            // =================================================

            const params = {
                pageNumber: currentPage,
                pageSize: pageSize,
            };

            // Search
            if (
                filterValues.search &&
                filterValues.search.trim() !== ""
            ) {
                params.search =
                    filterValues.search.trim();
            }

            // Role
            if (
                filterValues.role &&
                filterValues.role !== ""
            ) {
                params.role =
                    filterValues.role;
            }

            // Status
            if (
                filterValues.status &&
                filterValues.status !== ""
            ) {
                params.isActive =
                    filterValues.status === "active";
            }

            console.log(
                "FILTER PARAMETERS:",
                params
            );

            const response = await api.get(
                "/Admin/users",
                {
                    params,
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "FILTER RESPONSE:",
                response.data
            );

            setUsers(
                response.data.users || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 0
            );

        } catch (error) {
            console.error(
                "Load users error:",
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
                    "You are not authorized to manage users."
                );

                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadUsers(
            {
                search: "",
                role: "",
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
            role: role,
            status: status,
        };

        setPageNumber(1);

        await loadUsers(
            filters,
            1
        );
    };

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const handleClearFilters = async () => {
        setSearch("");
        setRole("");
        setStatus("");

        setPageNumber(1);

        setError("");
        setSuccess("");

        await loadUsers(
            {
                search: "",
                role: "",
                status: "",
            },
            1
        );
    };

    // =========================================================
    // ENTER TO SEARCH
    // =========================================================

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            handleApplyFilters();
        }
    };

    // =========================================================
    // VIEW USER
    // =========================================================

    const handleViewUser = async (id) => {
        try {
            setModalLoading(true);

            setSelectedUser(null);

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            const response = await api.get(
                `/Admin/users/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSelectedUser(
                response.data
            );
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load user details."
            );
        } finally {
            setModalLoading(false);
        }
    };

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    const handleStatusChange = async (
        id,
        currentStatus
    ) => {
        try {
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.put(
                `/Admin/users/${id}/status`,
                !currentStatus,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                currentStatus
                    ? "User deactivated successfully."
                    : "User activated successfully."
            );

            // Reload with CURRENT filters
            await loadUsers(
                {
                    search,
                    role,
                    status,
                },
                pageNumber
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to update user status."
            );
        }
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleCloseModal = () => {
        setSelectedUser(null);
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const handlePreviousPage = async () => {
        if (pageNumber <= 1) {
            return;
        }

        const newPage =
            pageNumber - 1;

        setPageNumber(newPage);

        await loadUsers(
            {
                search,
                role,
                status,
            },
            newPage
        );
    };

    const handleNextPage = async () => {
        if (
            pageNumber >= totalPages
        ) {
            return;
        }

        const newPage =
            pageNumber + 1;

        setPageNumber(newPage);

        await loadUsers(
            {
                search,
                role,
                status,
            },
            newPage
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (
        loading &&
        users.length === 0
    ) {
        return (
            <AdminLayout
                activePage="users"
            >
                <div className="dashboard-loading">
                    Loading users...
                </div>
            </AdminLayout>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <AdminLayout
            activePage="users"
        >
            <div className="admin-page users-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="users-page-header">

                    <div>

                        <span className="page-eyebrow">
                            PLATFORM MANAGEMENT
                        </span>

                        <h2>
                            User Management
                        </h2>

                        <p>
                            Manage candidates,
                            recruiters and
                            administrator accounts.
                        </p>

                    </div>

                    <div className="users-total-card">

                        <span>
                            TOTAL USERS
                        </span>

                        <strong>
                            {totalRecords}
                        </strong>

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

                    {/* CARD HEADER */}

                    <div className="users-card-header">

                        <div>

                            <h3>
                                All Users
                            </h3>

                            <p>
                                Search and filter
                                registered SmartHire
                                accounts.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        FILTER BAR
                    ================================================= */}

                    <div className="users-filter-section">

                        <div className="users-filter-grid">

                            {/* SEARCH */}

                            <div className="filter-field search-field">

                                <label>
                                    Search
                                </label>

                                <div className="search-input-wrapper">

                                    <span>
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        value={search}
                                        placeholder="Name or email"
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


                            {/* ROLE */}

                            <div className="filter-field">

                                <label>
                                    Role
                                </label>

                                <select
                                    value={role}
                                    onChange={(event) =>
                                        setRole(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All roles
                                    </option>

                                    <option value="Admin">
                                        Admin
                                    </option>

                                    <option value="Recruiter">
                                        Recruiter
                                    </option>

                                    <option value="Candidate">
                                        Candidate
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
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All status
                                    </option>

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

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
                        ACTIVE FILTER INDICATOR
                    ================================================= */}

                    {(search ||
                        role ||
                        status) && (

                            <div className="active-filters">

                                <span>
                                    Active filters:
                                </span>

                                {search && (
                                    <span className="filter-chip">
                                        Search: {search}
                                    </span>
                                )}

                                {role && (
                                    <span className="filter-chip">
                                        Role: {role}
                                    </span>
                                )}

                                {status && (
                                    <span className="filter-chip">
                                        Status:{" "}
                                        {status === "active"
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                )}

                            </div>
                        )}


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="users-table-container">

                        <table className="professional-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        User
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
                                            Loading users...
                                        </td>

                                    </tr>

                                ) : users.length === 0 ? (

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
                                                    No users found
                                                </strong>

                                                <span>
                                                    Try changing
                                                    your search
                                                    or filters.
                                                </span>

                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    users.map(
                                        (user) => (

                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >

                                                {/* USER */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {user.fullName
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    user.fullName
                                                                }
                                                            </strong>

                                                            <span>
                                                                User ID #
                                                                {
                                                                    user.id
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td>

                                                    <span className="professional-email">

                                                        {
                                                            user.email
                                                        }

                                                    </span>

                                                </td>


                                                {/* ROLE */}

                                                <td>

                                                    <span
                                                        className={`professional-role ${user.role ===
                                                                "Admin"
                                                                ? "professional-role-admin"
                                                                : user.role ===
                                                                    "Recruiter"
                                                                    ? "professional-role-recruiter"
                                                                    : "professional-role-candidate"
                                                            }`}
                                                    >

                                                        {
                                                            user.role
                                                        }

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`professional-status ${user.isActive
                                                                ? "professional-status-active"
                                                                : "professional-status-inactive"
                                                            }`}
                                                    >

                                                        <span />

                                                        {user.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                {/* JOINED */}

                                                <td>

                                                    <span className="joined-date">

                                                        {user.createdAt
                                                            ? new Date(
                                                                user.createdAt
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
                                                                handleViewUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        {user.role !==
                                                            "Admin" && (

                                                                <button
                                                                    className={
                                                                        user.isActive
                                                                            ? "professional-deactivate"
                                                                            : "professional-activate"
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            user.id,
                                                                            user.isActive
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        user.isActive
                                                                            ? "Deactivate"
                                                                            : "Activate"
                                                                    }

                                                                </button>

                                                            )}

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
                                {users.length}
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {totalRecords}
                            </strong>

                            {" "}users

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
                USER DETAILS MODAL
            ===================================================== */}

            {(selectedUser ||
                modalLoading) && (

                    <div
                        className="professional-modal-overlay"
                        onClick={
                            handleCloseModal
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
                                        USER PROFILE
                                    </span>

                                    <h2>
                                        User Details
                                    </h2>

                                    <p>
                                        SmartHire account information
                                    </p>

                                </div>

                                <button
                                    onClick={
                                        handleCloseModal
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {modalLoading ? (

                                <div className="professional-modal-loading">
                                    Loading user details...
                                </div>

                            ) : selectedUser ? (

                                <div className="professional-modal-body">

                                    <div className="professional-modal-profile">

                                        <div className="professional-modal-avatar">

                                            {selectedUser.fullName
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}

                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    selectedUser.fullName
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    selectedUser.email
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="professional-detail-grid">

                                        <div>
                                            <span>
                                                User ID
                                            </span>

                                            <strong>
                                                #
                                                {
                                                    selectedUser.id
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Role
                                            </span>

                                            <strong>
                                                {
                                                    selectedUser.role
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Account status
                                            </span>

                                            <strong>
                                                {
                                                    selectedUser.isActive
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
                                                {selectedUser.createdAt
                                                    ? new Date(
                                                        selectedUser.createdAt
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

        </AdminLayout>
    );
};

export default AdminUsers;