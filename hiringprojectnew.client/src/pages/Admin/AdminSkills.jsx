import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminSkills = () => {
    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [skills, setSkills] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showViewModal, setShowViewModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);

    const [selectedSkill, setSelectedSkill] = useState(null);
    const [editingSkill, setEditingSkill] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });


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
    // LOAD SKILLS
    // =========================================================

    const loadSkills = async () => {
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
                "/Admin/skills",
                {
                    ...getAuthConfig(),
                    params,
                }
            );

            setSkills(response.data.skills || []);
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

            setError(
                err.response?.data?.message ||
                "Failed to load skills."
            );
        } finally {
            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL LOAD / PAGE CHANGE
    // =========================================================

    useEffect(() => {
        loadSkills();
    }, [pageNumber]);


    // =========================================================
    // FILTER
    // =========================================================

    const handleApplyFilter = () => {
        setPageNumber(1);

        setTimeout(() => {
            loadSkills();
        }, 0);
    };


    const handleClearFilter = () => {
        setSearch("");
        setStatusFilter("");
        setPageNumber(1);

        setTimeout(() => {
            loadSkills();
        }, 0);
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
    // ADD SKILL
    // =========================================================

    const handleCreateSkill = () => {
        setEditingSkill(null);

        setFormData({
            name: "",
            description: "",
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };


    // =========================================================
    // EDIT SKILL
    // =========================================================

    const handleEditSkill = (skill) => {
        setEditingSkill(skill);

        setFormData({
            name: skill.name || "",
            description: skill.description || "",
        });

        setError("");
        setSuccess("");

        setShowFormModal(true);
    };


    // =========================================================
    // SAVE SKILL
    // =========================================================

    const handleSaveSkill = async (e) => {
        e.preventDefault();

        try {
            setFormLoading(true);
            setError("");
            setSuccess("");

            const payload = {
                name: formData.name.trim(),
                description:
                    formData.description.trim(),
            };

            if (!payload.name) {
                setError(
                    "Skill name is required."
                );
                return;
            }

            if (editingSkill) {
                await api.put(
                    `/Admin/skills/${editingSkill.id}`,
                    payload,
                    getAuthConfig()
                );

                setSuccess(
                    "Skill updated successfully."
                );
            } else {
                await api.post(
                    "/Admin/skills",
                    payload,
                    getAuthConfig()
                );

                setSuccess(
                    "Skill created successfully."
                );
            }

            setShowFormModal(false);

            setEditingSkill(null);

            setFormData({
                name: "",
                description: "",
            });

            await loadSkills();

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
                "Failed to save skill."
            );
        } finally {
            setFormLoading(false);
        }
    };


    // =========================================================
    // VIEW SKILL
    // =========================================================

    const handleViewSkill = async (skill) => {
        try {
            setError("");

            const response = await api.get(
                `/Admin/skills/${skill.id}`,
                getAuthConfig()
            );

            setSelectedSkill(response.data);
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
                "Failed to load skill details."
            );
        }
    };


    // =========================================================
    // DELETE SKILL
    // =========================================================

    const handleDeleteSkill = async (skill) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${skill.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/Admin/skills/${skill.id}`,
                getAuthConfig()
            );

            setSuccess(
                "Skill deleted successfully."
            );

            await loadSkills();

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
                "Failed to delete skill."
            );
        }
    };


    // =========================================================
    // STATUS
    // =========================================================

    const handleStatusChange = async (skill) => {
        try {
            setError("");
            setSuccess("");

            await api.put(
                `/Admin/skills/${skill.id}/status`,
                !skill.isActive,
                getAuthConfig()
            );

            setSuccess(
                skill.isActive
                    ? "Skill deactivated successfully."
                    : "Skill activated successfully."
            );

            await loadSkills();

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
                "Failed to update skill status."
            );
        }
    };


    // =========================================================
    // PAGINATION
    // =========================================================

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(
                (previous) => previous - 1
            );
        }
    };


    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(
                (previous) => previous + 1
            );
        }
    };


    // =========================================================
    // CLOSE VIEW MODAL
    // =========================================================

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedSkill(null);
    };


    // =========================================================
    // CLOSE FORM MODAL
    // =========================================================

    const closeFormModal = () => {
        if (formLoading) {
            return;
        }

        setShowFormModal(false);
        setEditingSkill(null);

        setFormData({
            name: "",
            description: "",
        });
    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <AdminLayout activePage="skills">

            <div className="admin-page recruiters-page">

                {/* =====================================================
                    PAGE HEADER
                ====================================================== */}

                <div className="recruiters-page-header">

                    <div>

                        <div className="page-eyebrow">
                            SMART HIRE
                        </div>

                        <h1>
                            Skills
                        </h1>

                        <p>
                            Manage skills used across
                            recruitment and candidate profiles.
                        </p>

                    </div>


                    <div className="recruiter-header-actions">

                        <div className="users-total-card">

                            <span>
                                Total Skills
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>


                        <button
                            className="create-recruiter-button"
                            onClick={handleCreateSkill}
                        >
                            + Add Skill
                        </button>

                    </div>

                </div>


                {/* =====================================================
                    ERROR
                ====================================================== */}

                {error && (
                    <div className="admin-alert admin-alert-error">
                        {error}
                    </div>
                )}


                {/* =====================================================
                    SUCCESS
                ====================================================== */}

                {success && (
                    <div className="admin-alert admin-alert-success">
                        {success}
                    </div>
                )}


                {/* =====================================================
                    MAIN CARD
                ====================================================== */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>

                            <h2>
                                Skill Management
                            </h2>

                            <p>
                                Search, filter and manage
                                recruitment skills.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        FILTERS
                    ================================================== */}

                    <div className="users-filter-section">

                        <div className="users-filter-grid recruiter-filter-grid">

                            <div className="filter-field">

                                <label>
                                    Search
                                </label>

                                <div className="search-field">

                                    <div className="search-input-wrapper">

                                        <span>
                                            🔍
                                        </span>

                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search by skill name or description"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

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
                                    className="apply-filter-button"
                                    onClick={
                                        handleApplyFilter
                                    }
                                >
                                    Apply Filter
                                </button>

                                <button
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
                    ================================================== */}

                    <div className="users-table-container">

                        <table className="professional-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        Skill
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
                                            style={{
                                                textAlign: "center",
                                                padding: "40px"
                                            }}
                                        >
                                            Loading skills...
                                        </td>

                                    </tr>

                                ) : skills.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px"
                                            }}
                                        >
                                            No skills found.
                                        </td>

                                    </tr>

                                ) : (

                                    skills.map((skill) => (

                                        <tr
                                            key={skill.id}
                                        >

                                            <td>

                                                <div className="professional-user-cell">

                                                    <div className="professional-user-avatar">
                                                        {skill.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {skill.name}
                                                        </strong>
                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="professional-email">
                                                    {skill.description ||
                                                        "—"}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        skill.isActive
                                                            ? "professional-status professional-status-active"
                                                            : "professional-status professional-status-inactive"
                                                    }
                                                >
                                                    {skill.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>


                                            <td>

                                                <span className="joined-date">
                                                    {skill.createdAt
                                                        ? new Date(
                                                            skill.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "—"}
                                                </span>

                                            </td>


                                            <td>

                                                <div className="professional-actions">

                                                    <button
                                                        className="professional-view-button"
                                                        onClick={() =>
                                                            handleViewSkill(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    <button
                                                        className="professional-edit-button"
                                                        onClick={() =>
                                                            handleEditSkill(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className={
                                                            skill.isActive
                                                                ? "professional-deactivate"
                                                                : "professional-activate"
                                                        }
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        {skill.isActive
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>


                                                    <button
                                                        className="professional-delete-button"
                                                        onClick={() =>
                                                            handleDeleteSkill(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================== */}

                    <div className="professional-pagination">

                        <div>

                            Showing{" "}
                            {skills.length} of{" "}
                            {totalRecords} skills

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
                                Previous
                            </button>


                            <span>
                                Page {pageNumber} of{" "}
                                {totalPages || 1}
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
                                Next
                            </button>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    VIEW MODAL
                ====================================================== */}

                {showViewModal &&
                    selectedSkill && (

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
                                            SKILL MANAGEMENT
                                        </span>

                                        <h2>
                                            Skill Details
                                        </h2>

                                        <p>
                                            View skill information.
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
                                            Skill name
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                selectedSkill.name
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
                                                selectedSkill.description ||
                                                ""
                                            }
                                            readOnly
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
                                                boxSizing: "border-box"
                                            }}
                                        />

                                    </div>


                                    <div className="recruiter-form-field">

                                        <label>
                                            Status
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                selectedSkill.isActive
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            readOnly
                                        />

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


                {/* =====================================================
                    CREATE / EDIT MODAL
                ====================================================== */}

                {showFormModal && (

                    <div
                        className="professional-modal-overlay"
                        onClick={
                            closeFormModal
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
                                        SKILL MANAGEMENT
                                    </span>

                                    <h2>
                                        {editingSkill
                                            ? "Edit Skill"
                                            : "Add Skill"}
                                    </h2>

                                    <p>
                                        {editingSkill
                                            ? "Update skill information."
                                            : "Create a new recruitment skill."}
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


                            <form
                                className="create-recruiter-form"
                                onSubmit={
                                    handleSaveSkill
                                }
                            >

                                <div className="recruiter-form-field">

                                    <label>
                                        Skill name
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
                                        placeholder="Enter skill name"
                                        disabled={
                                            formLoading
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
                                        placeholder="Enter skill description"
                                        disabled={
                                            formLoading
                                        }
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
                                            boxSizing: "border-box"
                                        }}
                                    />

                                </div>


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
                                            : editingSkill
                                                ? "Update Skill"
                                                : "Create Skill"}
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

export default AdminSkills;