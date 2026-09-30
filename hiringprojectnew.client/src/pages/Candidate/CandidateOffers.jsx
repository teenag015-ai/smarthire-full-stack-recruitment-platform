import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

const CandidateOffers = () => {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedOffer, setSelectedOffer] =
        useState(null);

    const [showDetailsModal, setShowDetailsModal] =
        useState(false);

    const [showResponseModal, setShowResponseModal] =
        useState(false);

    const [responseStatus, setResponseStatus] =
        useState("");

    const [responding, setResponding] =
        useState(false);

    const [responseError, setResponseError] =
        useState("");

    // ============================================================
    // LOAD OFFERS
    // ============================================================

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/CandidateOffer");

            setOffers(response.data || []);
        } catch (err) {
            console.error(
                "Failed to load candidate offers:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load your offers. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // STATISTICS
    // ============================================================

    const statistics = useMemo(() => {
        return {
            total: offers.length,

            pending: offers.filter(
                (offer) =>
                    offer.status?.toLowerCase() ===
                    "sent"
            ).length,

            accepted: offers.filter(
                (offer) =>
                    offer.status?.toLowerCase() ===
                    "accepted"
            ).length,

            rejected: offers.filter(
                (offer) =>
                    offer.status?.toLowerCase() ===
                    "rejected"
            ).length,
        };
    }, [offers]);

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ============================================================
    // FORMAT SALARY
    // ============================================================

    const formatSalary = (salary) => {
        if (
            salary === null ||
            salary === undefined
        ) {
            return "Not specified";
        }

        return `₹${Number(salary).toLocaleString(
            "en-IN"
        )}`;
    };

    // ============================================================
    // STATUS
    // ============================================================

    const getStatusClass = (status) => {
        switch (
        status?.toLowerCase()
        ) {
            case "sent":
                return "status-sent";

            case "accepted":
                return "status-accepted";

            case "rejected":
                return "status-rejected";

            case "expired":
                return "status-expired";

            case "withdrawn":
                return "status-withdrawn";

            default:
                return "status-default";
        }
    };

    // ============================================================
    // VIEW OFFER
    // ============================================================

    const handleViewOffer = async (offer) => {
        try {
            const response =
                await api.get(
                    `/CandidateOffer/${offer.id}`
                );

            setSelectedOffer(response.data);

            setShowDetailsModal(true);
        } catch (err) {
            console.error(
                "Failed to load offer details:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load offer details."
            );
        }
    };

    // ============================================================
    // OPEN RESPONSE MODAL
    // ============================================================

    const handleOpenResponse = (
        offer,
        status
    ) => {
        setSelectedOffer(offer);
        setResponseStatus(status);
        setResponseError("");
        setShowResponseModal(true);
    };

    // ============================================================
    // ACCEPT / REJECT OFFER
    // ============================================================

    const handleRespond = async () => {
        if (!selectedOffer) {
            return;
        }

        try {
            setResponding(true);
            setResponseError("");

            const response =
                await api.post(
                    `/CandidateOffer/${selectedOffer.id}/respond`,
                    {
                        status: responseStatus,
                    }
                );

            const updatedOffer =
                response.data;

            setOffers((currentOffers) =>
                currentOffers.map(
                    (offer) =>
                        offer.id ===
                            updatedOffer.id
                            ? updatedOffer
                            : offer
                )
            );

            setSelectedOffer(
                updatedOffer
            );

            setShowResponseModal(false);
            setResponseStatus("");

        } catch (err) {
            console.error(
                "Failed to respond to offer:",
                err
            );

            setResponseError(
                err.response?.data?.message ||
                "Unable to respond to this offer. Please try again."
            );
        } finally {
            setResponding(false);
        }
    };

    // ============================================================
    // CLOSE MODALS
    // ============================================================

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedOffer(null);
    };

    const closeResponseModal = () => {
        if (responding) {
            return;
        }

        setShowResponseModal(false);
        setSelectedOffer(null);
        setResponseStatus("");
        setResponseError("");
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <CandidateLayout activePage="offers">
                <div style={styles.loadingPage}>
                    <div style={styles.spinner}></div>

                    <p style={styles.loadingText}>
                        Loading your offers...
                    </p>
                </div>
            </CandidateLayout>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <CandidateLayout activePage="offers">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div style={styles.pageHeader}>

                <div>
                    <div style={styles.eyebrow}>
                        CAREER OPPORTUNITIES
                    </div>

                    <h2 style={styles.pageTitle}>
                        My Offers
                    </h2>

                    <p style={styles.pageSubtitle}>
                        Review and respond to job offers
                        received from recruiters.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadOffers}
                    style={styles.refreshButton}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div style={styles.errorBox}>
                    <span style={styles.errorIcon}>
                        !
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={loadOffers}
                        style={styles.retryButton}
                    >
                        Retry
                    </button>
                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div style={styles.statsGrid}>

                <StatCard
                    title="Total Offers"
                    value={statistics.total}
                    icon="▣"
                />

                <StatCard
                    title="Pending Response"
                    value={statistics.pending}
                    icon="◷"
                />

                <StatCard
                    title="Accepted"
                    value={statistics.accepted}
                    icon="✓"
                />

                <StatCard
                    title="Rejected"
                    value={statistics.rejected}
                    icon="×"
                />

            </div>


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {offers.length === 0 ? (

                <div style={styles.emptyCard}>

                    <div style={styles.emptyIcon}>
                        ▣
                    </div>

                    <h3 style={styles.emptyTitle}>
                        No Offers Yet
                    </h3>

                    <p style={styles.emptyText}>
                        You don't have any job offers
                        at the moment. Offers sent by
                        recruiters will appear here.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/candidate/jobs"
                            )
                        }
                        style={styles.browseButton}
                    >
                        Browse Jobs
                    </button>

                </div>

            ) : (

                /* ==================================================
                   OFFERS
                ================================================== */

                <div style={styles.offerGrid}>

                    {offers.map((offer) => {

                        const status =
                            offer.status?.toLowerCase();

                        const canRespond =
                            status === "sent";

                        return (
                            <div
                                key={offer.id}
                                style={styles.offerCard}
                            >

                                {/* CARD HEADER */}

                                <div
                                    style={
                                        styles.offerCardHeader
                                    }
                                >

                                    <div
                                        style={
                                            styles.companyIcon
                                        }
                                    >
                                        S
                                    </div>

                                    <div
                                        style={
                                            styles.offerHeaderText
                                        }
                                    >

                                        <h3
                                            style={
                                                styles.jobTitle
                                            }
                                        >
                                            {offer.jobTitle ||
                                                "Job Offer"}
                                        </h3>

                                        <p
                                            style={
                                                styles.designation
                                            }
                                        >
                                            {offer.designation ||
                                                "Position not specified"}
                                        </p>

                                    </div>

                                    <span
                                        className={getStatusClass(
                                            offer.status
                                        )}
                                        style={
                                            styles.statusBadge
                                        }
                                    >
                                        {offer.status}
                                    </span>

                                </div>


                                {/* OFFER INFORMATION */}

                                <div
                                    style={
                                        styles.infoGrid
                                    }
                                >

                                    <InfoItem
                                        label="Offered Salary"
                                        value={formatSalary(
                                            offer.offeredSalary
                                        )}
                                    />

                                    <InfoItem
                                        label="Joining Date"
                                        value={formatDate(
                                            offer.joiningDate
                                        )}
                                    />

                                    <InfoItem
                                        label="Offer Expires"
                                        value={formatDate(
                                            offer.offerExpiryDate
                                        )}
                                    />

                                    <InfoItem
                                        label="Offer Sent"
                                        value={formatDate(
                                            offer.sentAt
                                        )}
                                    />

                                </div>


                                {/* ACTIONS */}

                                <div
                                    style={
                                        styles.cardActions
                                    }
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewOffer(
                                                offer
                                            )
                                        }
                                        style={
                                            styles.viewButton
                                        }
                                    >
                                        View Offer
                                    </button>

                                    {canRespond && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenResponse(
                                                        offer,
                                                        "Rejected"
                                                    )
                                                }
                                                style={
                                                    styles.rejectButton
                                                }
                                            >
                                                Reject
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenResponse(
                                                        offer,
                                                        "Accepted"
                                                    )
                                                }
                                                style={
                                                    styles.acceptButton
                                                }
                                            >
                                                Accept
                                            </button>
                                        </>
                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}


            {/* ==================================================
                OFFER DETAILS MODAL
            ================================================== */}

            {showDetailsModal &&
                selectedOffer && (
                    <div
                        style={
                            styles.modalOverlay
                        }
                        onClick={
                            closeDetailsModal
                        }
                    >

                        <div
                            style={
                                styles.modalContainer
                            }
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div
                                style={
                                    styles.modalHeader
                                }
                            >

                                <div>
                                    <div
                                        style={
                                            styles.modalEyebrow
                                        }
                                    >
                                        OFFER DETAILS
                                    </div>

                                    <h3
                                        style={
                                            styles.modalTitle
                                        }
                                    >
                                        {selectedOffer.jobTitle ||
                                            "Job Offer"}
                                    </h3>

                                    <p
                                        style={
                                            styles.modalSubtitle
                                        }
                                    >
                                        {selectedOffer.designation}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDetailsModal
                                    }
                                    style={
                                        styles.closeButton
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div
                                style={
                                    styles.modalBody
                                }
                            >

                                <div
                                    style={
                                        styles.detailGrid
                                    }
                                >

                                    <DetailItem
                                        label="Designation"
                                        value={
                                            selectedOffer.designation
                                        }
                                    />

                                    <DetailItem
                                        label="Offered Salary"
                                        value={formatSalary(
                                            selectedOffer.offeredSalary
                                        )}
                                    />

                                    <DetailItem
                                        label="Joining Date"
                                        value={formatDate(
                                            selectedOffer.joiningDate
                                        )}
                                    />

                                    <DetailItem
                                        label="Offer Expiry"
                                        value={formatDate(
                                            selectedOffer.offerExpiryDate
                                        )}
                                    />

                                    <DetailItem
                                        label="Offer Sent"
                                        value={formatDate(
                                            selectedOffer.sentAt
                                        )}
                                    />

                                    <DetailItem
                                        label="Response Date"
                                        value={formatDate(
                                            selectedOffer.respondedAt
                                        )}
                                    />

                                </div>


                                {/* BENEFITS */}

                                <div
                                    style={
                                        styles.detailSection
                                    }
                                >

                                    <h4
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        Benefits
                                    </h4>

                                    <p
                                        style={
                                            styles.sectionText
                                        }
                                    >
                                        {selectedOffer.benefits ||
                                            "No benefits information provided."}
                                    </p>

                                </div>


                                {/* NOTES */}

                                <div
                                    style={
                                        styles.detailSection
                                    }
                                >

                                    <h4
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        Additional Notes
                                    </h4>

                                    <p
                                        style={
                                            styles.sectionText
                                        }
                                    >
                                        {selectedOffer.notes ||
                                            "No additional notes provided."}
                                    </p>

                                </div>

                            </div>


                            <div
                                style={
                                    styles.modalFooter
                                }
                            >

                                {selectedOffer.status?.toLowerCase() ===
                                    "sent" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenResponse(
                                                        selectedOffer,
                                                        "Rejected"
                                                    )
                                                }
                                                style={
                                                    styles.rejectButton
                                                }
                                            >
                                                Reject Offer
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenResponse(
                                                        selectedOffer,
                                                        "Accepted"
                                                    )
                                                }
                                                style={
                                                    styles.acceptButton
                                                }
                                            >
                                                Accept Offer
                                            </button>
                                        </>
                                    )}

                                {selectedOffer.status?.toLowerCase() !==
                                    "sent" && (
                                        <button
                                            type="button"
                                            onClick={
                                                closeDetailsModal
                                            }
                                            style={
                                                styles.closeFooterButton
                                            }
                                        >
                                            Close
                                        </button>
                                    )}

                            </div>

                        </div>

                    </div>
                )}


            {/* ==================================================
                ACCEPT / REJECT CONFIRMATION
            ================================================== */}

            {showResponseModal &&
                selectedOffer && (
                    <div
                        style={
                            styles.modalOverlay
                        }
                    >

                        <div
                            style={
                                styles.confirmModal
                            }
                        >

                            <div
                                style={
                                    styles.confirmIcon
                                }
                            >
                                {responseStatus ===
                                    "Accepted"
                                    ? "✓"
                                    : "!"}
                            </div>

                            <h3
                                style={
                                    styles.confirmTitle
                                }
                            >
                                {responseStatus ===
                                    "Accepted"
                                    ? "Accept Offer?"
                                    : "Reject Offer?"}
                            </h3>

                            <p
                                style={
                                    styles.confirmText
                                }
                            >
                                {responseStatus ===
                                    "Accepted"
                                    ? `Are you sure you want to accept the offer for ${selectedOffer.designation || "this position"}?`
                                    : `Are you sure you want to reject the offer for ${selectedOffer.designation || "this position"}?`}
                            </p>

                            {responseError && (
                                <div
                                    style={
                                        styles.responseError
                                    }
                                >
                                    {responseError}
                                </div>
                            )}

                            <div
                                style={
                                    styles.confirmActions
                                }
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeResponseModal
                                    }
                                    disabled={
                                        responding
                                    }
                                    style={
                                        styles.cancelButton
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleRespond
                                    }
                                    disabled={
                                        responding
                                    }
                                    style={
                                        responseStatus ===
                                            "Accepted"
                                            ? styles.acceptButton
                                            : styles.rejectButton
                                    }
                                >
                                    {responding
                                        ? "Processing..."
                                        : responseStatus ===
                                            "Accepted"
                                            ? "Yes, Accept"
                                            : "Yes, Reject"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </CandidateLayout>
    );
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    icon,
}) => {
    return (
        <div style={styles.statCard}>

            <div style={styles.statIcon}>
                {icon}
            </div>

            <div>
                <p style={styles.statLabel}>
                    {title}
                </p>

                <h3 style={styles.statValue}>
                    {value}
                </h3>
            </div>

        </div>
    );
};


// ============================================================
// INFO ITEM
// ============================================================

const InfoItem = ({
    label,
    value,
}) => {
    return (
        <div style={styles.infoItem}>

            <span style={styles.infoLabel}>
                {label}
            </span>

            <strong style={styles.infoValue}>
                {value}
            </strong>

        </div>
    );
};


// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
    label,
    value,
}) => {
    return (
        <div style={styles.detailItem}>

            <span style={styles.detailLabel}>
                {label}
            </span>

            <strong style={styles.detailValue}>
                {value || "—"}
            </strong>

        </div>
    );
};


// ============================================================
// STYLES
// ============================================================

const styles = {

    // ========================================================
    // PAGE HEADER
    // ========================================================

    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "28px",
    },

    eyebrow: {
        color: "#2766D9",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1px",
        marginBottom: "7px",
    },

    pageTitle: {
        margin: 0,
        color: "#10254A",
        fontSize: "28px",
        fontWeight: "750",
        letterSpacing: "-0.4px",
    },

    pageSubtitle: {
        margin: "7px 0 0",
        color: "#71809A",
        fontSize: "14px",
        lineHeight: "1.6",
    },

    refreshButton: {
        border: "1px solid #D8E2F1",
        background: "#FFFFFF",
        color: "#245FC7",
        padding: "10px 16px",
        borderRadius: "9px",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
    },


    // ========================================================
    // ERROR
    // ========================================================

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#FFF4F4",
        border: "1px solid #F3CACA",
        color: "#B42318",
        padding: "13px 16px",
        borderRadius: "10px",
        marginBottom: "20px",
        fontSize: "13px",
    },

    errorIcon: {
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "#D92D20",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        flexShrink: 0,
    },

    retryButton: {
        marginLeft: "auto",
        border: "none",
        background: "transparent",
        color: "#B42318",
        fontWeight: "700",
        cursor: "pointer",
    },


    // ========================================================
    // STATISTICS
    // ========================================================

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "16px",
        marginBottom: "25px",
    },

    statCard: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F1",
        borderRadius: "12px",
        padding: "19px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow:
            "0 4px 16px rgba(16,37,74,0.035)",
    },

    statIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        background: "#EAF2FF",
        color: "#2766D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "800",
        flexShrink: 0,
    },

    statLabel: {
        margin: 0,
        color: "#7B89A2",
        fontSize: "11px",
        fontWeight: "600",
    },

    statValue: {
        margin: "4px 0 0",
        color: "#10254A",
        fontSize: "22px",
        fontWeight: "750",
    },


    // ========================================================
    // OFFER GRID
    // ========================================================

    offerGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "20px",
    },

    offerCard: {
        background: "#FFFFFF",
        border: "1px solid #E1E7F0",
        borderRadius: "14px",
        padding: "22px",
        boxShadow:
            "0 5px 20px rgba(16,37,74,0.045)",
        transition:
            "transform 0.2s ease, box-shadow 0.2s ease",
    },

    offerCardHeader: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        paddingBottom: "18px",
        borderBottom: "1px solid #EEF1F6",
    },

    companyIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #2F72F3, #4F8CFF)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        fontWeight: "800",
        flexShrink: 0,
    },

    offerHeaderText: {
        minWidth: 0,
        flex: 1,
    },

    jobTitle: {
        margin: 0,
        color: "#142B52",
        fontSize: "16px",
        fontWeight: "750",
        lineHeight: "1.4",
    },

    designation: {
        margin: "4px 0 0",
        color: "#75839B",
        fontSize: "12px",
    },

    statusBadge: {
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "800",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
    },


    // ========================================================
    // INFORMATION
    // ========================================================

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "16px",
        padding: "19px 0",
    },

    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    infoLabel: {
        color: "#8A97AC",
        fontSize: "10px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
    },

    infoValue: {
        color: "#263C60",
        fontSize: "13px",
        fontWeight: "700",
    },


    // ========================================================
    // ACTIONS
    // ========================================================

    cardActions: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "8px",
        paddingTop: "15px",
        borderTop: "1px solid #EEF1F6",
    },

    viewButton: {
        border: "1px solid #D4DEED",
        background: "#FFFFFF",
        color: "#245FC7",
        padding: "9px 13px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    acceptButton: {
        border: "none",
        background:
            "linear-gradient(135deg, #247A4D, #2E9360)",
        color: "#FFFFFF",
        padding: "9px 14px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow:
            "0 5px 12px rgba(36,122,77,0.18)",
    },

    rejectButton: {
        border: "1px solid #E7B9B9",
        background: "#FFF8F8",
        color: "#B42318",
        padding: "9px 14px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },


    // ========================================================
    // EMPTY STATE
    // ========================================================

    emptyCard: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F1",
        borderRadius: "14px",
        padding: "70px 30px",
        textAlign: "center",
        boxShadow:
            "0 5px 20px rgba(16,37,74,0.035)",
    },

    emptyIcon: {
        width: "64px",
        height: "64px",
        borderRadius: "16px",
        background: "#EAF2FF",
        color: "#2766D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 18px",
        fontSize: "26px",
        fontWeight: "700",
    },

    emptyTitle: {
        margin: 0,
        color: "#142B52",
        fontSize: "19px",
        fontWeight: "750",
    },

    emptyText: {
        maxWidth: "430px",
        margin: "9px auto 22px",
        color: "#7A879C",
        fontSize: "13px",
        lineHeight: "1.7",
    },

    browseButton: {
        border: "none",
        background:
            "linear-gradient(135deg, #2D6EE8, #3678EF)",
        color: "#FFFFFF",
        padding: "10px 18px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingPage: {
        minHeight: "450px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },

    spinner: {
        width: "38px",
        height: "38px",
        border: "4px solid #E4ECF8",
        borderTop:
            "4px solid #2D6EE8",
        borderRadius: "50%",
        animation:
            "candidateOffersSpin 0.8s linear infinite",
    },

    loadingText: {
        marginTop: "15px",
        color: "#74839B",
        fontSize: "13px",
    },


    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        background:
            "rgba(15, 30, 55, 0.55)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter:
            "blur(7px)",
    },

    modalContainer: {
        width:
            "min(820px, calc(100vw - 40px))",
        maxHeight:
            "calc(100vh - 50px)",
        background: "#FFFFFF",
        borderRadius: "15px",
        overflow: "hidden",
        boxShadow:
            "0 25px 70px rgba(15, 30, 55, 0.28)",
        display: "flex",
        flexDirection: "column",
    },

    modalHeader: {
        background:
            "linear-gradient(135deg, #21439a 0%, #2862e5 100%)",
        padding: "25px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexShrink: 0,
    },

    modalEyebrow: {
        color: "#B9CCFF",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1px",
        marginBottom: "5px",
    },

    modalTitle: {
        margin: 0,
        color: "#FFFFFF",
        fontSize: "20px",
        fontWeight: "750",
    },

    modalSubtitle: {
        margin: "5px 0 0",
        color: "#D5E0FF",
        fontSize: "12px",
    },

    closeButton: {
        width: "34px",
        height: "34px",
        border: "none",
        borderRadius: "8px",
        background: "#FFFFFF",
        color: "#52709B",
        fontSize: "22px",
        cursor: "pointer",
        lineHeight: "1",
        flexShrink: 0,
    },

    modalBody: {
        padding: "24px",
        overflowY: "auto",
    },

    detailGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "17px",
    },

    detailItem: {
        background: "#F7F9FC",
        border: "1px solid #E9EEF5",
        borderRadius: "9px",
        padding: "13px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    detailLabel: {
        color: "#8794A9",
        fontSize: "10px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
    },

    detailValue: {
        color: "#243A5E",
        fontSize: "13px",
        fontWeight: "700",
    },

    detailSection: {
        marginTop: "22px",
    },

    sectionTitle: {
        margin: "0 0 8px",
        color: "#263C60",
        fontSize: "13px",
        fontWeight: "750",
    },

    sectionText: {
        margin: 0,
        color: "#71809A",
        fontSize: "13px",
        lineHeight: "1.7",
        whiteSpace: "pre-wrap",
    },

    modalFooter: {
        padding: "15px 24px",
        borderTop: "1px solid #E8EDF4",
        display: "flex",
        justifyContent: "flex-end",
        gap: "9px",
        flexShrink: 0,
    },

    closeFooterButton: {
        border: "1px solid #D4DEED",
        background: "#FFFFFF",
        color: "#425B7E",
        padding: "9px 16px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },


    // ========================================================
    // CONFIRM MODAL
    // ========================================================

    confirmModal: {
        width:
            "min(440px, calc(100vw - 40px))",
        background: "#FFFFFF",
        borderRadius: "15px",
        padding: "30px",
        boxShadow:
            "0 25px 70px rgba(15, 30, 55, 0.28)",
        textAlign: "center",
    },

    confirmIcon: {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "#EAF2FF",
        color: "#2766D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 15px",
        fontSize: "21px",
        fontWeight: "800",
    },

    confirmTitle: {
        margin: 0,
        color: "#142B52",
        fontSize: "19px",
        fontWeight: "750",
    },

    confirmText: {
        margin: "10px auto 20px",
        color: "#71809A",
        fontSize: "13px",
        lineHeight: "1.7",
        maxWidth: "350px",
    },

    responseError: {
        background: "#FFF4F4",
        border: "1px solid #F3CACA",
        color: "#B42318",
        padding: "10px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        marginBottom: "16px",
    },

    confirmActions: {
        display: "flex",
        justifyContent: "center",
        gap: "9px",
    },

    cancelButton: {
        border: "1px solid #D4DEED",
        background: "#FFFFFF",
        color: "#425B7E",
        padding: "10px 17px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },
};


// ============================================================
// STATUS CSS
// ============================================================

const statusStyle = document.createElement(
    "style"
);

statusStyle.innerHTML = `
    @keyframes candidateOffersSpin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    .status-sent {
        background: #FFF4D8;
        color: #9A6700;
    }

    .status-accepted {
        background: #E7F7ED;
        color: #207044;
    }

    .status-rejected {
        background: #FDECEC;
        color: #B42318;
    }

    .status-expired {
        background: #EEF1F5;
        color: #667085;
    }

    .status-withdrawn {
        background: #F3ECFF;
        color: #6941C6;
    }

    .status-default {
        background: #EEF3FA;
        color: #526581;
    }

    @media (max-width: 1000px) {
        .candidate-offers-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 800px) {
        .candidate-offers-grid {
            grid-template-columns: 1fr;
        }
    }
`;

if (
    typeof document !== "undefined" &&
    !document.head.contains(statusStyle)
) {
    document.head.appendChild(statusStyle);
}


export default CandidateOffers;