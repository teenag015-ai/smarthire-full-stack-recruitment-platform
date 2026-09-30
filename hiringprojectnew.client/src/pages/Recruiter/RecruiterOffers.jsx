import { useEffect, useMemo, useState } from "react";
import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedOffer, setSelectedOffer] = useState(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formData, setFormData] = useState({
        applicationId: "",
        designation: "",
        offeredSalary: "",
        joiningDate: "",
        offerExpiryDate: "",
        benefits: "",
        notes: "",
    });

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================================
    // STATUS OPTIONS
    // ==========================================================

    const statusOptions = [
        "Draft",
        "Sent",
        "Accepted",
        "Rejected",
        "Expired",
        "Withdrawn",
    ];

    // ==========================================================
    // FORMATTERS
    // ==========================================================

    const formatDate = (dateString) => {
        if (!dateString) {
            return "-";
        }

        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) {
            return "-";
        }

        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatSalary = (salary) => {
        if (salary === null || salary === undefined) {
            return "-";
        }

        return `₹${Number(salary).toLocaleString("en-IN")}`;
    };

    // ==========================================================
    // STATUS STYLE
    // ==========================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "Draft":
                return "professional-status professional-status-draft";

            case "Sent":
                return "professional-status professional-status-sent";

            case "Accepted":
                return "professional-status professional-status-accepted";

            case "Rejected":
                return "professional-status professional-status-rejected";

            case "Expired":
                return "professional-status professional-status-expired";

            case "Withdrawn":
                return "professional-status professional-status-withdrawn";

            default:
                return "professional-status";
        }
    };

    // ==========================================================
    // INITIALS
    // ==========================================================

    const getInitials = (name) => {
        if (!name) {
            return "NA";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
    };

    // ==========================================================
    // FETCH OFFERS
    // ==========================================================

    const fetchOffers = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                pageNumber: currentPage,
                pageSize,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (statusFilter) {
                params.status = statusFilter;
            }

            if (fromDate) {
                params.fromDate = fromDate;
            }

            if (toDate) {
                params.toDate = toDate;
            }

            const response = await api.get("/RecruiterOffer", {
                params,
            });

            const data = response.data;

            setOffers(data.offers || []);
            setTotalRecords(data.totalRecords || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load offers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [currentPage]);

    // ==========================================================
    // FILTERS
    // ==========================================================

    const handleApplyFilter = () => {
        setCurrentPage(1);

        setTimeout(() => {
            fetchOffers();
        }, 0);
    };

    const handleClearFilter = () => {
        setSearch("");
        setStatusFilter("");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);

        setTimeout(() => {
            fetchOffers();
        }, 0);
    };

    // ==========================================================
    // FORM
    // ==========================================================

    const resetForm = () => {
        setFormData({
            applicationId: "",
            designation: "",
            offeredSalary: "",
            joiningDate: "",
            offerExpiryDate: "",
            benefits: "",
            notes: "",
        });
    };

    // ==========================================================
    // CREATE
    // ==========================================================

    const openCreateModal = () => {
        resetForm();
        setSelectedOffer(null);
        setModalMode("create");
        setShowModal(true);
        setError("");
    };

    // ==========================================================
    // EDIT
    // ==========================================================

    const openEditModal = (offer) => {
        if (offer.status !== "Draft") {
            setError("Only draft offers can be edited.");
            return;
        }

        setSelectedOffer(offer);

        setFormData({
            applicationId: offer.applicationId,
            designation: offer.designation || "",
            offeredSalary: offer.offeredSalary || "",
            joiningDate: offer.joiningDate
                ? offer.joiningDate.substring(0, 10)
                : "",
            offerExpiryDate: offer.offerExpiryDate
                ? offer.offerExpiryDate.substring(0, 10)
                : "",
            benefits: offer.benefits || "",
            notes: offer.notes || "",
        });

        setModalMode("edit");
        setShowModal(true);
        setError("");
    };

    // ==========================================================
    // VIEW
    // ==========================================================

    const openViewModal = async (offer) => {
        try {
            setError("");

            const response = await api.get(
                `/RecruiterOffer/${offer.id}`
            );

            setSelectedOffer(response.data);
            setShowViewModal(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load offer details."
            );
        }
    };

    // ==========================================================
    // CLOSE CREATE / EDIT MODAL
    // ==========================================================

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setShowModal(false);
        setSelectedOffer(null);
        resetForm();
    };

    // ==========================================================
    // INPUT CHANGE
    // ==========================================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ==========================================================
    // VALIDATION
    // ==========================================================

    const validateForm = () => {
        if (
            modalMode === "create" &&
            !formData.applicationId
        ) {
            setError("Application ID is required.");
            return false;
        }

        if (!formData.designation.trim()) {
            setError("Designation is required.");
            return false;
        }

        if (
            !formData.offeredSalary ||
            Number(formData.offeredSalary) <= 0
        ) {
            setError("Enter a valid offered salary.");
            return false;
        }

        if (!formData.joiningDate) {
            setError("Joining date is required.");
            return false;
        }

        if (!formData.offerExpiryDate) {
            setError("Offer expiry date is required.");
            return false;
        }

        if (
            new Date(formData.offerExpiryDate) <=
            new Date(formData.joiningDate)
        ) {
            setError(
                "Offer expiry date must be after the joining date."
            );

            return false;
        }

        return true;
    };

    // ==========================================================
    // CREATE / EDIT SUBMIT
    // ==========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            if (modalMode === "create") {
                const payload = {
                    applicationId: Number(
                        formData.applicationId
                    ),

                    designation:
                        formData.designation.trim(),

                    offeredSalary: Number(
                        formData.offeredSalary
                    ),

                    joiningDate:
                        `${formData.joiningDate}T00:00:00`,

                    offerExpiryDate:
                        `${formData.offerExpiryDate}T00:00:00`,

                    benefits:
                        formData.benefits.trim(),

                    notes:
                        formData.notes.trim(),
                };

                await api.post(
                    "/RecruiterOffer",
                    payload
                );

                setSuccess(
                    "Offer created successfully."
                );
            } else {
                const payload = {
                    designation:
                        formData.designation.trim(),

                    offeredSalary: Number(
                        formData.offeredSalary
                    ),

                    joiningDate:
                        `${formData.joiningDate}T00:00:00`,

                    offerExpiryDate:
                        `${formData.offerExpiryDate}T00:00:00`,

                    benefits:
                        formData.benefits.trim(),

                    notes:
                        formData.notes.trim(),
                };

                await api.put(
                    `/RecruiterOffer/${selectedOffer.id}`,
                    payload
                );

                setSuccess(
                    "Offer updated successfully."
                );
            }

            setShowModal(false);
            resetForm();

            await fetchOffers();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save offer."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================================
    // STATUS CHANGE
    //
    // Recruiter can ONLY:
    // Draft -> Sent
    // Sent  -> Withdrawn
    //
    // Accepted / Rejected are handled by Candidate module.
    // ==========================================================

    const handleStatusChange = async (
        offer,
        newStatus
    ) => {
        try {
            setError("");
            setSuccess("");

            await api.put(
                `/RecruiterOffer/${offer.id}/status`,
                newStatus,
                {
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            setSuccess(
                `Offer status changed to ${newStatus}.`
            );

            await fetchOffers();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update offer status."
            );
        }
    };

    // ==========================================================
    // SEND OFFER
    // ==========================================================

    const handleSendOffer = async (offer) => {
        if (offer.status !== "Draft") {
            return;
        }

        await handleStatusChange(
            offer,
            "Sent"
        );
    };

    // ==========================================================
    // WITHDRAW OFFER
    // ==========================================================

    const handleWithdrawOffer = async (offer) => {
        if (offer.status !== "Sent") {
            return;
        }

        await handleStatusChange(
            offer,
            "Withdrawn"
        );
    };

    // ==========================================================
    // DELETE
    // ==========================================================

    const handleDeleteClick = (offer) => {
        if (offer.status !== "Draft") {
            setError(
                "Only draft offers can be deleted."
            );

            return;
        }

        setSelectedOffer(offer);
        setShowDeleteModal(true);
        setError("");
    };

    const handleDelete = async () => {
        if (!selectedOffer) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await api.delete(
                `/RecruiterOffer/${selectedOffer.id}`
            );

            setSuccess(
                "Offer deleted successfully."
            );

            setShowDeleteModal(false);
            setSelectedOffer(null);

            await fetchOffers();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete offer."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================================
    // PAGINATION
    // ==========================================================

    const visiblePageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }

        if (currentPage >= totalPages - 2) {
            return [
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            currentPage - 2,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2,
        ];
    }, [currentPage, totalPages]);

    return (
        <RecruiterLayout activePage="offers">
            <div className="admin-page recruiter-offers-page">

                {/* =====================================================
                    PAGE HEADER
                ====================================================== */}

                <div className="recruiter-page-header">
                    <div>
                        <span className="page-eyebrow">
                            RECRUITMENT
                        </span>

                        <h2>Offers</h2>

                        <p>
                            Manage candidate offers,
                            salary details and offer
                            status.
                        </p>
                    </div>

                    <div className="recruiter-header-actions">

                        <div className="users-total-card">
                            <span>
                                Total Offers
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
                            + Create Offer
                        </button>
                    </div>
                </div>

                {/* =====================================================
                    ALERTS
                ====================================================== */}

                {error && (
                    <div className="admin-alert admin-alert-error">

                        <span>!</span>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {success && (
                    <div className="admin-alert admin-alert-success">

                        <span>✓</span>

                        <p>{success}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* =====================================================
                    OFFER LIST
                ====================================================== */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>
                            <h3>
                                Offer List
                            </h3>

                            <p>
                                Manage candidate offers
                                and offer activity.
                            </p>
                        </div>

                    </div>

                    {/* =================================================
                        FILTERS
                    ================================================== */}

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
                                        placeholder="Search candidate, job or designation"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                            {/* STATUS */}

                            <div className="filter-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Status
                                    </option>

                                    {statusOptions.map(
                                        (status) => (
                                            <option
                                                key={
                                                    status
                                                }
                                                value={
                                                    status
                                                }
                                            >
                                                {
                                                    status
                                                }
                                            </option>
                                        )
                                    )}

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
                                    onChange={(event) =>
                                        setFromDate(
                                            event.target.value
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
                                    onChange={(event) =>
                                        setToDate(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* ACTIONS */}

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
                    ================================================== */}

                    <div className="users-table-container">

                        {loading ? (

                            <div className="users-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading offers...
                                </p>

                            </div>

                        ) : offers.length === 0 ? (

                            <div className="users-empty">

                                <div className="users-empty-icon">
                                    ▣
                                </div>

                                <h3>
                                    No offers found
                                </h3>

                                <p>
                                    There are no offers
                                    matching the selected
                                    filters.
                                </p>

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
                                            DESIGNATION
                                        </th>

                                        <th>
                                            SALARY
                                        </th>

                                        <th>
                                            JOINING
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

                                    {offers.map(
                                        (offer) => (

                                            <tr
                                                key={
                                                    offer.id
                                                }
                                            >

                                                {/* CANDIDATE */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {getInitials(
                                                                offer.candidateName
                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    offer.candidateName
                                                                }
                                                            </strong>

                                                            <span className="professional-email">
                                                                {
                                                                    offer.candidateEmail
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* JOB */}

                                                <td>

                                                    <span className="professional-job-title">
                                                        {
                                                            offer.jobTitle
                                                        }
                                                    </span>

                                                    <small className="offer-application-id">
                                                        Application #
                                                        {
                                                            offer.applicationId
                                                        }
                                                    </small>

                                                </td>

                                                {/* DESIGNATION */}

                                                <td>

                                                    <div className="offer-designation-cell">

                                                        <strong>
                                                            {
                                                                offer.designation
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>

                                                {/* SALARY */}

                                                <td>

                                                    <strong className="offer-salary">

                                                        {formatSalary(
                                                            offer.offeredSalary
                                                        )}

                                                    </strong>

                                                </td>

                                                {/* JOINING */}

                                                <td>

                                                    <span className="joined-date">

                                                        {formatDate(
                                                            offer.joiningDate
                                                        )}

                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={getStatusClass(
                                                            offer.status
                                                        )}
                                                    >
                                                        {
                                                            offer.status
                                                        }
                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="professional-actions">

                                                        {/* VIEW */}

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    offer
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        {/* EDIT - DRAFT ONLY */}

                                                        {offer.status ===
                                                            "Draft" && (

                                                                <button
                                                                    type="button"
                                                                    className="professional-edit-button"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            offer
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                            )}

                                                        {/* SEND - DRAFT ONLY */}

                                                        {offer.status ===
                                                            "Draft" && (

                                                                <button
                                                                    type="button"
                                                                    className="professional-activate"
                                                                    onClick={() =>
                                                                        handleSendOffer(
                                                                            offer
                                                                        )
                                                                    }
                                                                >
                                                                    Send
                                                                </button>

                                                            )}

                                                        {/* WITHDRAW - SENT ONLY */}

                                                        {offer.status ===
                                                            "Sent" && (

                                                                <button
                                                                    type="button"
                                                                    className="professional-deactivate"
                                                                    onClick={() =>
                                                                        handleWithdrawOffer(
                                                                            offer
                                                                        )
                                                                    }
                                                                >
                                                                    Withdraw
                                                                </button>

                                                            )}

                                                        {/* DELETE - DRAFT ONLY */}

                                                        {offer.status ===
                                                            "Draft" && (

                                                                <button
                                                                    type="button"
                                                                    className="professional-delete-button"
                                                                    onClick={() =>
                                                                        handleDeleteClick(
                                                                            offer
                                                                        )
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
                    ================================================== */}

                    {!loading &&
                        totalPages > 0 && (

                            <div className="professional-pagination">

                                <div className="pagination-info">

                                    Showing page{" "}

                                    <strong>
                                        {currentPage}
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
                                            currentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (previous) =>
                                                    previous -
                                                    1
                                            )
                                        }
                                    >
                                        Previous
                                    </button>

                                    {visiblePageNumbers.map(
                                        (page) => (

                                            <button
                                                type="button"
                                                key={page}
                                                className={
                                                    currentPage ===
                                                        page
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
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
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
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
                    CREATE / EDIT MODAL
                ====================================================== */}

                {showModal && (

                    <div className="professional-modal-overlay">

                        <div className="professional-modal create-recruiter-modal offer-modal">

                            <div className="professional-modal-header">

                                <div>

                                    <span className="page-eyebrow">
                                        OFFER MANAGEMENT
                                    </span>

                                    <h3>
                                        {modalMode ===
                                            "create"
                                            ? "Create Offer"
                                            : "Edit Offer"}
                                    </h3>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <form
                                className="create-recruiter-form"
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                {/* APPLICATION ID */}

                                {modalMode ===
                                    "create" && (

                                        <div className="recruiter-form-field">

                                            <label>
                                                Application ID
                                                <span>*</span>
                                            </label>

                                            <input
                                                type="number"
                                                name="applicationId"
                                                value={
                                                    formData.applicationId
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                placeholder="Enter application ID"
                                                min="1"
                                            />

                                        </div>

                                    )}

                                {/* DESIGNATION */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Designation
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={
                                            formData.designation
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. Software Engineer"
                                        maxLength={150}
                                    />

                                </div>

                                {/* SALARY / DATES */}

                                <div className="offer-form-grid">

                                    <div className="recruiter-form-field">

                                        <label>
                                            Offered Salary
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="number"
                                            name="offeredSalary"
                                            value={
                                                formData.offeredSalary
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="e.g. 600000"
                                            min="1"
                                        />

                                    </div>

                                    <div className="recruiter-form-field">

                                        <label>
                                            Joining Date
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="date"
                                            name="joiningDate"
                                            value={
                                                formData.joiningDate
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>

                                    <div className="recruiter-form-field">

                                        <label>
                                            Offer Expiry Date
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="date"
                                            name="offerExpiryDate"
                                            value={
                                                formData.offerExpiryDate
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>

                                </div>

                                {/* BENEFITS */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Benefits
                                    </label>

                                    <textarea
                                        name="benefits"
                                        value={
                                            formData.benefits
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Health insurance, paid leave, bonus..."
                                        rows="3"
                                        maxLength={2000}
                                    />

                                </div>

                                {/* NOTES */}

                                <div className="recruiter-form-field">

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={
                                            formData.notes
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Additional offer notes..."
                                        rows="3"
                                        maxLength={2000}
                                    />

                                </div>

                                {/* WORKFLOW INFO */}

                                <div className="recruiter-create-info">

                                    <strong>
                                        Offer workflow
                                    </strong>

                                    <p>
                                        New offers start as{" "}
                                        <strong>
                                            Draft
                                        </strong>
                                        . Draft offers can
                                        be edited or sent
                                        to the candidate.
                                        Once sent, the
                                        recruiter can
                                        withdraw the offer.
                                        The candidate will
                                        later be able to
                                        accept or reject
                                        the offer.
                                    </p>

                                </div>

                                {/* FORM ACTIONS */}

                                <div className="create-recruiter-actions">

                                    <button
                                        type="button"
                                        className="clear-filter-button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="create-recruiter-button"
                                        disabled={
                                            submitting
                                        }
                                    >
                                        {submitting
                                            ? "Saving..."
                                            : modalMode ===
                                                "create"
                                                ? "Create Offer"
                                                : "Save Changes"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

                {/* =====================================================
                    VIEW MODAL
                ====================================================== */}

                {showViewModal &&
                    selectedOffer && (

                        <div className="professional-modal-overlay">

                            <div className="professional-modal offer-view-modal">

                                <div className="professional-modal-header">

                                    <div>

                                        <span className="page-eyebrow">
                                            OFFER DETAILS
                                        </span>

                                        <h3>
                                            {
                                                selectedOffer.designation
                                            }
                                        </h3>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowViewModal(
                                                false
                                            );

                                            setSelectedOffer(
                                                null
                                            );
                                        }}
                                    >
                                        ×
                                    </button>

                                </div>

                                <div className="offer-details-content">

                                    {/* PROFILE */}

                                    <div className="offer-profile-card">

                                        <div className="professional-user-avatar large-avatar">

                                            {getInitials(
                                                selectedOffer.candidateName
                                            )}

                                        </div>

                                        <div>

                                            <h4>
                                                {
                                                    selectedOffer.candidateName
                                                }
                                            </h4>

                                            <p>
                                                {
                                                    selectedOffer.candidateEmail
                                                }
                                            </p>

                                        </div>

                                        <span
                                            className={getStatusClass(
                                                selectedOffer.status
                                            )}
                                        >
                                            {
                                                selectedOffer.status
                                            }
                                        </span>

                                    </div>

                                    {/* DETAILS */}

                                    <div className="offer-details-grid">

                                        <div className="offer-detail-item">

                                            <span>
                                                Job
                                            </span>

                                            <strong>
                                                {
                                                    selectedOffer.jobTitle
                                                }
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Designation
                                            </span>

                                            <strong>
                                                {
                                                    selectedOffer.designation
                                                }
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Offered Salary
                                            </span>

                                            <strong>
                                                {formatSalary(
                                                    selectedOffer.offeredSalary
                                                )}
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Joining Date
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedOffer.joiningDate
                                                )}
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Offer Expiry
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedOffer.offerExpiryDate
                                                )}
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Application ID
                                            </span>

                                            <strong>
                                                #
                                                {
                                                    selectedOffer.applicationId
                                                }
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Created
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    selectedOffer.createdAt
                                                )}
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Sent At
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    selectedOffer.sentAt
                                                )}
                                            </strong>

                                        </div>

                                        <div className="offer-detail-item">

                                            <span>
                                                Responded At
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    selectedOffer.respondedAt
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                    {/* BENEFITS */}

                                    <div className="offer-detail-section">

                                        <span>
                                            Benefits
                                        </span>

                                        <p>
                                            {selectedOffer.benefits ||
                                                "No benefits specified."}
                                        </p>

                                    </div>

                                    {/* NOTES */}

                                    <div className="offer-detail-section">

                                        <span>
                                            Notes
                                        </span>

                                        <p>
                                            {selectedOffer.notes ||
                                                "No additional notes."}
                                        </p>

                                    </div>

                                </div>

                                <div className="create-recruiter-actions">

                                    <button
                                        type="button"
                                        className="clear-filter-button"
                                        onClick={() => {
                                            setShowViewModal(
                                                false
                                            );

                                            setSelectedOffer(
                                                null
                                            );
                                        }}
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                {/* =====================================================
                    DELETE MODAL
                ====================================================== */}

                {showDeleteModal &&
                    selectedOffer && (

                        <div className="professional-modal-overlay">

                            <div className="professional-modal delete-confirmation-modal">

                                <div className="professional-modal-header">

                                    <div>

                                        <span className="page-eyebrow">
                                            CONFIRM ACTION
                                        </span>

                                        <h3>
                                            Delete Offer
                                        </h3>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeleteModal(
                                                false
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                                <div className="delete-confirmation-content">

                                    <div className="delete-warning-icon">
                                        !
                                    </div>

                                    <h4>
                                        Delete this offer?
                                    </h4>

                                    <p>
                                        You are about to
                                        delete the draft
                                        offer for{" "}
                                        <strong>
                                            {
                                                selectedOffer.candidateName
                                            }
                                        </strong>
                                        .
                                    </p>

                                    <p>
                                        This action cannot
                                        be undone.
                                    </p>

                                </div>

                                <div className="create-recruiter-actions">

                                    <button
                                        type="button"
                                        className="clear-filter-button"
                                        onClick={() =>
                                            setShowDeleteModal(
                                                false
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="professional-delete-button"
                                        onClick={
                                            handleDelete
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        {submitting
                                            ? "Deleting..."
                                            : "Delete Offer"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

            </div>
        </RecruiterLayout>
    );
};

export default RecruiterOffers;