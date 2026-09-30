import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError(
                "Please enter your email and password."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/Auth/login",
                {
                    email: email.trim(),
                    password,
                }
            );

            const user = response.data;

            // ==========================================
            // VALIDATE LOGIN RESPONSE
            // ==========================================

            if (!user || !user.token) {
                setError(
                    "Login was successful, but no authentication token was received."
                );

                return;
            }

            if (!user.role) {
                setError(
                    "Unable to determine your account role."
                );

                return;
            }

            // ==========================================
            // STORE JWT TOKEN
            // ==========================================

            localStorage.setItem(
                "smartHireToken",
                user.token
            );

            // ==========================================
            // STORE USER INFORMATION
            // ==========================================

            localStorage.setItem(
                "smartHireUser",
                JSON.stringify({
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                })
            );

            // ==========================================
            // REDIRECT BASED ON ROLE
            // ==========================================

            if (user.role === "Admin") {
                navigate("/admin", {
                    replace: true,
                });

                return;
            }

            if (user.role === "Recruiter") {
                navigate("/recruiter", {
                    replace: true,
                });

                return;
            }

            // ==========================================
            // INTERVIEWER
            // ==========================================

            if (user.role === "Interviewer") {
                navigate("/interviewer/dashboard", {
                    replace: true,
                });

                return;
            }

            if (user.role === "Candidate") {
                navigate("/candidate/dashboard", {
                    replace: true,
                });

                return;
            }

            // ==========================================
            // INVALID ROLE
            // ==========================================

            localStorage.removeItem(
                "smartHireToken"
            );

            localStorage.removeItem(
                "smartHireUser"
            );

            setError(
                `Invalid user role: ${user.role}`
            );

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            // ==========================================
            // SERVER ERROR MESSAGE
            // ==========================================

            if (
                error.response?.data?.message
            ) {
                setError(
                    error.response.data.message
                );
            }

            // ==========================================
            // UNAUTHORIZED
            // ==========================================

            else if (
                error.response?.status === 401
            ) {
                setError(
                    "Invalid email or password."
                );
            }

            // ==========================================
            // FORBIDDEN
            // ==========================================

            else if (
                error.response?.status === 403
            ) {
                setError(
                    "Your account is not authorized to sign in."
                );
            }

            // ==========================================
            // SERVER / NETWORK ERROR
            // ==========================================

            else {
                setError(
                    "Unable to sign in. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-container">

                {/* ==================================================
                    LEFT BRAND PANEL
                ================================================== */}

                <section className="auth-brand-panel">

                    <div className="auth-brand-content">

                        {/* LOGO */}

                        <div className="auth-logo">

                            <span className="auth-logo-icon">
                                S
                            </span>

                            <span>
                                SmartHire
                            </span>

                        </div>


                        {/* MAIN MESSAGE */}

                        <h1>
                            Find talent.
                            <br />
                            Build teams.
                            <br />
                            Hire smarter.
                        </h1>


                        <p>
                            A smarter recruitment platform
                            that connects organizations with
                            the right talent through streamlined
                            hiring workflows.
                        </p>


                        {/* FEATURES */}

                        <div
                            style={{
                                marginTop: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "9px",
                                color:
                                    "rgba(255,255,255,0.88)",
                                fontSize: "12px",
                            }}
                        >

                            <span>
                                ✓ Smart candidate management
                            </span>

                            <span>
                                ✓ Intelligent recruitment workflow
                            </span>

                            <span>
                                ✓ Complete hiring visibility
                            </span>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    RIGHT LOGIN PANEL
                ================================================== */}

                <section className="auth-form-panel">

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* HEADER */}

                        <div className="auth-form-header">

                            <span
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color:
                                        "#2563EB",
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    letterSpacing:
                                        "0.12em",
                                }}
                            >
                                SMART HIRING PLATFORM
                            </span>

                            <h2>
                                Welcome back
                            </h2>

                            <p>
                                Sign in to continue to
                                your SmartHire account.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}


                        {/* EMAIL */}

                        <div className="auth-field">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                autoComplete="email"
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="auth-field">

                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    marginBottom: "7px",
                                }}
                            >

                                <label
                                    htmlFor="password"
                                    style={{
                                        marginBottom:
                                            "0",
                                    }}
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        color:
                                            "#2563EB",
                                        fontSize:
                                            "10px",
                                        fontWeight:
                                            "650",
                                        padding: "0",
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="current-password"
                            />

                        </div>


                        {/* FORGOT PASSWORD */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                marginTop: "-7px",
                                marginBottom: "20px",
                            }}
                        >

                            <button
                                type="button"
                                style={{
                                    border: "none",
                                    background:
                                        "transparent",
                                    padding: "0",
                                    color:
                                        "#64748B",
                                    fontSize:
                                        "10px",
                                    cursor:
                                        "pointer",
                                }}
                                onClick={() =>
                                    setError(
                                        "Password reset will be available soon."
                                    )
                                }
                            >
                                Forgot password?
                            </button>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>


                        {/* REGISTER */}

                        <div className="auth-link">

                            Don't have an account?{" "}

                            <Link to="/register">
                                Create an account
                            </Link>

                        </div>


                        {/* FOOTER */}

                        <div
                            style={{
                                marginTop: "35px",
                                paddingTop: "17px",
                                borderTop:
                                    "1px solid #E2E8F0",
                                color:
                                    "#94A3B8",
                                textAlign: "center",
                                fontSize: "9px",
                            }}
                        >
                            SmartHire Recruitment &
                            Applicant Tracking System
                        </div>

                    </form>

                </section>

            </div>

        </div>
    );
};

export default Login;