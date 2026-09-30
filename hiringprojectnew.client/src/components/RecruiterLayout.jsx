import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const RecruiterLayout = ({ children, activePage = "dashboard" }) => {
    const navigate = useNavigate();

    const [recruiterName, setRecruiterName] = useState("Recruiter");

    useEffect(() => {
        const storedUser = localStorage.getItem("smartHireUser");

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);

                if (user.fullName) {
                    setRecruiterName(user.fullName);
                }
            } catch {
                setRecruiterName("Recruiter");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("smartHireToken");
        localStorage.removeItem("smartHireUser");

        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            key: "dashboard",
            label: "Dashboard",
            path: "/recruiter/dashboard",
            icon: "▦",
        },
        {
            key: "jobs",
            label: "Jobs",
            path: "/recruiter/jobs",
            icon: "▤",
        },
        {
            key: "applicants",
            label: "Applicants",
            path: "/recruiter/applicants",
            icon: "♙",
        },
        {
            key: "assessments",
            label: "Assessments",
            path: "/recruiter/assessments",
            icon: "✓",
        },
        {
            key: "interviews",
            label: "Interviews",
            path: "/recruiter/interviews",
            icon: "◷",
        },
        {
            key: "offers",
            label: "Offers",
            path: "/recruiter/offers",
            icon: "▣",
        },
        {
            key: "analytics",
            label: "Analytics",
            path: "/recruiter/analytics",
            icon: "◫",
        },
    ];

    return (
        <div className="recruiter-layout">

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside className="recruiter-sidebar">

                {/* Brand */}

                <div className="recruiter-brand">
                    <div className="recruiter-brand-logo">
                        SH
                    </div>

                    <div className="recruiter-brand-text">
                        <h2>SmartHire</h2>
                        <span>Recruitment Platform</span>
                    </div>
                </div>

                {/* Navigation */}

                <div className="recruiter-sidebar-section">
                    <span className="recruiter-sidebar-title">
                        RECRUITMENT
                    </span>

                    <nav className="recruiter-navigation">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.key}
                                to={item.path}
                                className={() =>
                                    `recruiter-nav-item ${activePage === item.key
                                        ? "recruiter-nav-item-active"
                                        : ""
                                    }`
                                }
                            >
                                <span className="recruiter-nav-icon">
                                    {item.icon}
                                </span>

                                <span className="recruiter-nav-label">
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Bottom */}

                <div className="recruiter-sidebar-bottom">

                    <button
                        type="button"
                        className="recruiter-logout-button"
                        onClick={handleLogout}
                    >
                        <span className="recruiter-logout-icon">
                            ↪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>
            </aside>

            {/* =========================================
                MAIN AREA
            ========================================= */}

            <main className="recruiter-main">

                {/* Top Header */}

                <header className="recruiter-topbar">

                    <div className="recruiter-topbar-left">
                        <span className="recruiter-topbar-label">
                            RECRUITER PORTAL
                        </span>

                        <h1>
                            SmartHire
                        </h1>
                    </div>

                    <div className="recruiter-topbar-right">

                        <div className="recruiter-status">
                            <span className="recruiter-status-dot"></span>

                            <span>
                                Online
                            </span>
                        </div>

                        <div className="recruiter-topbar-user">

                            <div className="recruiter-topbar-avatar">
                                {recruiterName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="recruiter-topbar-user-info">
                                <strong>
                                    {recruiterName}
                                </strong>

                                <span>
                                    Recruiter
                                </span>
                            </div>

                        </div>

                    </div>

                </header>

                {/* Page Content */}

                <section className="recruiter-content">
                    {children}
                </section>

            </main>
        </div>
    );
};

export default RecruiterLayout;