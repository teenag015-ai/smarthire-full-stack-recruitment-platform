import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminCandidates = () => {
    const navigate = useNavigate();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedCandidate, setSelectedCandidate] =
        useState(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);

    const [editingCandidate, setEditingCandidate] =
        useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const [formLoading, setFormLoading] = useState(false);

    // =========================================================
    // AUTH CONFIG
    // =========================================================

    const getAuthConfig = () => {
        const token =
            localStorage.getItem("smartHireToken");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // =========================================================
    // LOAD CANDIDATES
    // =========================================================

    const loadCandidates = async () => {
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

            if (status !== "") {
                params.isActive = status;
            }

            const response = await api.get(
                "/Admin/candidates",
                {
                    ...getAuthConfig(),
                    params,
                }
            );

            setCandidates(
                response.data.candidates || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 0
            );
        } catch (err) {
            console.error(err);

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

            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to access candidates."
                );

                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load candidates."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCandidates();
    }, [pageNumber]);

    // =========================================================
    // FILTERS
    // =========================================================

    const handleApplyFilters = () => {
        setPageNumber(1);
        loadCandidates();
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatus("");
        setPageNumber(1);

        setTimeout(() => {
            loadCandidates();
        }, 0);
    };

    // =========================================================
    // VIEW
    // =========================================================

    const handleViewCandidate = async (id) => {
        try {
            setError("");

            const response = await api.get(
                `/Admin/candidates/${id}`,
                getAuthConfig()
            );

            setSelectedCandidate(response.data);
            setShowViewModal(true);
        } catch (err) {
            console.error(err);

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
                "Failed to load candidate details."
            );
        }
    };

    // =========================================================
    // ADD CANDIDATE
    // =========================================================

    const handleCreateCandidate = () => {
        setEditingCandidate(null);

        setFormData({
            fullName: "",
            email: "",
            password: "",
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // EDIT CANDIDATE
    // =========================================================

    const handleEditCandidate = (candidate) => {
        setEditingCandidate(candidate);

        setFormData({
            fullName: candidate.fullName,
            email: candidate.email,
            password: "",
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // SAVE CANDIDATE
    // =========================================================

    const handleSaveCandidate = async (e) => {
        e.preventDefault();

        try {
            setFormLoading(true);
            setError("");
            setSuccess("");

            if (!formData.fullName.trim()) {
                setError("Full name is required.");
                return;
            }

            if (!formData.email.trim()) {
                setError("Email is required.");
                return;
            }

            if (!editingCandidate) {
                if (!formData.password) {
                    setError("Password is required.");
                    return;
                }

                if (formData.password.length < 6) {
                    setError(
                        "Password must be at least 6 characters."
                    );

                    return;
                }
            }

            if (editingCandidate) {
                const payload = {
                    fullName:
                        formData.fullName.trim(),

                    email:
                        formData.email.trim(),
                };

                await api.put(
                    `/Admin/candidates/${editingCandidate.id}`,
                    payload,
                    getAuthConfig()
                );

                setSuccess(
                    "Candidate updated successfully."
                );
            } else {
                const payload = {
                    fullName:
                        formData.fullName.trim(),

                    email:
                        formData.email.trim(),

                    password:
                        formData.password,
                };

                await api.post(
                    "/Admin/candidates",
                    payload,
                    getAuthConfig()
                );

                setSuccess(
                    "Candidate created successfully."
                );
            }

            setShowFormModal(false);

            setFormData({
                fullName: "",
                email: "",
                password: "",
            });

            setEditingCandidate(null);

            await loadCandidates();
        } catch (err) {
            console.error(err);

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
                "Failed to save candidate."
            );
        } finally {
            setFormLoading(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDeleteCandidate = async (candidate) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${candidate.fullName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/Admin/candidates/${candidate.id}`,
                getAuthConfig()
            );

            setSuccess(
                "Candidate deleted successfully."
            );

            await loadCandidates();
        } catch (err) {
            console.error(err);

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
                "Failed to delete candidate."
            );
        }
    };

    // =========================================================
    // STATUS
    // =========================================================

    const handleStatusChange = async (candidate) => {
        try {
            setError("");
            setSuccess("");

            await api.put(
                `/Admin/candidates/${candidate.id}/status`,
                !candidate.isActive,
                getAuthConfig()
            );

            setSuccess(
                candidate.isActive
                    ? "Candidate deactivated successfully."
                    : "Candidate activated successfully."
            );

            await loadCandidates();
        } catch (err) {
            console.error(err);

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
                "Failed to update candidate status."
            );
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

    // =========================================================
    // CLOSE MODALS
    // =========================================================

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedCandidate(null);
    };

    const closeFormModal = () => {
        if (formLoading) {
            return;
        }

        setShowFormModal(false);
        setEditingCandidate(null);

        setFormData({
            fullName: "",
            email: "",
            password: "",
        });
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <AdminLayout activePage="candidates">

            <div className="admin-page recruiters-page">

                {/* =====================================================
                PAGE HEADER
            ===================================================== */}

                <div className="recruiters-page-header">

                    <div>

                        <div className="page-eyebrow">
                            SMART HIRE
                        </div>

                        <h1>
                            Candidates
                        </h1>

                        <p>
                            Manage candidate accounts and
                            recruitment profiles.
                        </p>

                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                Total Candidates
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                        <button
                            className="create-recruiter-button"
                            onClick={handleCreateCandidate}
                        >
                            + Add Candidate
                        </button>

                    </div>

                </div>

                {/* =====================================================
                ERROR
            ===================================================== */}

                {error && (
                    <div className="admin-alert admin-alert-error">
                        {error}
                    </div>
                )}

                {/* =====================================================
                SUCCESS
            ===================================================== */}

                {success && (
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

                            <h2>
                                Candidate Management
                            </h2>

                            <p>
                                Search, filter and manage
                                candidate accounts.
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
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key ===
                                                "Enter"
                                            ) {
                                                handleApplyFilters();
                                            }
                                        }}
                                    />

                                </div>

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

                                    <option value="true">
                                        Active
                                    </option>

                                    <option value="false">
                                        Inactive
                                    </option>

                                </select>

                            </div>

                            {/* FILTER BUTTONS */}

                            <div className="filter-actions">

                                <button
                                    className="apply-filter-button"
                                    onClick={
                                        handleApplyFilters
                                    }
                                >
                                    Apply Filters
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

                        {loading ? (

                            <div className="table-loading">
                                Loading candidates...
                            </div>

                        ) : candidates.length === 0 ? (

                            <div className="table-empty">
                                No candidates found.
                            </div>

                        ) : (

                            <table className="professional-users-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Candidate
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

                                    {candidates.map(
                                        (candidate) => (

                                            <tr
                                                key={
                                                    candidate.id
                                                }
                                            >

                                                {/* CANDIDATE */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {candidate.fullName
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    candidate.fullName
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* EMAIL */}

                                                <td>

                                                    <span className="professional-email">

                                                        {
                                                            candidate.email
                                                        }

                                                    </span>

                                                </td>

                                                {/* ROLE */}

                                                <td>

                                                    <span className="professional-role professional-role-candidate">

                                                        Candidate

                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            candidate.isActive
                                                                ? "professional-status professional-status-active"
                                                                : "professional-status professional-status-inactive"
                                                        }
                                                    >

                                                        {candidate.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>

                                                {/* JOINED */}

                                                <td>

                                                    <span className="joined-date">

                                                        {candidate.createdAt
                                                            ? new Date(
                                                                candidate.createdAt
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
                                                                handleViewCandidate(
                                                                    candidate.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className="professional-edit-button"
                                                            onClick={() =>
                                                                handleEditCandidate(
                                                                    candidate
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className={
                                                                candidate.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    candidate
                                                                )
                                                            }
                                                        >
                                                            {candidate.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            className="professional-delete-button"
                                                            onClick={() =>
                                                                handleDeleteCandidate(
                                                                    candidate
                                                                )
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
                        candidates.length > 0 && (

                            <div className="professional-pagination">

                                <div>

                                    Showing{" "}

                                    <strong>
                                        {candidates.length}
                                    </strong>

                                    {" "}of{" "}

                                    <strong>
                                        {totalRecords}
                                    </strong>

                                    {" "}candidates

                                </div>

                                <div className="pagination-controls">

                                    <button
                                        disabled={
                                            pageNumber <= 1
                                        }
                                        onClick={
                                            handlePreviousPage
                                        }
                                    >
                                        Previous
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
                                        disabled={
                                            pageNumber >=
                                            totalPages
                                        }
                                        onClick={
                                            handleNextPage
                                        }
                                    >
                                        Next
                                    </button>

                                </div>

                            </div>

                        )}

                </div>
                {/* =====================================================
                VIEW CANDIDATE MODAL
            ====================================================== */}

                {showViewModal &&
                    selectedCandidate && (

                        <div
                            className="professional-modal-overlay"
                            onClick={closeViewModal}
                        >

                            <div
                                className="professional-modal"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >

                                {/* HEADER */}

                                <div className="professional-modal-header">

                                    <div>

                                        <span>
                                            CANDIDATE PROFILE
                                        </span>

                                        <h2>
                                            Candidate Details
                                        </h2>

                                        <p>
                                            View candidate account
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


                                {/* BODY */}

                                <div className="professional-modal-body">

                                    <div className="professional-modal-profile">

                                        <div className="professional-modal-avatar">

                                            {selectedCandidate.fullName
                                                ?.charAt(0)
                                                ?.toUpperCase()}

                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    selectedCandidate.fullName
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    selectedCandidate.email
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="professional-detail-grid">

                                        <div>

                                            <span>
                                                Candidate ID
                                            </span>

                                            <strong>
                                                #
                                                {
                                                    selectedCandidate.id
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Role
                                            </span>

                                            <strong>
                                                Candidate
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>

                                                <span
                                                    className={
                                                        selectedCandidate.isActive
                                                            ? "professional-status professional-status-active"
                                                            : "professional-status professional-status-inactive"
                                                    }
                                                >
                                                    {selectedCandidate.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Joined
                                            </span>

                                            <strong>
                                                {selectedCandidate.createdAt
                                                    ? new Date(
                                                        selectedCandidate.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "-"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {
                                                    selectedCandidate.email
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                {/* =====================================================
                ADD / EDIT CANDIDATE MODAL
            ====================================================== */}

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

                            {/* =================================================
                            HEADER
                        ================================================= */}

                            <div className="professional-modal-header">

                                <div>

                                    <span>
                                        CANDIDATE MANAGEMENT
                                    </span>

                                    <h2>
                                        {editingCandidate
                                            ? "Edit Candidate"
                                            : "Add Candidate"}
                                    </h2>

                                    <p>
                                        {editingCandidate
                                            ? "Update candidate account information."
                                            : "Create a new candidate account."}
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
                                >
                                    ×
                                </button>

                            </div>


                            {/* =================================================
                            FORM
                        ================================================= */}

                            <form
                                className="create-recruiter-form"
                                onSubmit={
                                    handleSaveCandidate
                                }
                            >

                                {/* FULL NAME */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Full name
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={
                                            formData.fullName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter candidate name"
                                        disabled={
                                            formLoading
                                        }
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Email address
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter candidate email"
                                        disabled={
                                            formLoading
                                        }
                                    />

                                </div>


                                {/* PASSWORD */}

                                {!editingCandidate && (

                                    <div className="recruiter-form-field">

                                        <label>
                                            Temporary password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Minimum 6 characters"
                                            disabled={
                                                formLoading
                                            }
                                        />

                                    </div>

                                )}


                                {/* ROLE INFORMATION */}

                                {!editingCandidate && (

                                    <div className="recruiter-create-info">

                                        <strong>
                                            Candidate role
                                        </strong>

                                        <span>
                                            This account will
                                            automatically be created
                                            with the Candidate role.
                                        </span>

                                    </div>

                                )}


                                {/* ACTIONS */}

                                <div className="create-recruiter-actions">

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
                                            : editingCandidate
                                                ? "Update Candidate"
                                                : "Create Candidate"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </div>

        </AdminLayout>
    );

};

export default AdminCandidates;