import { NavLink, useNavigate } from "react-router-dom";

const CandidateLayout = ({
    children,
    activePage = "dashboard",
}) => {
    const navigate = useNavigate();

    const storedUser =
        JSON.parse(
            localStorage.getItem("smartHireUser")
        ) || {};

    const fullName =
        storedUser.fullName || "Candidate";

    const handleLogout = () => {
        localStorage.removeItem(
            "smartHireToken"
        );

        localStorage.removeItem(
            "smartHireUser"
        );

        navigate("/login", {
            replace: true,
        });
    };

    const getInitials = () => {
        const name = fullName.trim();

        if (!name) {
            return "C";
        }

        const parts = name.split(" ");

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 1)
                .toUpperCase();
        }

        return (
            parts[0].substring(0, 1) +
            parts[parts.length - 1]
                .substring(0, 1)
        ).toUpperCase();
    };

    const navigationItems = [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: "▦",
            path: "/candidate/dashboard",
        },
        {
            key: "jobs",
            label: "Find Jobs",
            icon: "⌕",
            path: "/candidate/jobs",
        },
        {
            key: "applications",
            label: "My Applications",
            icon: "▤",
            path: "/candidate/applications",
        },
        {
            key: "assessments",
            label: "Assessments",
            icon: "✓",
            path: "/candidate/assessments",
        },
        {
            key: "interviews",
            label: "Interviews",
            icon: "◫",
            path: "/candidate/interviews",
        },
        {
            key: "offers",
            label: "Offers",
            icon: "▣",
            path: "/candidate/offers",
        },
        {
            key: "profile",
            label: "My Profile",
            icon: "◉",
            path: "/candidate/profile",
        },
    ];

    const activeNavigationItem =
        navigationItems.find(
            (item) =>
                item.key === activePage
        );

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                background: "#F5F7FB",
                color: "#10254A",
                fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside
                style={{
                    width: "250px",
                    minWidth: "250px",
                    minHeight: "100vh",
                    background:
                        "linear-gradient(180deg, #102347 0%, #162D5A 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >

                {/* =================================================
                    BRAND
                ================================================= */}

                <div
                    style={{
                        height: "88px",
                        padding: "0 22px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        borderBottom:
                            "1px solid rgba(255,255,255,0.09)",
                    }}
                >

                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background:
                                "linear-gradient(135deg, #2F72F3, #4F8CFF)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "800",
                            color: "#FFFFFF",
                            boxShadow:
                                "0 6px 16px rgba(47,114,243,0.28)",
                        }}
                    >
                        S
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                        }}
                    >

                        <h2
                            style={{
                                margin: 0,
                                color: "#FFFFFF",
                                fontSize: "18px",
                                fontWeight: "700",
                            }}
                        >
                            SmartHire
                        </h2>

                        <span
                            style={{
                                color: "#AEBBD5",
                                fontSize: "11px",
                            }}
                        >
                            Candidate Portal
                        </span>

                    </div>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <div
                    style={{
                        padding: "27px 14px 0",
                    }}
                >

                    <span
                        style={{
                            display: "block",
                            padding: "0 12px",
                            marginBottom: "12px",
                            color: "#8293B7",
                            fontSize: "11px",
                            fontWeight: "700",
                            letterSpacing: "1px",
                        }}
                    >
                        CANDIDATE MENU
                    </span>


                    <nav
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                        }}
                    >

                        {navigationItems.map(
                            (item) => (
                                <NavLink
                                    key={item.key}
                                    to={item.path}
                                    style={{
                                        minHeight: "46px",
                                        padding: "0 15px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        borderRadius: "9px",
                                        color:
                                            activePage ===
                                                item.key
                                                ? "#FFFFFF"
                                                : "#B9C5DC",
                                        background:
                                            activePage ===
                                                item.key
                                                ? "linear-gradient(135deg, #2D6EE8, #3678EF)"
                                                : "transparent",
                                        textDecoration:
                                            "none",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        boxShadow:
                                            activePage ===
                                                item.key
                                                ? "0 7px 18px rgba(45,110,232,0.25)"
                                                : "none",
                                        transition:
                                            "all 0.2s ease",
                                    }}
                                >

                                    <span
                                        style={{
                                            width: "18px",
                                            minWidth: "18px",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            fontSize:
                                                "16px",
                                        }}
                                    >
                                        {item.icon}
                                    </span>

                                    <span>
                                        {item.label}
                                    </span>

                                </NavLink>
                            )
                        )}

                    </nav>

                </div>


                {/* =================================================
                    SIDEBAR BOTTOM
                ================================================= */}

                <div
                    style={{
                        marginTop: "auto",
                        padding: "18px 14px",
                        borderTop:
                            "1px solid rgba(255,255,255,0.09)",
                    }}
                >

                    {/* LOGOUT */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            minHeight: "44px",
                            border: "none",
                            background:
                                "transparent",
                            color: "#B8C5DC",
                            display: "flex",
                            alignItems: "center",
                            gap: "13px",
                            padding: "0 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            textAlign: "left",
                        }}
                    >

                        <span
                            style={{
                                fontSize: "17px",
                            }}
                        >
                            ↪
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =====================================================
                MAIN AREA
            ===================================================== */}

            <div
                style={{
                    marginLeft: "250px",
                    minHeight: "100vh",
                    width: "calc(100% - 250px)",
                }}
            >

                {/* =================================================
                    TOPBAR
                ================================================= */}

                <header
                    style={{
                        height: "74px",
                        background: "#FFFFFF",
                        borderBottom:
                            "1px solid #E4E9F1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        padding: "0 30px",
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                    }}
                >

                    {/* TOPBAR LEFT */}

                    <div
                        style={{
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: "3px",
                        }}
                    >

                        <span
                            style={{
                                color: "#2766D9",
                                fontSize: "11px",
                                fontWeight: "700",
                                letterSpacing:
                                    "1px",
                            }}
                        >
                            CANDIDATE PORTAL
                        </span>

                        <h1
                            style={{
                                margin: 0,
                                color: "#10254A",
                                fontSize: "20px",
                                fontWeight: "700",
                            }}
                        >
                            {activePage ===
                                "dashboard"
                                ? "Dashboard"
                                : activeNavigationItem?.label ||
                                "Candidate Portal"}
                        </h1>

                    </div>


                    {/* TOPBAR RIGHT */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "24px",
                        }}
                    >

                        {/* AVAILABILITY */}

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "7px",
                                color: "#687995",
                                fontSize: "13px",
                            }}
                        >

                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#24B76A",
                                }}
                            />

                            Available

                        </div>


                        {/* USER */}

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "10px",
                            }}
                        >

                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#DCE9FF",
                                    color:
                                        "#245FC7",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontSize: "12px",
                                    fontWeight:
                                        "800",
                                }}
                            >
                                {getInitials()}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    gap: "2px",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "#243A5E",
                                        fontSize:
                                            "12px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {fullName}
                                </span>

                                <span
                                    style={{
                                        color:
                                            "#8290A8",
                                        fontSize:
                                            "10px",
                                    }}
                                >
                                    Candidate
                                </span>

                            </div>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <main
                    style={{
                        padding:
                            "30px 30px 40px",
                    }}
                >
                    {children}
                </main>

            </div>

        </div>
    );
};

export default CandidateLayout;