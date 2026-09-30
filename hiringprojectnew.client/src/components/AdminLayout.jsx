import { useNavigate } from "react-router-dom";

const AdminLayout = ({
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

    const menuItems = [
        {
            label: "Dashboard",
            icon: "▦",
            path: "/admin",
            key: "dashboard",
        },
        {
            label: "Users",
            icon: "♙",
            path: "/admin/users",
            key: "users",
        },
        {
            label: "Recruiters",
            icon: "◆",
            path: "/admin/recruiters",
            key: "recruiters",
        },
        {
            label: "Candidates",
            icon: "♙",
            path: "/admin/candidates",
            key: "candidates",
        },
        {
            label: "Departments",
            icon: "▤",
            path: "/admin/departments",
            key: "departments",
        },
        {
            label: "Skills",
            icon: "★",
            path: "/admin/skills",
            key: "skills",
        },
        {
            label: "Job Categories",
            icon: "▣",
            path: "/admin/job-categories",
            key: "job-categories",
        },
    ];

    const getPageTitle = () => {
        switch (activePage) {
            case "dashboard":
                return "Dashboard";

            case "users":
                return "User Management";

            case "recruiters":
                return "Recruiter Management";

            case "candidates":
                return "Candidate Management";

            case "departments":
                return "Departments";

            case "skills":
                return "Skills";

            case "job-categories":
                return "Job Categories";

            default:
                return "SmartHire";
        }
    };

    return (
        <div className="admin-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">

                <div className="sidebar-logo">

                    <span className="sidebar-logo-icon">
                        S
                    </span>

                    <span>
                        SmartHire
                    </span>

                </div>


                <nav className="sidebar-navigation">

                    {menuItems.map(
                        (item) => (
                            <button
                                key={
                                    item.key
                                }
                                className={`sidebar-item ${activePage ===
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

                                <span>
                                    {
                                        item.icon
                                    }
                                </span>

                                {
                                    item.label
                                }

                            </button>
                        )
                    )}

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-item"
                        onClick={
                            handleLogout
                        }
                    >

                        <span>
                            ↪
                        </span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="admin-main">

                <header className="admin-header">

                    <div>

                        <h1>
                            {getPageTitle()}
                        </h1>

                        <p>
                            SmartHire Administration
                        </p>

                    </div>


                    {/* =================================================
                        ADMIN PROFILE
                    ================================================= */}

                    <div className="admin-profile">

                        <div className="profile-avatar">

                            {user?.fullName
                                ?.charAt(0)
                                .toUpperCase() ||
                                "A"}

                        </div>


                        <div className="profile-details">

                            <strong>
                                {
                                    user?.fullName ||
                                    "SmartHire Admin"
                                }
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                {children}

            </main>

        </div>
    );
};

export default AdminLayout;