import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminDepartments = () => {
    const navigate = useNavigate();

    // =========================================================
    // DATA
    // =========================================================

    const [departments, setDepartments] = useState([]);

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

    const [totalRecords, setTotalRecords] = useState(0);

    const [totalPages, setTotalPages] = useState(0);

    // =========================================================
    // CREATE / EDIT MODAL
    // =========================================================

    const [showFormModal, setShowFormModal] =
        useState(false);

    const [formLoading, setFormLoading] =
        useState(false);

    const [editingDepartment, setEditingDepartment] =
        useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // =========================================================
    // VIEW MODAL
    // =========================================================

    const [selectedDepartment, setSelectedDepartment] =
        useState(null);

    const [modalLoading, setModalLoading] =
        useState(false);

    // =========================================================
    // LOAD DEPARTMENTS
    // =========================================================

    const loadDepartments = async (
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
                "/Admin/departments",
                {
                    params,
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setDepartments(
                response.data.departments || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 0
            );

        } catch (error) {
            console.error(
                "Load departments error:",
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
                    "You are not authorized to manage departments."
                );

                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load departments."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadDepartments(
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

        await loadDepartments(
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

        await loadDepartments(
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
    // CREATE DEPARTMENT
    // =========================================================

    const handleCreateDepartment = () => {
        setEditingDepartment(null);

        setFormData({
            name: "",
            description: "",
        });

        setError("");

        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // OPEN EDIT
    // =========================================================

    const handleOpenEdit = (
        department
    ) => {
        setEditingDepartment(
            department
        );

        setFormData({
            name: department.name || "",
            description:
                department.description || "",
        });

        setError("");

        setSuccess("");

        setShowFormModal(true);
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // SAVE DEPARTMENT
    // =========================================================

    const handleSaveDepartment = async (
        event
    ) => {
        event.preventDefault();

        setError("");

        setSuccess("");

        if (!formData.name.trim()) {
            setError(
                "Department name is required."
            );

            return;
        }

        try {
            setFormLoading(true);

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            if (!token) {
                navigate("/login");
                return;
            }

            if (editingDepartment) {

                await api.put(
                    `/Admin/departments/${editingDepartment.id}`,
                    {
                        name:
                            formData.name.trim(),

                        description:
                            formData.description.trim(),
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                setSuccess(
                    "Department updated successfully."
                );

            } else {

                await api.post(
                    "/Admin/departments",
                    {
                        name:
                            formData.name.trim(),

                        description:
                            formData.description.trim(),
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                setSuccess(
                    "Department created successfully."
                );
            }

            setShowFormModal(false);

            setEditingDepartment(null);

            setFormData({
                name: "",
                description: "",
            });

            await loadDepartments(
                {
                    search,
                    status,
                },
                pageNumber
            );

        } catch (error) {
            console.error(
                "Save department error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to save department."
            );

        } finally {
            setFormLoading(false);
        }
    };

    // =========================================================
    // VIEW DEPARTMENT
    // =========================================================

    const handleViewDepartment = async (
        id
    ) => {
        try {
            setModalLoading(true);

            setSelectedDepartment(null);

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            const response = await api.get(
                `/Admin/departments/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSelectedDepartment(
                response.data
            );

        } catch (error) {
            console.error(
                "View department error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load department details."
            );

        } finally {
            setModalLoading(false);
        }
    };

    // =========================================================
    // DELETE DEPARTMENT
    // =========================================================

    const handleDeleteDepartment = async (
        department
    ) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${department.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            setSuccess("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.delete(
                `/Admin/departments/${department.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                "Department deleted successfully."
            );

            let newPage = pageNumber;

            if (
                departments.length === 1 &&
                pageNumber > 1
            ) {
                newPage =
                    pageNumber - 1;

                setPageNumber(
                    newPage
                );
            }

            await loadDepartments(
                {
                    search,
                    status,
                },
                newPage
            );

        } catch (error) {
            console.error(
                "Delete department error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to delete department."
            );
        }
    };

    // =========================================================
    // STATUS CHANGE
    // =========================================================

    const handleStatusChange = async (
        department
    ) => {
        try {
            setError("");

            setSuccess("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            await api.put(
                `/Admin/departments/${department.id}/status`,
                !department.isActive,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                department.isActive
                    ? "Department deactivated successfully."
                    : "Department activated successfully."
            );

            await loadDepartments(
                {
                    search,
                    status,
                },
                pageNumber
            );

        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update department status."
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

            await loadDepartments(
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

            await loadDepartments(
                {
                    search,
                    status,
                },
                newPage
            );
        };

    // =========================================================
    // CLOSE FORM MODAL
    // =========================================================

    const handleCloseForm = () => {

        if (formLoading) {
            return;
        }

        setShowFormModal(false);

        setEditingDepartment(null);

        setFormData({
            name: "",
            description: "",
        });
    };

    // =========================================================
    // CLOSE VIEW MODAL
    // =========================================================

    const handleCloseDetails = () => {
        setSelectedDepartment(null);
    };

    // =========================================================
    // INITIAL LOADING
    // =========================================================

    if (
        loading &&
        departments.length === 0
    ) {
        return (
            <AdminLayout
                activePage="departments"
            >
                <div className="dashboard-loading">
                    Loading departments...
                </div>
            </AdminLayout>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <AdminLayout
            activePage="departments"
        >

            <div className="admin-page recruiters-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="recruiters-page-header">

                    <div>

                        <span className="page-eyebrow">
                            ORGANIZATION MANAGEMENT
                        </span>

                        <h2>
                            Department Management
                        </h2>

                        <p>
                            Create, edit and manage
                            SmartHire departments.
                        </p>

                    </div>


                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                TOTAL DEPARTMENTS
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>


                        <button
                            className="create-recruiter-button"
                            onClick={
                                handleCreateDepartment
                            }
                        >
                            + Add Department
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
                                All Departments
                            </h3>

                            <p>
                                Search and manage
                                SmartHire departments.
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
                                    Search department
                                </label>

                                <div className="search-input-wrapper">

                                    <span>
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        value={search}
                                        placeholder="Search by department name or description..."
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
                                        Department
                                    </th>

                                    <th>
                                        Description
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

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="empty-table"
                                        >
                                            Loading departments...
                                        </td>

                                    </tr>

                                ) : departments.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="empty-table"
                                        >

                                            <div className="empty-state">

                                                <div className="empty-icon">
                                                    ◌
                                                </div>

                                                <strong>
                                                    No departments found
                                                </strong>

                                                <span>
                                                    Try changing
                                                    your filters.
                                                </span>

                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    departments.map(
                                        (department) => (

                                            <tr
                                                key={
                                                    department.id
                                                }
                                            >

                                                {/* DEPARTMENT */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {department.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    department.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Department ID #
                                                                {
                                                                    department.id
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* DESCRIPTION */}

                                                <td>

                                                    <span className="professional-email">

                                                        {department.description ||
                                                            "No description"}

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`professional-status ${department.isActive
                                                                ? "professional-status-active"
                                                                : "professional-status-inactive"
                                                            }`}
                                                    >

                                                        <span />

                                                        {department.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                {/* CREATED */}

                                                <td>

                                                    <span className="joined-date">

                                                        {department.createdAt
                                                            ? new Date(
                                                                department.createdAt
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
                                                                handleViewDepartment(
                                                                    department.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>


                                                        <button
                                                            className="professional-edit-button"
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    department
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            className={
                                                                department.isActive
                                                                    ? "professional-deactivate"
                                                                    : "professional-activate"
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    department
                                                                )
                                                            }
                                                        >
                                                            {department.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>


                                                        <button
                                                            className="professional-delete-button"
                                                            onClick={() =>
                                                                handleDeleteDepartment(
                                                                    department
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
                                {departments.length}
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {totalRecords}
                            </strong>

                            {" "}departments

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
                ADD / EDIT DEPARTMENT MODAL
            ===================================================== */}

            {showFormModal && (

                <div
                    className="professional-modal-overlay"
                    onClick={
                        handleCloseForm
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
                                    DEPARTMENT MANAGEMENT
                                </span>

                                <h2>
                                    {editingDepartment
                                        ? "Edit Department"
                                        : "Add Department"}
                                </h2>

                                <p>
                                    {editingDepartment
                                        ? "Update department information."
                                        : "Create a new department."}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseForm
                                }
                                disabled={
                                    formLoading
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="create-recruiter-form"
                            onSubmit={
                                handleSaveDepartment
                            }
                        >

                            {/* NAME */}

                            <div className="recruiter-form-field">

                                <label>
                                    Department name
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
                                    placeholder="Enter department name"
                                    disabled={
                                        formLoading
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

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
                                    placeholder="Enter department description"
                                    disabled={
                                        formLoading
                                    }
                                    rows={4}
                                    style={{
                                        width: "100%",
                                        minHeight: "110px",
                                        padding: "12px 14px",
                                        border: "1px solid #d9dee8",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        fontFamily: "inherit",
                                        color: "#1f2937",
                                        backgroundColor: "#ffffff",
                                        outline: "none",
                                        resize: "vertical",
                                        boxSizing: "border-box",
                                    }}
                                />

                            </div>


                            {/* INFO */}

                            {!editingDepartment && (

                                <div className="recruiter-create-info">

                                    <strong>
                                        Department status
                                    </strong>

                                    <span>
                                        This department
                                        will automatically
                                        be created as
                                        active.
                                    </span>

                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="create-recruiter-actions">

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={
                                        handleCloseForm
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
                                        : editingDepartment
                                            ? "Save Changes"
                                            : "Create Department"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                VIEW DEPARTMENT MODAL
            ===================================================== */}

            {(selectedDepartment ||
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
                                        DEPARTMENT PROFILE
                                    </span>

                                    <h2>
                                        Department Details
                                    </h2>

                                    <p>
                                        SmartHire department
                                        information.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        handleCloseDetails
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {modalLoading ? (

                                <div className="professional-modal-loading">

                                    Loading department
                                    details...

                                </div>

                            ) : selectedDepartment ? (

                                <div className="professional-modal-body">

                                    <div className="professional-modal-profile">

                                        <div className="professional-modal-avatar">

                                            {selectedDepartment.name
                                                ?.charAt(0)
                                                .toUpperCase()}

                                        </div>


                                        <div>

                                            <h3>
                                                {
                                                    selectedDepartment.name
                                                }
                                            </h3>

                                            <p>
                                                Department #
                                                {
                                                    selectedDepartment.id
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="professional-detail-grid">

                                        <div>

                                            <span>
                                                Department ID
                                            </span>

                                            <strong>
                                                #
                                                {
                                                    selectedDepartment.id
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>

                                                {selectedDepartment.isActive
                                                    ? "Active"
                                                    : "Inactive"}

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Created
                                            </span>

                                            <strong>

                                                {selectedDepartment.createdAt
                                                    ? new Date(
                                                        selectedDepartment.createdAt
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


                                        <div>

                                            <span>
                                                Last Updated
                                            </span>

                                            <strong>

                                                {selectedDepartment.updatedAt
                                                    ? new Date(
                                                        selectedDepartment.updatedAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "Not updated"}

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Description
                                            </span>

                                            <strong>

                                                {selectedDepartment.description ||
                                                    "No description provided."}

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

export default AdminDepartments;