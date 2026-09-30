import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "Please fill in all required fields."
            );

            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/Auth/register",
                {
                    fullName: fullName.trim(),
                    email: email.trim(),
                    password,
                }
            );

            setSuccess(
                response.data?.message ||
                "Account created successfully."
            );

            // Clear form

            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            // Redirect to login

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            if (
                error.response?.data?.message
            ) {
                setError(
                    error.response.data.message
                );
            }
            else if (
                error.response?.status === 409
            ) {
                setError(
                    "An account with this email already exists."
                );
            }
            else {
                setError(
                    "Unable to create your account. Please try again."
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
                            Start your
                            <br />
                            hiring journey.
                        </h1>


                        <p>
                            Create your SmartHire account
                            and connect with opportunities
                            through a streamlined recruitment
                            experience.
                        </p>


                        {/* FEATURES */}

                        <div
                            style={{
                                marginTop: "24px",
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: "9px",
                                color:
                                    "rgba(255,255,255,0.88)",
                                fontSize: "12px",
                            }}
                        >

                            <span>
                                ✓ Build your professional profile
                            </span>

                            <span>
                                ✓ Discover relevant opportunities
                            </span>

                            <span>
                                ✓ Track your applications
                            </span>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    RIGHT REGISTER PANEL
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
                                JOIN SMARTHIRE
                            </span>

                            <h2>
                                Create your account
                            </h2>

                            <p>
                                Register as a candidate
                                to start your SmartHire journey.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}


                        {/* SUCCESS */}

                        {success && (
                            <div className="auth-success">
                                {success}
                            </div>
                        )}


                        {/* FULL NAME */}

                        <div className="auth-field">

                            <label htmlFor="fullName">
                                Full name
                            </label>

                            <input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(
                                        event.target.value
                                    )
                                }
                                autoComplete="name"
                            />

                        </div>


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
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

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
                                    htmlFor="confirmPassword"
                                    style={{
                                        marginBottom:
                                            "0",
                                    }}
                                >
                                    Confirm password
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
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
                                    }}
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm your password"
                                value={
                                    confirmPassword
                                }
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                            />

                        </div>


                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>


                        {/* LOGIN LINK */}

                        <div className="auth-link">

                            Already have an account?{" "}

                            <Link to="/login">
                                Sign in
                            </Link>

                        </div>


                        {/* INFORMATION */}

                        <div
                            style={{
                                marginTop: "23px",
                                padding: "11px 13px",
                                border:
                                    "1px solid #DBEAFE",
                                borderRadius: "8px",
                                background:
                                    "#EFF6FF",
                                color:
                                    "#475569",
                                fontSize: "10px",
                                lineHeight: "1.5",
                            }}
                        >
                            <strong
                                style={{
                                    color:
                                        "#1D4ED8",
                                }}
                            >
                                Candidate account
                            </strong>

                            <br />

                            Public registration creates
                            a Candidate account. Recruiter
                            accounts are managed by SmartHire
                            administrators.
                        </div>


                        {/* FOOTER */}

                        <div
                            style={{
                                marginTop: "24px",
                                paddingTop: "15px",
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

export default Register;