import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

const CandidateApplications = () => {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [stageFilter, setStageFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 6;


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    useEffect(() => {
        loadApplications();
    }, []);


    const loadApplications = async () => {

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
                await api.get(
                    "/CandidateApplication"
                );


            setApplications(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        }
        catch (err) {

            console.error(
                "Load applications error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load your applications."
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =====================================================
    // FORMAT SALARY
    // =====================================================

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


    // =====================================================
    // FORMAT DATE
    // =====================================================

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


    // =====================================================
    // STAGE STYLE
    // =====================================================

    const getStageStyle = (stage) => {

        switch (stage) {

            case "Applied":

                return {
                    background: "#EEF4FF",
                    color: "#2D6EE8",
                    border: "#C9DBFA",
                };


            case "Screening":

                return {
                    background: "#FFF8E7",
                    color: "#B7791F",
                    border: "#F4D89A",
                };


            case "Shortlisted":

                return {
                    background: "#F3EEFF",
                    color: "#7C4DCC",
                    border: "#DCCBF7",
                };


            case "Assessment":

                return {
                    background: "#EEF9F7",
                    color: "#168A78",
                    border: "#BCE4DC",
                };


            case "Interview":

                return {
                    background: "#FFF1F2",
                    color: "#C24156",
                    border: "#F4C7CF",
                };


            case "Selected":

                return {
                    background: "#ECFDF3",
                    color: "#16845A",
                    border: "#B7E4C7",
                };


            case "Offer":

                return {
                    background: "#F0FDF4",
                    color: "#15803D",
                    border: "#BBE7C6",
                };


            case "Hired":

                return {
                    background: "#E8F8EF",
                    color: "#087443",
                    border: "#A9DFC1",
                };


            default:

                return {
                    background: "#F4F6F8",
                    color: "#64748B",
                    border: "#DDE3EA",
                };
        }
    };


    // =====================================================
    // FILTER APPLICATIONS
    // =====================================================

    const filteredApplications =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            return applications.filter(
                (application) => {

                    const matchesSearch =
                        !search ||
                        application.jobTitle
                            ?.toLowerCase()
                            .includes(search) ||
                        application.departmentName
                            ?.toLowerCase()
                            .includes(search) ||
                        application.jobCategoryName
                            ?.toLowerCase()
                            .includes(search) ||
                        application.location
                            ?.toLowerCase()
                            .includes(search);


                    const matchesStage =
                        stageFilter === "All" ||
                        application.currentStage ===
                        stageFilter;


                    return (
                        matchesSearch &&
                        matchesStage
                    );
                }
            );

        }, [
            applications,
            searchTerm,
            stageFilter,
        ]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredApplications.length /
                itemsPerPage
            )
        );


    const paginatedApplications =
        filteredApplications.slice(
            (currentPage - 1) *
            itemsPerPage,

            currentPage *
            itemsPerPage
        );


    useEffect(() => {

        setCurrentPage(1);

    }, [
        searchTerm,
        stageFilter,
    ]);


    // =====================================================
    // PAGE CHANGE
    // =====================================================

    const goToPreviousPage = () => {

        setCurrentPage(
            (previousPage) =>
                Math.max(
                    1,
                    previousPage - 1
                )
        );
    };


    const goToNextPage = () => {

        setCurrentPage(
            (previousPage) =>
                Math.min(
                    totalPages,
                    previousPage + 1
                )
        );
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <CandidateLayout
                activePage="applications"
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
                            marginBottom: "14px",
                        }}
                    />

                    <p
                        style={{
                            margin: 0,
                            fontSize: "14px",
                        }}
                    >
                        Loading your applications...
                    </p>

                </div>
            </CandidateLayout>
        );
    }


    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <CandidateLayout
            activePage="applications"
        >

            <div
                style={{
                    maxWidth: "1180px",
                    margin: "0 auto",
                }}
            >

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    style={{
                        marginBottom: "22px",
                    }}
                >

                    <span
                        style={{
                            display: "block",
                            color: "#2766D9",
                            fontSize: "11px",
                            fontWeight: "700",
                            letterSpacing: "0.9px",
                            marginBottom: "7px",
                        }}
                    >
                        APPLICATION TRACKING
                    </span>

                    <h2
                        style={{
                            margin: 0,
                            color: "#10254A",
                            fontSize: "28px",
                            fontWeight: "700",
                        }}
                    >
                        My Applications
                    </h2>

                    <p
                        style={{
                            margin:
                                "8px 0 0",
                            color: "#687995",
                            fontSize: "14px",
                        }}
                    >
                        Track the jobs you have
                        applied for and monitor
                        your recruitment progress.
                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            marginBottom: "18px",
                            padding: "13px 16px",
                            background: "#FDECEC",
                            border:
                                "1px solid #F5CACA",
                            borderRadius: "8px",
                            color: "#C03939",
                            fontSize: "12px",
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3, 1fr)",
                        gap: "14px",
                        marginBottom: "20px",
                    }}
                >

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "10px",
                            padding: "17px 18px",
                        }}
                    >

                        <span
                            style={{
                                display: "block",
                                color: "#8290A8",
                                fontSize: "10px",
                                marginBottom: "7px",
                            }}
                        >
                            TOTAL APPLICATIONS
                        </span>

                        <strong
                            style={{
                                color: "#10254A",
                                fontSize: "23px",
                            }}
                        >
                            {applications.length}
                        </strong>

                    </div>


                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "10px",
                            padding: "17px 18px",
                        }}
                    >

                        <span
                            style={{
                                display: "block",
                                color: "#8290A8",
                                fontSize: "10px",
                                marginBottom: "7px",
                            }}
                        >
                            ACTIVE APPLICATIONS
                        </span>

                        <strong
                            style={{
                                color: "#2D6EE8",
                                fontSize: "23px",
                            }}
                        >
                            {
                                applications.filter(
                                    (application) =>
                                        ![
                                            "Rejected",
                                            "Withdrawn",
                                            "Hired",
                                        ].includes(
                                            application.currentStage
                                        )
                                ).length
                            }
                        </strong>

                    </div>


                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "10px",
                            padding: "17px 18px",
                        }}
                    >

                        <span
                            style={{
                                display: "block",
                                color: "#8290A8",
                                fontSize: "10px",
                                marginBottom: "7px",
                            }}
                        >
                            INTERVIEW STAGE
                        </span>

                        <strong
                            style={{
                                color: "#C24156",
                                fontSize: "23px",
                            }}
                        >
                            {
                                applications.filter(
                                    (application) =>
                                        application.currentStage ===
                                        "Interview"
                                ).length
                            }
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    FILTER BAR
                ================================================= */}

                <div
                    style={{
                        background: "#FFFFFF",
                        border:
                            "1px solid #E4E9F1",
                        borderRadius: "10px",
                        padding: "15px",
                        marginBottom: "18px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >

                    {/* SEARCH */}

                    <div
                        style={{
                            position: "relative",
                            flex: 1,
                        }}
                    >

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search by job title, department, category or location..."
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                height: "40px",
                                border:
                                    "1px solid #DCE3ED",
                                borderRadius: "7px",
                                padding:
                                    "0 13px",
                                outline: "none",
                                color: "#243A5E",
                                fontSize: "12px",
                            }}
                        />

                    </div>


                    {/* STAGE FILTER */}

                    <select
                        value={stageFilter}
                        onChange={(event) =>
                            setStageFilter(
                                event.target.value
                            )
                        }
                        style={{
                            height: "40px",
                            minWidth: "165px",
                            border:
                                "1px solid #DCE3ED",
                            borderRadius: "7px",
                            padding:
                                "0 11px",
                            background: "#FFFFFF",
                            color: "#52627A",
                            fontSize: "12px",
                            outline: "none",
                            cursor: "pointer",
                        }}
                    >

                        <option value="All">
                            All Stages
                        </option>

                        <option value="Applied">
                            Applied
                        </option>

                        <option value="Screening">
                            Screening
                        </option>

                        <option value="Shortlisted">
                            Shortlisted
                        </option>

                        <option value="Assessment">
                            Assessment
                        </option>

                        <option value="Interview">
                            Interview
                        </option>

                        <option value="Selected">
                            Selected
                        </option>

                        <option value="Offer">
                            Offer
                        </option>

                        <option value="Hired">
                            Hired
                        </option>

                    </select>

                </div>


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {filteredApplications.length === 0 && (

                    <div
                        style={{
                            background: "#FFFFFF",
                            border:
                                "1px solid #E4E9F1",
                            borderRadius: "11px",
                            padding: "65px 30px",
                            textAlign: "center",
                        }}
                    >

                        <div
                            style={{
                                width: "58px",
                                height: "58px",
                                margin:
                                    "0 auto 16px",
                                borderRadius: "50%",
                                background: "#EEF4FF",
                                color: "#2D6EE8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "23px",
                                fontWeight: "700",
                            }}
                        >
                            ♡
                        </div>

                        <h3
                            style={{
                                margin:
                                    "0 0 8px",
                                color: "#243A5E",
                                fontSize: "17px",
                                fontWeight: "700",
                            }}
                        >
                            {applications.length === 0
                                ? "No applications yet"
                                : "No matching applications"}
                        </h3>

                        <p
                            style={{
                                margin:
                                    "0 auto 18px",
                                maxWidth: "440px",
                                color: "#8290A8",
                                fontSize: "12px",
                                lineHeight: "1.6",
                            }}
                        >
                            {applications.length === 0
                                ? "You haven't applied for any jobs yet. Explore available opportunities and submit your first application."
                                : "Try changing your search term or stage filter to find your applications."}
                        </p>

                        {applications.length === 0 && (

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/candidate/jobs"
                                    )
                                }
                                style={{
                                    border: "none",
                                    background: "#2D6EE8",
                                    color: "#FFFFFF",
                                    borderRadius: "7px",
                                    padding:
                                        "10px 17px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Browse Jobs
                            </button>

                        )}

                    </div>

                )}


                {/* =================================================
                    APPLICATION CARDS
                ================================================= */}

                {paginatedApplications.length > 0 && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, 1fr)",
                            gap: "16px",
                        }}
                    >

                        {paginatedApplications.map(
                            (application) => {

                                const stageStyle =
                                    getStageStyle(
                                        application.currentStage
                                    );


                                return (

                                    <div
                                        key={
                                            application.applicationId
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
                                        }}
                                    >

                                        {/* JOB HEADER */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "flex-start",
                                                gap: "13px",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: "45px",
                                                    height: "45px",
                                                    minWidth: "45px",
                                                    borderRadius:
                                                        "9px",
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
                                                    flex: 1,
                                                    minWidth: 0,
                                                }}
                                            >

                                                <h3
                                                    style={{
                                                        margin:
                                                            "0 0 5px",
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
                                                        application.jobTitle
                                                    }
                                                </h3>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {
                                                        application.departmentName
                                                    }

                                                    {" • "}

                                                    {
                                                        application.jobCategoryName
                                                    }
                                                </p>

                                            </div>


                                            {/* STAGE */}

                                            <span
                                                style={{
                                                    background:
                                                        stageStyle.background,
                                                    color:
                                                        stageStyle.color,
                                                    border:
                                                        `1px solid ${stageStyle.border}`,
                                                    borderRadius:
                                                        "20px",
                                                    padding:
                                                        "5px 9px",
                                                    fontSize:
                                                        "9px",
                                                    fontWeight:
                                                        "700",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {
                                                    application.currentStage
                                                }
                                            </span>

                                        </div>


                                        {/* JOB INFORMATION */}

                                        <div
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "repeat(2, 1fr)",
                                                gap:
                                                    "12px",
                                                marginTop:
                                                    "19px",
                                                paddingTop:
                                                    "17px",
                                                borderTop:
                                                    "1px solid #F0F3F7",
                                            }}
                                        >

                                            <div>

                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "9px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    LOCATION
                                                </span>

                                                <strong
                                                    style={{
                                                        color:
                                                            "#52627A",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {
                                                        application.location
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "9px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    EMPLOYMENT
                                                </span>

                                                <strong
                                                    style={{
                                                        color:
                                                            "#52627A",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {
                                                        application.employmentType
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "9px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    SALARY
                                                </span>

                                                <strong
                                                    style={{
                                                        color:
                                                            "#16845A",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {formatSalary(
                                                        application.minimumSalary,
                                                        application.maximumSalary
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "9px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    APPLIED ON
                                                </span>

                                                <strong
                                                    style={{
                                                        color:
                                                            "#52627A",
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {formatDate(
                                                        application.appliedAt
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* FOOTER */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "18px",
                                                paddingTop:
                                                    "14px",
                                                borderTop:
                                                    "1px solid #F0F3F7",
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                            }}
                                        >

                                            <div>

                                                <span
                                                    style={{
                                                        color:
                                                            "#8290A8",
                                                        fontSize:
                                                            "9px",
                                                    }}
                                                >
                                                    Application #
                                                </span>

                                                <strong
                                                    style={{
                                                        marginLeft:
                                                            "5px",
                                                        color:
                                                            "#52627A",
                                                        fontSize:
                                                            "10px",
                                                    }}
                                                >
                                                    {
                                                        application.applicationId
                                                    }
                                                </strong>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/candidate/jobs/${application.jobId}`
                                                    )
                                                }
                                                style={{
                                                    border:
                                                        "1px solid #D8E2F0",
                                                    background:
                                                        "#FFFFFF",
                                                    color:
                                                        "#2D6EE8",
                                                    borderRadius:
                                                        "6px",
                                                    padding:
                                                        "7px 11px",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        "600",
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >
                                                View Job Details →
                                            </button>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {filteredApplications.length > 0 && (

                    <div
                        style={{
                            marginTop: "20px",
                            padding:
                                "14px 2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            color: "#687995",
                            fontSize: "11px",
                        }}
                    >

                        <span>
                            Showing{" "}
                            {
                                Math.min(
                                    filteredApplications.length,
                                    (currentPage - 1) *
                                    itemsPerPage +
                                    paginatedApplications.length
                                )
                            }{" "}
                            of{" "}
                            {filteredApplications.length}{" "}
                            applications
                        </span>


                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "8px",
                            }}
                        >

                            <button
                                type="button"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    currentPage === 1
                                }
                                style={{
                                    border:
                                        "1px solid #DCE3ED",
                                    background:
                                        "#FFFFFF",
                                    color:
                                        currentPage ===
                                            1
                                            ? "#B7C1CF"
                                            : "#52627A",
                                    borderRadius:
                                        "6px",
                                    padding:
                                        "7px 11px",
                                    fontSize:
                                        "10px",
                                    cursor:
                                        currentPage ===
                                            1
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                ← Previous
                            </button>


                            <span
                                style={{
                                    padding:
                                        "0 5px",
                                    color:
                                        "#687995",
                                }}
                            >
                                Page{" "}
                                {currentPage}{" "}
                                of{" "}
                                {totalPages}
                            </span>


                            <button
                                type="button"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                                style={{
                                    border:
                                        "1px solid #DCE3ED",
                                    background:
                                        "#FFFFFF",
                                    color:
                                        currentPage ===
                                            totalPages
                                            ? "#B7C1CF"
                                            : "#52627A",
                                    borderRadius:
                                        "6px",
                                    padding:
                                        "7px 11px",
                                    fontSize:
                                        "10px",
                                    cursor:
                                        currentPage ===
                                            totalPages
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                Next →
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </CandidateLayout>
    );
};

export default CandidateApplications;