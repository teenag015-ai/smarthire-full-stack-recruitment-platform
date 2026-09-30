import { useEffect, useState } from "react";
import RecruiterLayout from "../../components/RecruiterLayout";
import api from "../../services/api";

const RecruiterApplicants = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [jobId, setJobId] = useState("");
    const [currentStage, setCurrentStage] = useState("");
    const [isActive, setIsActive] = useState("");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [jobs, setJobs] = useState([]);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] =
        useState(null);

    const [stageLoading, setStageLoading] = useState(false);

    const token =
        localStorage.getItem("smartHireToken");

    const stages = [
        "Applied",
        "Screening",
        "Shortlisted",
        "Assessment",
        "Interview",
        "Selected",
        "Offer",
        "Hired",
        "Rejected",
    ];

    // =========================================================
    // FETCH JOBS
    // =========================================================

    const fetchJobs = async () => {
        try {
            const response = await api.get(
                "/RecruiterJob",
                {
                    params: {
                        pageNumber: 1,
                        pageSize: 100,
                    },
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setJobs(
                response.data.jobs || []
            );
        } catch (err) {
            console.error(
                "Failed to load jobs:",
                err
            );
        }
    };

    // =========================================================
    // FETCH APPLICANTS
    // =========================================================

    const fetchApplicants = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                "/RecruiterApplicant",
                {
                    params: {
                        search:
                            search || undefined,

                        jobId:
                            jobId || undefined,

                        currentStage:
                            currentStage ||
                            undefined,

                        isActive:
                            isActive === ""
                                ? undefined
                                : isActive === "true",

                        pageNumber,
                        pageSize,
                    },

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setApplicants(
                response.data.applicants || []
            );

            setTotalRecords(
                response.data.totalRecords || 0
            );

            setTotalPages(
                response.data.totalPages || 0
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load applicants."
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

    // =========================================================
    // APPLICANT LOAD
    // =========================================================

    useEffect(() => {
        fetchApplicants();
    }, [
        pageNumber,
        search,
        jobId,
        currentStage,
        isActive,
    ]);

    // =========================================================
    // APPLY FILTER
    // =========================================================

    const handleApplyFilter = () => {
        setPageNumber(1);
        fetchApplicants();
    };

    // =========================================================
    // CLEAR FILTER
    // =========================================================

    const handleClearFilter = () => {
        setSearch("");
        setJobId("");
        setCurrentStage("");
        setIsActive("");
        setPageNumber(1);
    };

    // =========================================================
    // VIEW APPLICANT
    // =========================================================

    const handleViewApplicant = async (
        applicationId
    ) => {
        setError("");

        try {
            const response = await api.get(
                `/RecruiterApplicant/${applicationId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setSelectedApplicant(
                response.data
            );

            setShowViewModal(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load applicant details."
            );
        }
    };

    // =========================================================
    // UPDATE APPLICATION STAGE
    // =========================================================

    const handleStageChange = async (
        applicationId,
        newStage
    ) => {
        if (!newStage) {
            return;
        }

        setStageLoading(true);
        setError("");
        setSuccess("");

        try {
            await api.put(
                `/RecruiterApplicant/${applicationId}/stage`,
                newStage,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },
                }
            );

            setSuccess(
                "Application stage updated successfully."
            );

            setSelectedApplicant(
                (previous) =>
                    previous
                        ? {
                            ...previous,
                            currentStage:
                                newStage,
                        }
                        : previous
            );

            await fetchApplicants();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update application stage."
            );
        } finally {
            setStageLoading(false);
        }
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

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
    // STAGE CLASS
    // =========================================================

    const getStageClass = (stage) => {
        switch (stage) {

            case "Applied":
                return "applicant-stage applicant-stage-applied";

            case "Screening":
                return "applicant-stage applicant-stage-screening";

            case "Shortlisted":
                return "applicant-stage applicant-stage-shortlisted";

            case "Assessment":
                return "applicant-stage applicant-stage-assessment";

            case "Interview":
                return "applicant-stage applicant-stage-interview";

            case "Selected":
                return "applicant-stage applicant-stage-selected";

            case "Offer":
                return "applicant-stage applicant-stage-offer";

            case "Hired":
                return "applicant-stage applicant-stage-hired";

            case "Rejected":
                return "applicant-stage applicant-stage-rejected";

            default:
                return "applicant-stage";
        }
    };

    // =========================================================
    // CLOSE APPLICANT MODAL
    // =========================================================

    const closeApplicantModal = () => {
        if (stageLoading) {
            return;
        }

        setShowViewModal(false);
        setSelectedApplicant(null);
    };

    return (
        <RecruiterLayout activePage="applicants">

            <div className="admin-page recruiters-page recruiter-applicants-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="recruiters-page-header">

                    <div>

                        <span className="page-eyebrow">
                            APPLICANT MANAGEMENT
                        </span>

                        <h2>
                            Applicants
                        </h2>

                        <p>
                            Review candidates and manage
                            their recruitment progress.
                        </p>

                    </div>

                    <div className="users-total-card">

                        <span>
                            TOTAL APPLICANTS
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
                        {error}
                    </div>
                )}

                {success && (
                    <div className="admin-alert admin-alert-success">
                        {success}
                    </div>
                )}


                {/* =================================================
                    APPLICANT CARD
                ================================================= */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>

                            <span className="page-eyebrow">
                                CANDIDATE APPLICATIONS
                            </span>

                            <h3>
                                Applicant List
                            </h3>

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
                                        placeholder="Search candidate or job..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* JOB */}

                            <div className="filter-field">

                                <label>
                                    Job
                                </label>

                                <select
                                    value={jobId}
                                    onChange={(e) => {
                                        setJobId(
                                            e.target.value
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
                                                key={job.id}
                                                value={job.id}
                                            >
                                                {job.title}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* STAGE */}

                            <div className="filter-field">

                                <label>
                                    Stage
                                </label>

                                <select
                                    value={currentStage}
                                    onChange={(e) => {
                                        setCurrentStage(
                                            e.target.value
                                        );

                                        setPageNumber(1);
                                    }}
                                >

                                    <option value="">
                                        All Stages
                                    </option>

                                    {stages.map(
                                        (stage) => (
                                            <option
                                                key={stage}
                                                value={stage}
                                            >
                                                {stage}
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
                                    value={isActive}
                                    onChange={(e) => {
                                        setIsActive(
                                            e.target.value
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


                            {/* FILTER ACTIONS */}

                            <div className="filter-actions">

                                <button
                                    type="button"
                                    className="apply-filter-button"
                                    onClick={
                                        handleApplyFilter
                                    }
                                >
                                    Apply
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
                        APPLICANT TABLE
                    ================================================= */}

                    <div className="users-table-container">

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
                                        STAGE
                                    </th>

                                    <th>
                                        APPLIED
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

                                {/* LOADING */}

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="table-empty-state"
                                        >
                                            Loading applicants...
                                        </td>

                                    </tr>

                                ) : applicants.length === 0 ? (

                                    /* EMPTY */

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="table-empty-state"
                                        >
                                            No applicants found.
                                        </td>

                                    </tr>

                                ) : (

                                    /* DATA */

                                    applicants.map(
                                        (applicant) => (

                                            <tr
                                                key={
                                                    applicant.applicationId
                                                }
                                            >

                                                {/* CANDIDATE */}

                                                <td>

                                                    <div className="professional-user-cell">

                                                        <div className="professional-user-avatar">

                                                            {applicant
                                                                .candidateName
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    applicant.candidateName
                                                                }
                                                            </strong>

                                                            <span className="professional-email">
                                                                {
                                                                    applicant.candidateEmail
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* JOB */}

                                                <td>

                                                    <span className="job-title-cell">

                                                        {
                                                            applicant.jobTitle
                                                        }

                                                    </span>

                                                </td>


                                                {/* STAGE */}

                                                <td>

                                                    <span
                                                        className={getStageClass(
                                                            applicant.currentStage
                                                        )}
                                                    >
                                                        {
                                                            applicant.currentStage
                                                        }
                                                    </span>

                                                </td>


                                                {/* APPLIED DATE */}

                                                <td>

                                                    <span className="joined-date">

                                                        {formatDate(
                                                            applicant.appliedAt
                                                        )}

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`professional-status ${applicant.isActive
                                                                ? "professional-status-active"
                                                                : "professional-status-inactive"
                                                            }`}
                                                    >

                                                        {applicant.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <div className="professional-actions">

                                                        <button
                                                            type="button"
                                                            className="professional-view-button"
                                                            onClick={() =>
                                                                handleViewApplicant(
                                                                    applicant.applicationId
                                                                )
                                                            }
                                                        >
                                                            View
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
                            {applicants.length}{" "}
                            of{" "}
                            {totalRecords} applicants

                        </div>


                        <div className="pagination-controls">

                            <button
                                type="button"
                                disabled={
                                    pageNumber <= 1
                                }
                                onClick={() =>
                                    setPageNumber(
                                        (previous) =>
                                            previous - 1
                                    )
                                }
                            >
                                Previous
                            </button>


                            <span>

                                Page{" "}
                                {pageNumber}{" "}
                                of{" "}
                                {totalPages || 1}

                            </span>


                            <button
                                type="button"
                                disabled={
                                    pageNumber >=
                                    totalPages
                                }
                                onClick={() =>
                                    setPageNumber(
                                        (previous) =>
                                            previous + 1
                                    )
                                }
                            >
                                Next
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================================================
                APPLICANT DETAILS MODAL
            ========================================================= */}

            {showViewModal &&
                selectedApplicant && (

                    <div
                        className="professional-modal-overlay"
                        onClick={
                            closeApplicantModal
                        }
                    >

                        <div
                            className="professional-modal applicant-view-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            {/* =================================================
                                MODAL HEADER
                            ================================================= */}

                            <div className="professional-modal-header">

                                <div>

                                    <span>
                                        APPLICANT PROFILE
                                    </span>

                                    <h2>
                                        Applicant Details
                                    </h2>

                                    <p>
                                        Review candidate application
                                        information and recruitment
                                        progress.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeApplicantModal
                                    }
                                    disabled={
                                        stageLoading
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* =================================================
                                MODAL BODY
                            ================================================= */}

                            <div className="professional-modal-body">


                                {/* =================================================
                                    CANDIDATE PROFILE
                                ================================================= */}

                                <div className="professional-modal-profile">

                                    <div className="professional-modal-avatar">

                                        {selectedApplicant
                                            .candidateName
                                            ?.charAt(0)
                                            ?.toUpperCase()}

                                    </div>


                                    <div>

                                        <h3>
                                            {
                                                selectedApplicant.candidateName
                                            }
                                        </h3>

                                        <p>
                                            {
                                                selectedApplicant.candidateEmail
                                            }
                                        </p>

                                    </div>

                                </div>


                                {/* =================================================
                                    APPLICATION DETAILS
                                ================================================= */}

                                <div className="professional-detail-grid">


                                    {/* APPLICATION ID */}

                                    <div>

                                        <span>
                                            Application ID
                                        </span>

                                        <strong>
                                            #
                                            {
                                                selectedApplicant.applicationId
                                            }
                                        </strong>

                                    </div>


                                    {/* CANDIDATE */}

                                    <div>

                                        <span>
                                            Candidate
                                        </span>

                                        <strong>
                                            {
                                                selectedApplicant.candidateName
                                            }
                                        </strong>

                                    </div>


                                    {/* EMAIL */}

                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedApplicant.candidateEmail
                                            }
                                        </strong>

                                    </div>


                                    {/* APPLIED FOR */}

                                    <div>

                                        <span>
                                            Applied For
                                        </span>

                                        <strong>
                                            {
                                                selectedApplicant.jobTitle
                                            }
                                        </strong>

                                    </div>


                                    {/* APPLIED DATE */}

                                    <div>

                                        <span>
                                            Applied Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedApplicant.appliedAt
                                            )}
                                        </strong>

                                    </div>


                                    {/* CURRENT STAGE */}

                                    <div>

                                        <span>
                                            Current Stage
                                        </span>

                                        <strong>
                                            {
                                                selectedApplicant.currentStage
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================================
                                    RECRUITMENT STAGE
                                ================================================= */}

                                <div className="applicant-stage-update">

                                    <label>
                                        Recruitment Stage
                                    </label>


                                    <select
                                        value={
                                            selectedApplicant.currentStage
                                        }
                                        disabled={
                                            stageLoading
                                        }
                                        onChange={(event) =>
                                            handleStageChange(
                                                selectedApplicant.applicationId,
                                                event.target.value
                                            )
                                        }
                                    >

                                        {stages.map(
                                            (stage) => (

                                                <option
                                                    key={stage}
                                                    value={stage}
                                                >
                                                    {stage}
                                                </option>

                                            )
                                        )}

                                    </select>


                                    {stageLoading && (

                                        <span>
                                            Updating stage...
                                        </span>

                                    )}

                                </div>


                                {/* =================================================
                                    COVER LETTER
                                ================================================= */}

                                <div className="applicant-cover-letter">

                                    <label>
                                        Cover Letter
                                    </label>


                                    <div>

                                        {
                                            selectedApplicant.coverLetter ||
                                            "No cover letter provided."
                                        }

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                MODAL FOOTER
                            ================================================= */}

                            <div className="create-recruiter-actions applicant-modal-footer">

                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={
                                        closeApplicantModal
                                    }
                                    disabled={
                                        stageLoading
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </RecruiterLayout>
    );
};

export default RecruiterApplicants;