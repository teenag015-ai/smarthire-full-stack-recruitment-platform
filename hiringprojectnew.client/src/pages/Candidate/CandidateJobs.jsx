import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

const CandidateJobs = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] =
        useState("");
    const [categoryFilter, setCategoryFilter] =
        useState("");
    const [employmentFilter, setEmploymentFilter] =
        useState("");
    const [experienceFilter, setExperienceFilter] =
        useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const jobsPerPage = 6;

    // =========================================================
    // LOAD JOBS
    // =========================================================

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem(
                    "smartHireToken"
                );

            const storedUser =
                localStorage.getItem(
                    "smartHireUser"
                );

            const user = storedUser
                ? JSON.parse(storedUser)
                : null;

            if (!token || !user) {
                navigate("/login");
                return;
            }

            if (user.role !== "Candidate") {
                navigate("/login");
                return;
            }

            const response =
                await api.get("/CandidateJob");

            setJobs(response.data || []);

        } catch (err) {
            console.error(
                "Load candidate jobs error:",
                err
            );

            if (
                err.response?.status === 401
            ) {
                setError(
                    "Your session is not authorized. Please login again."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load available jobs."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // UNIQUE DEPARTMENTS
    // =========================================================

    const departments = useMemo(() => {
        return [
            ...new Set(
                jobs
                    .map(
                        (job) =>
                            job.departmentName
                    )
                    .filter(Boolean)
            ),
        ].sort();
    }, [jobs]);

    // =========================================================
    // UNIQUE CATEGORIES
    // =========================================================

    const categories = useMemo(() => {
        return [
            ...new Set(
                jobs
                    .map(
                        (job) =>
                            job.jobCategoryName
                    )
                    .filter(Boolean)
            ),
        ].sort();
    }, [jobs]);

    // =========================================================
    // UNIQUE EMPLOYMENT TYPES
    // =========================================================

    const employmentTypes = useMemo(() => {
        return [
            ...new Set(
                jobs
                    .map(
                        (job) =>
                            job.employmentType
                    )
                    .filter(Boolean)
            ),
        ].sort();
    }, [jobs]);

    // =========================================================
    // UNIQUE EXPERIENCE LEVELS
    // =========================================================

    const experienceLevels = useMemo(() => {
        return [
            ...new Set(
                jobs
                    .map(
                        (job) =>
                            job.experienceLevel
                    )
                    .filter(Boolean)
            ),
        ].sort();
    }, [jobs]);

    // =========================================================
    // FILTER JOBS
    // =========================================================

    const filteredJobs = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return jobs.filter((job) => {

            const matchesSearch =
                !searchValue ||
                job.title
                    ?.toLowerCase()
                    .includes(searchValue) ||
                job.location
                    ?.toLowerCase()
                    .includes(searchValue) ||
                job.departmentName
                    ?.toLowerCase()
                    .includes(searchValue) ||
                job.jobCategoryName
                    ?.toLowerCase()
                    .includes(searchValue) ||
                job.requiredSkills
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesDepartment =
                !departmentFilter ||
                job.departmentName ===
                departmentFilter;

            const matchesCategory =
                !categoryFilter ||
                job.jobCategoryName ===
                categoryFilter;

            const matchesEmployment =
                !employmentFilter ||
                job.employmentType ===
                employmentFilter;

            const matchesExperience =
                !experienceFilter ||
                job.experienceLevel ===
                experienceFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesCategory &&
                matchesEmployment &&
                matchesExperience
            );
        });

    }, [
        jobs,
        search,
        departmentFilter,
        categoryFilter,
        employmentFilter,
        experienceFilter,
    ]);

    // =========================================================
    // PAGINATION CALCULATIONS
    // =========================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredJobs.length /
            jobsPerPage
        )
    );

    const startIndex =
        (currentPage - 1) *
        jobsPerPage;

    const currentJobs =
        filteredJobs.slice(
            startIndex,
            startIndex + jobsPerPage
        );

    // =========================================================
    // RESET PAGE WHEN FILTER CHANGES
    // =========================================================

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        departmentFilter,
        categoryFilter,
        employmentFilter,
        experienceFilter,
    ]);

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setDepartmentFilter("");
        setCategoryFilter("");
        setEmploymentFilter("");
        setExperienceFilter("");
        setCurrentPage(1);
    };

    // =========================================================
    // FORMAT SALARY
    // =========================================================

    const formatSalary = (
        minimumSalary,
        maximumSalary
    ) => {

        if (
            minimumSalary == null &&
            maximumSalary == null
        ) {
            return "Salary not disclosed";
        }

        const formatAmount = (amount) => {

            if (amount >= 10000000) {
                return (
                    "₹" +
                    (amount / 10000000)
                        .toFixed(1)
                        .replace(".0", "") +
                    " Cr"
                );
            }

            if (amount >= 100000) {
                return (
                    "₹" +
                    (amount / 100000)
                        .toFixed(1)
                        .replace(".0", "") +
                    " L"
                );
            }

            return (
                "₹" +
                Number(amount)
                    .toLocaleString("en-IN")
            );
        };

        if (
            minimumSalary != null &&
            maximumSalary != null
        ) {
            return `${formatAmount(
                minimumSalary
            )} - ${formatAmount(
                maximumSalary
            )}`;
        }

        if (minimumSalary != null) {
            return `From ${formatAmount(
                minimumSalary
            )}`;
        }

        return `Up to ${formatAmount(
            maximumSalary
        )}`;
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "Not specified";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Not specified";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // VIEW JOB
    // =========================================================

    const handleViewJob = (jobId) => {
        navigate(
            `/candidate/jobs/${jobId}`
        );
    };

    // =========================================================
    // GO TO PREVIOUS PAGE
    // =========================================================

    const handlePreviousPage = () => {

        if (currentPage <= 1) {
            return;
        }

        setCurrentPage(
            (page) => page - 1
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // GO TO NEXT PAGE
    // =========================================================

    const handleNextPage = () => {

        if (
            currentPage >=
            totalPages
        ) {
            return;
        }

        setCurrentPage(
            (page) => page + 1
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <CandidateLayout
                activePage="jobs"
            >

                <div
                    style={{
                        minHeight: "500px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        color: "#687995",
                    }}
                >

                    <div
                        style={{
                            width: "38px",
                            height: "38px",
                            border:
                                "3px solid #DCE7F8",
                            borderTop:
                                "3px solid #2D6EE8",
                            borderRadius: "50%",
                            animation:
                                "spin 1s linear infinite",
                            marginBottom: "14px",
                        }}
                    />

                    <p
                        style={{
                            margin: 0,
                            fontSize: "14px",
                        }}
                    >
                        Loading available jobs...
                    </p>

                </div>

            </CandidateLayout>
        );
    }

    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (
        <CandidateLayout
            activePage="jobs"
        >

            <div
                style={{
                    width: "100%",
                }}
            >

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent:
                            "space-between",
                        marginBottom: "28px",
                    }}
                >

                    <div>

                        <span
                            style={{
                                display: "block",
                                color: "#2766D9",
                                fontSize: "12px",
                                fontWeight: "700",
                                letterSpacing: "1px",
                                marginBottom: "7px",
                            }}
                        >
                            CAREER OPPORTUNITIES
                        </span>

                        <h2
                            style={{
                                margin: 0,
                                color: "#10254A",
                                fontSize: "29px",
                                fontWeight: "700",
                                lineHeight: "1.2",
                            }}
                        >
                            Find Your Next
                            Opportunity
                        </h2>

                        <p
                            style={{
                                margin:
                                    "9px 0 0",
                                color: "#687995",
                                fontSize: "14px",
                                lineHeight: "1.5",
                            }}
                        >
                            Explore open positions
                            and find a role that
                            matches your skills
                            and career goals.
                        </p>

                    </div>

                    {/* AVAILABLE JOBS */}

                    <div
                        style={{
                            minWidth: "150px",
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "10px",
                            padding:
                                "15px 19px",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <span
                            style={{
                                display: "block",
                                color: "#8290A8",
                                fontSize: "10px",
                                fontWeight: "700",
                                letterSpacing:
                                    "0.7px",
                            }}
                        >
                            AVAILABLE JOBS
                        </span>

                        <strong
                            style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#10254A",
                                fontSize: "25px",
                                fontWeight: "700",
                            }}
                        >
                            {filteredJobs.length}
                        </strong>

                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        style={{
                            marginBottom: "18px",
                            padding:
                                "13px 16px",
                            borderRadius: "8px",
                            background: "#FDECEC",
                            border:
                                "1px solid #F5CACA",
                            color: "#C03939",
                            fontSize: "12px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* =================================================
                    SEARCH + FILTERS
                ================================================= */}

                <div
                    style={{
                        background: "#FFFFFF",
                        border:
                            "1px solid #E4E9F1",
                        borderRadius: "11px",
                        padding: "22px",
                        marginBottom: "25px",
                        boxShadow:
                            "0 3px 12px rgba(15,23,42,0.03)",
                    }}
                >

                    <div
                        style={{
                            marginBottom: "19px",
                        }}
                    >

                        <span
                            style={{
                                display: "block",
                                color: "#2766D9",
                                fontSize: "11px",
                                fontWeight: "700",
                                letterSpacing:
                                    "0.8px",
                                marginBottom: "6px",
                            }}
                        >
                            JOB SEARCH
                        </span>

                        <h3
                            style={{
                                margin: 0,
                                color: "#10254A",
                                fontSize: "19px",
                                fontWeight: "700",
                            }}
                        >
                            Find Jobs
                        </h3>

                        <p
                            style={{
                                margin:
                                    "6px 0 0",
                                color: "#8290A8",
                                fontSize: "12px",
                            }}
                        >
                            Search and filter
                            available recruitment
                            opportunities.
                        </p>

                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "2fr repeat(4, 1fr) auto",
                            gap: "12px",
                            alignItems: "end",
                        }}
                    >

                        {/* SEARCH */}

                        <div>

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        "600",
                                }}
                            >
                                Search
                            </label>

                            <div
                                style={{
                                    height: "42px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    border:
                                        "1px solid #DCE3ED",
                                    borderRadius:
                                        "7px",
                                    background:
                                        "#FFFFFF",
                                    overflow:
                                        "hidden",
                                }}
                            >

                                <span
                                    style={{
                                        padding:
                                            "0 11px",
                                        color:
                                            "#5684D8",
                                        fontSize:
                                            "17px",
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search by title, location or skill..."
                                    value={search}
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        height:
                                            "100%",
                                        border:
                                            "none",
                                        outline:
                                            "none",
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "12px",
                                        padding:
                                            "0 8px 0 0",
                                        background:
                                            "transparent",
                                    }}
                                />

                            </div>

                        </div>

                        {/* DEPARTMENT */}

                        <div>

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        "600",
                                }}
                            >
                                Department
                            </label>

                            <select
                                value={
                                    departmentFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setDepartmentFilter(
                                        e.target.value
                                    )
                                }
                                style={{
                                    width:
                                        "100%",
                                    height:
                                        "42px",
                                    border:
                                        "1px solid #DCE3ED",
                                    borderRadius:
                                        "7px",
                                    background:
                                        "#FFFFFF",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    padding:
                                        "0 9px",
                                    outline:
                                        "none",
                                }}
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
                                                department
                                            }
                                            value={
                                                department
                                            }
                                        >
                                            {department}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* CATEGORY */}

                        <div>

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        "600",
                                }}
                            >
                                Job Category
                            </label>

                            <select
                                value={
                                    categoryFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setCategoryFilter(
                                        e.target.value
                                    )
                                }
                                style={{
                                    width:
                                        "100%",
                                    height:
                                        "42px",
                                    border:
                                        "1px solid #DCE3ED",
                                    borderRadius:
                                        "7px",
                                    background:
                                        "#FFFFFF",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    padding:
                                        "0 9px",
                                    outline:
                                        "none",
                                }}
                            >

                                <option value="">
                                    All Categories
                                </option>

                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            key={
                                                category
                                            }
                                            value={
                                                category
                                            }
                                        >
                                            {category}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* EMPLOYMENT TYPE */}

                        <div>

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        "600",
                                }}
                            >
                                Employment Type
                            </label>

                            <select
                                value={
                                    employmentFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setEmploymentFilter(
                                        e.target.value
                                    )
                                }
                                style={{
                                    width:
                                        "100%",
                                    height:
                                        "42px",
                                    border:
                                        "1px solid #DCE3ED",
                                    borderRadius:
                                        "7px",
                                    background:
                                        "#FFFFFF",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    padding:
                                        "0 9px",
                                    outline:
                                        "none",
                                }}
                            >

                                <option value="">
                                    All Types
                                </option>

                                {employmentTypes.map(
                                    (
                                        type
                                    ) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* EXPERIENCE */}

                        <div>

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        "600",
                                }}
                            >
                                Experience
                            </label>

                            <select
                                value={
                                    experienceFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setExperienceFilter(
                                        e.target.value
                                    )
                                }
                                style={{
                                    width:
                                        "100%",
                                    height:
                                        "42px",
                                    border:
                                        "1px solid #DCE3ED",
                                    borderRadius:
                                        "7px",
                                    background:
                                        "#FFFFFF",
                                    color:
                                        "#52627A",
                                    fontSize:
                                        "12px",
                                    padding:
                                        "0 9px",
                                    outline:
                                        "none",
                                }}
                            >

                                <option value="">
                                    All Experience
                                </option>

                                {experienceLevels.map(
                                    (
                                        level
                                    ) => (
                                        <option
                                            key={
                                                level
                                            }
                                            value={
                                                level
                                            }
                                        >
                                            {level}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* CLEAR FILTERS */}

                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            style={{
                                height: "42px",
                                border:
                                    "1px solid #DCE3ED",
                                background:
                                    "#FFFFFF",
                                color:
                                    "#52627A",
                                borderRadius:
                                    "7px",
                                padding:
                                    "0 14px",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    "600",
                                cursor:
                                    "pointer",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Clear Filters
                        </button>

                    </div>

                </div>

                {/* =================================================
                    JOB LISTINGS HEADER
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "flex-end",
                        justifyContent:
                            "space-between",
                        marginBottom: "16px",
                    }}
                >

                    <div>

                        <span
                            style={{
                                display:
                                    "block",
                                color:
                                    "#2766D9",
                                fontSize:
                                    "11px",
                                fontWeight:
                                    "700",
                                letterSpacing:
                                    "0.8px",
                                marginBottom:
                                    "5px",
                            }}
                        >
                            JOB LISTINGS
                        </span>

                        <h3
                            style={{
                                margin: 0,
                                color:
                                    "#10254A",
                                fontSize:
                                    "20px",
                                fontWeight:
                                    "700",
                            }}
                        >
                            Available Positions
                        </h3>

                    </div>

                    <div
                        style={{
                            color:
                                "#8290A8",
                            fontSize:
                                "12px",
                        }}
                    >
                        Showing{" "}
                        <strong
                            style={{
                                color:
                                    "#243A5E",
                            }}
                        >
                            {currentJobs.length}
                        </strong>{" "}
                        of{" "}
                        <strong
                            style={{
                                color:
                                    "#243A5E",
                            }}
                        >
                            {filteredJobs.length}
                        </strong>{" "}
                        jobs
                    </div>

                </div>

                {/* =================================================
                    NO JOBS
                ================================================= */}

                {currentJobs.length === 0 ? (

                    <div
                        style={{
                            background:
                                "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius:
                                "11px",
                            minHeight:
                                "300px",
                            display:
                                "flex",
                            flexDirection:
                                "column",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            textAlign:
                                "center",
                            boxShadow:
                                "0 3px 12px rgba(15,23,42,0.03)",
                        }}
                    >

                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius:
                                    "12px",
                                background:
                                    "#EEF4FF",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                fontSize:
                                    "22px",
                                marginBottom:
                                    "12px",
                            }}
                        >
                            🔎
                        </div>

                        <h3
                            style={{
                                margin:
                                    "0 0 6px",
                                color:
                                    "#243A5E",
                                fontSize:
                                    "16px",
                            }}
                        >
                            No jobs found
                        </h3>

                        <p
                            style={{
                                margin:
                                    "0 0 16px",
                                color:
                                    "#8290A8",
                                fontSize:
                                    "12px",
                            }}
                        >
                            Try changing your
                            search or filter
                            criteria.
                        </p>

                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            style={{
                                border:
                                    "none",
                                background:
                                    "#2D6EE8",
                                color:
                                    "#FFFFFF",
                                borderRadius:
                                    "7px",
                                padding:
                                    "10px 17px",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    "600",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Clear Filters
                        </button>

                    </div>

                ) : (

                    <>

                        {/* =================================================
                            JOB CARDS
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(3, minmax(0, 1fr))",
                                gap: "17px",
                            }}
                        >

                            {currentJobs.map(
                                (job) => (

                                    <div
                                        key={
                                            job.id
                                        }
                                        style={{
                                            background:
                                                "#FFFFFF",
                                            border:
                                                "1px solid #E4E9F1",
                                            borderRadius:
                                                "11px",
                                            padding:
                                                "20px",
                                            boxShadow:
                                                "0 3px 12px rgba(15,23,42,0.03)",
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            minHeight:
                                                "350px",
                                        }}
                                    >

                                        {/* JOB HEADER */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "13px",
                                                alignItems:
                                                    "flex-start",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width:
                                                        "45px",
                                                    height:
                                                        "45px",
                                                    minWidth:
                                                        "45px",
                                                    borderRadius:
                                                        "10px",
                                                    background:
                                                        "linear-gradient(135deg, #2D6EE8, #4B88F4)",
                                                    color:
                                                        "#FFFFFF",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    fontSize:
                                                        "13px",
                                                    fontWeight:
                                                        "800",
                                                }}
                                            >
                                                SH
                                            </div>

                                            <div
                                                style={{
                                                    minWidth:
                                                        0,
                                                }}
                                            >

                                                <h3
                                                    style={{
                                                        margin:
                                                            "1px 0 6px",
                                                        color:
                                                            "#243A5E",
                                                        fontSize:
                                                            "16px",
                                                        fontWeight:
                                                            "700",
                                                        lineHeight:
                                                            "1.35",
                                                    }}
                                                >
                                                    {
                                                        job.title
                                                    }
                                                </h3>

                                                <p
                                                    style={{
                                                        margin:
                                                            "0",
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {
                                                        job.departmentName ||
                                                        "SmartHire"
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                        {/* JOB DETAILS */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap:
                                                    "8px",
                                                marginTop:
                                                    "17px",
                                                paddingBottom:
                                                    "15px",
                                                borderBottom:
                                                    "1px solid #F0F3F7",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    color:
                                                        "#687995",
                                                    fontSize:
                                                        "12px",
                                                }}
                                            >
                                                📍{" "}
                                                {job.location}
                                            </span>

                                            <span
                                                style={{
                                                    color:
                                                        "#687995",
                                                    fontSize:
                                                        "12px",
                                                }}
                                            >
                                                💼{" "}
                                                {
                                                    job.employmentType
                                                }
                                            </span>

                                            <span
                                                style={{
                                                    color:
                                                        "#687995",
                                                    fontSize:
                                                        "12px",
                                                }}
                                            >
                                                🎓{" "}
                                                {
                                                    job.experienceLevel
                                                }
                                            </span>

                                        </div>

                                        {/* CATEGORY */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "14px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "inline-block",
                                                    background:
                                                        "#EEF4FF",
                                                    color:
                                                        "#2766D9",
                                                    borderRadius:
                                                        "20px",
                                                    padding:
                                                        "6px 10px",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                {
                                                    job.jobCategoryName
                                                }
                                            </span>

                                        </div>

                                        {/* SALARY */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "16px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#8290A8",
                                                    fontSize:
                                                        "10px",
                                                    marginBottom:
                                                        "4px",
                                                }}
                                            >
                                                Salary
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "#16845A",
                                                    fontSize:
                                                        "14px",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                {formatSalary(
                                                    job.minimumSalary,
                                                    job.maximumSalary
                                                )}
                                            </strong>

                                        </div>

                                        {/* SKILLS */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexWrap:
                                                    "wrap",
                                                gap:
                                                    "5px",
                                                marginTop:
                                                    "14px",
                                                minHeight:
                                                    "27px",
                                            }}
                                        >

                                            {(
                                                job.requiredSkills ||
                                                ""
                                            )
                                                .split(",")
                                                .slice(
                                                    0,
                                                    5
                                                )
                                                .map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => {

                                                        const cleanSkill =
                                                            skill.trim();

                                                        if (
                                                            !cleanSkill
                                                        ) {
                                                            return null;
                                                        }

                                                        return (
                                                            <span
                                                                key={
                                                                    index
                                                                }
                                                                style={{
                                                                    background:
                                                                        "#F5F7FB",
                                                                    border:
                                                                        "1px solid #E6EAF0",
                                                                    color:
                                                                        "#687995",
                                                                    borderRadius:
                                                                        "5px",
                                                                    padding:
                                                                        "5px 8px",
                                                                    fontSize:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {
                                                                    cleanSkill
                                                                }
                                                            </span>
                                                        );
                                                    }
                                                )}

                                        </div>

                                        {/* CARD FOOTER */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "auto",
                                                paddingTop:
                                                    "16px",
                                                borderTop:
                                                    "1px solid #F0F3F7",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "flex-end",
                                                justifyContent:
                                                    "space-between",
                                                gap:
                                                    "10px",
                                            }}
                                        >

                                            <div>

                                                <small
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "10px",
                                                        marginBottom:
                                                            "4px",
                                                    }}
                                                >
                                                    Application
                                                    deadline
                                                </small>

                                                <strong
                                                    style={{
                                                        color:
                                                            "#52627A",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {formatDate(
                                                        job.applicationDeadline
                                                    )}
                                                </strong>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewJob(
                                                        job.id
                                                    )
                                                }
                                                style={{
                                                    border:
                                                        "none",
                                                    background:
                                                        "#2D6EE8",
                                                    color:
                                                        "#FFFFFF",
                                                    borderRadius:
                                                        "7px",
                                                    padding:
                                                        "10px 14px",
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        "600",
                                                    cursor:
                                                        "pointer",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                View Details
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                        {/* =================================================
                            PAGINATION
                            SAME STYLE AS ADMIN / RECRUITER
                        ================================================= */}

                        {filteredJobs.length > 0 && (

                            <div
                                style={{
                                    marginTop:
                                        "20px",

                                    padding:
                                        "16px 20px",

                                    background:
                                        "#FFFFFF",

                                    border:
                                        "1px solid #E2E8F0",

                                    borderRadius:
                                        "0 0 14px 14px",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",
                                }}
                            >

                                {/* LEFT SIDE */}

                                <div
                                    style={{
                                        color:
                                            "#64748B",

                                        fontSize:
                                            "12px",

                                        fontWeight:
                                            "400",
                                    }}
                                >

                                    Showing{" "}

                                    <strong
                                        style={{
                                            color:
                                                "#334155",

                                            fontWeight:
                                                "600",
                                        }}
                                    >
                                        {
                                            currentJobs.length
                                        }
                                    </strong>

                                    {" "}of{" "}

                                    <strong
                                        style={{
                                            color:
                                                "#334155",

                                            fontWeight:
                                                "600",
                                        }}
                                    >
                                        {
                                            filteredJobs.length
                                        }
                                    </strong>

                                    {" "}jobs

                                </div>


                                {/* RIGHT SIDE */}

                                <div
                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap:
                                            "12px",
                                    }}
                                >

                                    {/* PREVIOUS */}

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        onClick={
                                            handlePreviousPage
                                        }
                                        style={{
                                            height:
                                                "35px",

                                            padding:
                                                "0 13px",

                                            border:
                                                "1px solid #E2E8F0",

                                            borderRadius:
                                                "6px",

                                            background:
                                                "#FFFFFF",

                                            color:
                                                currentPage ===
                                                    1
                                                    ? "#94A3B8"
                                                    : "#64748B",

                                            fontSize:
                                                "12px",

                                            fontWeight:
                                                "400",

                                            cursor:
                                                currentPage ===
                                                    1
                                                    ? "not-allowed"
                                                    : "pointer",

                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        ← Previous
                                    </button>


                                    {/* PAGE TEXT */}

                                    <div
                                        style={{
                                            color:
                                                "#64748B",

                                            fontSize:
                                                "12px",

                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >

                                        Page{" "}

                                        <strong
                                            style={{
                                                color:
                                                    "#334155",

                                                fontWeight:
                                                    "500",
                                            }}
                                        >
                                            {
                                                currentPage
                                            }
                                        </strong>

                                        {" "}of{" "}

                                        <strong
                                            style={{
                                                color:
                                                    "#334155",

                                                fontWeight:
                                                    "500",
                                            }}
                                        >
                                            {
                                                totalPages
                                            }
                                        </strong>

                                    </div>


                                    {/* NEXT */}

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={
                                            handleNextPage
                                        }
                                        style={{
                                            height:
                                                "35px",

                                            padding:
                                                "0 15px",

                                            border:
                                                "1px solid #D9E2EC",

                                            borderRadius:
                                                "6px",

                                            background:
                                                "#FFFFFF",

                                            color:
                                                currentPage ===
                                                    totalPages
                                                    ? "#94A3B8"
                                                    : "#334155",

                                            fontSize:
                                                "12px",

                                            fontWeight:
                                                "500",

                                            cursor:
                                                currentPage ===
                                                    totalPages
                                                    ? "not-allowed"
                                                    : "pointer",

                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        Next →
                                    </button>

                                </div>

                            </div>

                        )}

                    </>

                )}

            </div>

        </CandidateLayout>
    );
};

export default CandidateJobs;