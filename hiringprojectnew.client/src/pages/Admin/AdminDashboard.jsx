import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const token = localStorage.getItem(
                    "smartHireToken"
                );

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get(
                    "/Admin/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setDashboard(response.data);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 401) {
                    localStorage.removeItem(
                        "smartHireToken"
                    );

                    localStorage.removeItem(
                        "smartHireUser"
                    );

                    navigate("/login");
                    return;
                }

                if (error.response?.status === 403) {
                    setError(
                        "You are not authorized to access the Admin dashboard."
                    );
                    return;
                }

                setError(
                    "Unable to load the dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);


    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading SmartHire Dashboard...
            </div>
        );
    }


    if (error) {
        return (
            <div className="dashboard-error">

                <h2>
                    Access Error
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() => {
                        localStorage.removeItem(
                            "smartHireToken"
                        );

                        localStorage.removeItem(
                            "smartHireUser"
                        );

                        navigate("/login");
                    }}
                >
                    Back to Login
                </button>

            </div>
        );
    }


    return (
        <AdminLayout activePage="dashboard">

            {/* =================================================
                WELCOME SECTION
            ================================================= */}

            <section className="welcome-section">

                <div>

                    <p className="welcome-label">
                        ADMIN OVERVIEW
                    </p>

                    <h2>
                        Welcome back, SmartHire Admin
                    </h2>

                    <p>
                        Monitor users and manage your
                        recruitment platform from one place.
                    </p>

                </div>

            </section>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon users-icon">
                        U
                    </div>

                    <div>

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {dashboard?.totalUsers ?? 0}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon candidate-icon">
                        C
                    </div>

                    <div>

                        <span>
                            Candidates
                        </span>

                        <strong>
                            {dashboard?.totalCandidates ?? 0}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon recruiter-icon">
                        R
                    </div>

                    <div>

                        <span>
                            Recruiters
                        </span>

                        <strong>
                            {dashboard?.totalRecruiters ?? 0}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon admin-icon">
                        A
                    </div>

                    <div>

                        <span>
                            Administrators
                        </span>

                        <strong>
                            {dashboard?.totalAdmins ?? 0}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                DASHBOARD CONTENT
            ================================================= */}

            <section className="dashboard-content">


                {/* PLATFORM OVERVIEW */}

                <div className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Platform Overview
                            </h3>

                            <p>
                                Current SmartHire user distribution
                            </p>

                        </div>

                    </div>


                    <div className="overview-row">


                        <div className="overview-item">

                            <span
                                className="overview-dot candidate-dot"
                            />

                            <div>

                                <strong>
                                    {dashboard?.totalCandidates ?? 0}
                                </strong>

                                <span>
                                    Candidates
                                </span>

                            </div>

                        </div>


                        <div className="overview-item">

                            <span
                                className="overview-dot recruiter-dot"
                            />

                            <div>

                                <strong>
                                    {dashboard?.totalRecruiters ?? 0}
                                </strong>

                                <span>
                                    Recruiters
                                </span>

                            </div>

                        </div>


                        <div className="overview-item">

                            <span
                                className="overview-dot admin-dot"
                            />

                            <div>

                                <strong>
                                    {dashboard?.totalAdmins ?? 0}
                                </strong>

                                <span>
                                    Administrators
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* QUICK ACTIONS */}

                <div className="dashboard-panel quick-panel">

                    <h3>
                        Quick Actions
                    </h3>


                    <button
                        onClick={() =>
                            navigate("/admin/users")
                        }
                    >
                        + Manage Users
                    </button>


                    <button
                        onClick={() =>
                            navigate("/admin/recruiters")
                        }
                    >
                        + Manage Recruiters
                    </button>

                </div>

            </section>

        </AdminLayout>
    );
};

export default AdminDashboard;