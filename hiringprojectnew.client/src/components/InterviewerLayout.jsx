import { useNavigate } from "react-router-dom";

const InterviewerLayout = ({
    children,
    activePage,
}) => {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem(
            "smartHireUser"
        ) || "null"
    );

    const handleLogout = () => {
        localStorage.removeItem(
            "smartHireToken"
        );

        localStorage.removeItem(
            "smartHireUser"
        );

        navigate("/login");
    };

    // ============================================================
    // MENU ITEMS
    // ============================================================

    const menuItems = [
        {
            label: "Dashboard",
            icon: "▦",
            path: "/interviewer/dashboard",
            key: "dashboard",
        },
        {
            label: "My Interviews",
            icon: "▤",
            path: "/interviewer/interviews",
            key: "interviews",
        },
    ];

    // ============================================================
    // PAGE TITLE
    // ============================================================

    const getPageTitle = () => {
        switch (activePage) {
            case "dashboard":
                return "Interviewer Dashboard";

            case "interviews":
                return "My Interviews";

            case "interview-details":
                return "Interview Details";

            default:
                return "SmartHire";
        }
    };

    return (
        <div className="interviewer-layout">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="interviewer-sidebar">

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="interviewer-sidebar-logo">

                    <span className="interviewer-sidebar-logo-icon">
                        S
                    </span>

                    <span className="interviewer-sidebar-logo-text">
                        SmartHire
                    </span>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="interviewer-sidebar-navigation">

                    {menuItems.map(
                        (item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={`interviewer-sidebar-item ${activePage ===
                                        item.key
                                        ? "active"
                                        : ""
                                    }`}
                                onClick={() =>
                                    navigate(
                                        item.path
                                    )
                                }
                            >

                                <span className="interviewer-sidebar-icon">
                                    {
                                        item.icon
                                    }
                                </span>

                                <span className="interviewer-sidebar-label">
                                    {
                                        item.label
                                    }
                                </span>

                            </button>
                        )
                    )}

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <div className="interviewer-sidebar-bottom">

                    <button
                        type="button"
                        className="interviewer-sidebar-item interviewer-logout"
                        onClick={
                            handleLogout
                        }
                    >

                        <span className="interviewer-sidebar-icon">
                            ↪
                        </span>

                        <span className="interviewer-sidebar-label">
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =====================================================
                MAIN AREA
            ===================================================== */}

            <main className="interviewer-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="interviewer-header">

                    <div className="interviewer-header-left">

                        <h1>
                            {
                                getPageTitle()
                            }
                        </h1>

                        <p>
                            SmartHire Interviewer Management
                        </p>

                    </div>


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <div className="interviewer-profile">

                        <div className="interviewer-profile-avatar">

                            {user?.fullName
                                ?.charAt(0)
                                .toUpperCase() ||
                                "I"}

                        </div>


                        <div className="interviewer-profile-details">

                            <strong>
                                {
                                    user?.fullName ||
                                    "Interviewer"
                                }
                            </strong>

                            <span>
                                Interviewer Panel
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <div className="interviewer-page-content">

                    {children}

                </div>

            </main>


            {/* =====================================================
                STYLES
            ===================================================== */}

            <style>
                {`

                /* =================================================
                   RESET
                ================================================= */

                .interviewer-layout,
                .interviewer-layout * {
                    box-sizing: border-box;
                }


                /* =================================================
                   MAIN LAYOUT
                ================================================= */

                .interviewer-layout {
                    width: 100%;
                    min-height: 100vh;

                    display: flex;

                    background: #F5F7FB;

                    color: #10254A;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }


                /* =================================================
                   SIDEBAR
                ================================================= */

                .interviewer-sidebar {
                    width: 248px;
                    min-width: 248px;

                    height: 100vh;

                    position: fixed;
                    top: 0;
                    left: 0;

                    display: flex;
                    flex-direction: column;

                    background: #101A35;

                    color: #FFFFFF;

                    z-index: 1000;

                    overflow: hidden;
                }


                /* =================================================
                   SIDEBAR LOGO
                ================================================= */

                .interviewer-sidebar-logo {
                    height: 57px;
                    min-height: 57px;

                    padding: 0 20px;

                    display: flex;
                    align-items: center;

                    gap: 12px;

                    border-bottom:
                        1px solid
                        rgba(255, 255, 255, 0.08);
                }


                .interviewer-sidebar-logo-icon {
                    width: 40px;
                    height: 40px;

                    min-width: 40px;

                    border-radius: 10px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: #2867E8;

                    color: #10254A;

                    font-size: 20px;
                    font-weight: 800;

                    box-shadow:
                        0 4px 12px
                        rgba(40, 103, 232, 0.25);
                }


                .interviewer-sidebar-logo-text {
                    color: #FFFFFF;

                    font-size: 18px;
                    font-weight: 750;

                    line-height: 1;

                    white-space: nowrap;
                }


                /* =================================================
                   NAVIGATION
                ================================================= */

                .interviewer-sidebar-navigation {
                    padding: 25px 10px;

                    display: flex;
                    flex-direction: column;

                    gap: 5px;
                }


                .interviewer-sidebar-item {
                    width: 100%;
                    height: 45px;

                    border: none;

                    border-radius: 9px;

                    padding: 0 18px;

                    display: flex;
                    align-items: center;

                    gap: 14px;

                    background: transparent;

                    color: #C1CADB;

                    font-family: inherit;

                    font-size: 13px;
                    font-weight: 600;

                    text-align: left;

                    cursor: pointer;

                    transition:
                        background 0.18s ease,
                        color 0.18s ease,
                        box-shadow 0.18s ease;
                }


                .interviewer-sidebar-item:hover {
                    background:
                        rgba(255, 255, 255, 0.06);

                    color: #FFFFFF;
                }


                .interviewer-sidebar-item.active {
                    background: #2867E8;

                    color: #FFFFFF;

                    box-shadow:
                        0 5px 14px
                        rgba(40, 103, 232, 0.22);
                }


                .interviewer-sidebar-icon {
                    width: 18px;
                    min-width: 18px;

                    height: 18px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    font-size: 14px;

                    line-height: 1;
                }


                .interviewer-sidebar-label {
                    display: block;

                    white-space: nowrap;

                    line-height: 1;
                }


                /* =================================================
                   SIDEBAR BOTTOM
                ================================================= */

                .interviewer-sidebar-bottom {
                    margin-top: auto;

                    padding:
                        17px
                        10px
                        22px;

                    border-top:
                        1px solid
                        rgba(255, 255, 255, 0.08);
                }


                /* =================================================
                   LOGOUT
                ================================================= */

                .interviewer-logout {
                    color: #C1CADB;
                }


                .interviewer-logout:hover {
                    color: #FFFFFF;

                    background:
                        rgba(255, 255, 255, 0.06);
                }


                /* =================================================
                   MAIN
                ================================================= */

                .interviewer-main {
                    width: calc(100% - 248px);

                    min-height: 100vh;

                    margin-left: 248px;

                    background: #F5F7FB;
                }


                /* =================================================
                   HEADER
                ================================================= */

                .interviewer-header {
                    width: 100%;

                    height: 69px;

                    background: #FFFFFF;

                    border-bottom:
                        1px solid #E1E6EE;

                    padding:
                        0 30px;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    position: sticky;

                    top: 0;

                    z-index: 100;
                }


                /* =================================================
                   HEADER LEFT
                ================================================= */

                .interviewer-header-left {
                    min-width: 0;
                }


                .interviewer-header-left h1 {
                    margin: 0;

                    color: #10254A;

                    font-size: 20px;

                    font-weight: 750;

                    line-height: 1.2;
                }


                .interviewer-header-left p {
                    margin: 4px 0 0;

                    color: #6C7D99;

                    font-size: 12px;

                    line-height: 1.2;
                }


                /* =================================================
                   PROFILE
                ================================================= */

                .interviewer-profile {
                    display: flex;

                    align-items: center;

                    gap: 10px;

                    flex-shrink: 0;
                }


                .interviewer-profile-avatar {
                    width: 40px;
                    height: 40px;

                    min-width: 40px;

                    border-radius: 50%;

                    background: #2855AE;

                    color: #FFFFFF;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    font-size: 14px;

                    font-weight: 700;
                }


                .interviewer-profile-details {
                    display: flex;

                    flex-direction: column;

                    justify-content: center;

                    min-width: 100px;
                }


                .interviewer-profile-details strong {
                    color: #10254A;

                    font-size: 12px;

                    font-weight: 700;

                    line-height: 1.2;

                    white-space: nowrap;
                }


                .interviewer-profile-details span {
                    color: #6C7D99;

                    font-size: 10px;

                    margin-top: 3px;

                    line-height: 1.2;

                    white-space: nowrap;
                }


                /* =================================================
                   PAGE CONTENT
                ================================================= */

                .interviewer-page-content {
                    width: 100%;

                    min-height:
                        calc(100vh - 69px);

                    padding:
                        34px
                        38px
                        45px;
                }


                /* =================================================
                   RESPONSIVE
                ================================================= */

                @media (max-width: 1100px) {

                    .interviewer-sidebar {
                        width: 220px;

                        min-width: 220px;
                    }


                    .interviewer-main {
                        width:
                            calc(100% - 220px);

                        margin-left: 220px;
                    }


                    .interviewer-page-content {
                        padding:
                            30px
                            25px
                            40px;
                    }

                }


                @media (max-width: 800px) {

                    .interviewer-sidebar {
                        width: 72px;

                        min-width: 72px;
                    }


                    .interviewer-main {
                        width:
                            calc(100% - 72px);

                        margin-left: 72px;
                    }


                    .interviewer-sidebar-logo {
                        padding: 0;

                        justify-content:
                            center;
                    }


                    .interviewer-sidebar-logo-text {
                        display: none;
                    }


                    .interviewer-sidebar-item {
                        justify-content:
                            center;

                        padding: 0;
                    }


                    .interviewer-sidebar-label {
                        display: none;
                    }


                    .interviewer-header {
                        padding:
                            0 20px;
                    }


                    .interviewer-profile-details {
                        display: none;
                    }


                    .interviewer-page-content {
                        padding:
                            25px
                            20px
                            35px;
                    }

                }


                @media (max-width: 600px) {

                    .interviewer-sidebar {
                        width: 64px;

                        min-width: 64px;
                    }


                    .interviewer-main {
                        width:
                            calc(100% - 64px);

                        margin-left: 64px;
                    }


                    .interviewer-header {
                        height: 64px;

                        padding:
                            0 15px;
                    }


                    .interviewer-header-left h1 {
                        font-size: 17px;
                    }


                    .interviewer-header-left p {
                        font-size: 10px;
                    }


                    .interviewer-profile-avatar {
                        width: 35px;
                        height: 35px;

                        min-width: 35px;
                    }


                    .interviewer-page-content {
                        min-height:
                            calc(100vh - 64px);

                        padding:
                            22px
                            14px
                            30px;
                    }

                }

                `}
            </style>
        </div>
    );
};

export default InterviewerLayout;