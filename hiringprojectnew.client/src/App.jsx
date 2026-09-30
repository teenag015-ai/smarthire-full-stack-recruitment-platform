import { Navigate, Route, Routes } from "react-router-dom";

// =========================================================
// AUTH
// =========================================================

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// =========================================================
// ADMIN
// =========================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminRecruiters from "./pages/Admin/AdminRecruiters";
import AdminCandidates from "./pages/Admin/AdminCandidates";
import AdminDepartments from "./pages/Admin/AdminDepartments";
import AdminSkills from "./pages/Admin/AdminSkills";
import AdminJobCategories from "./pages/Admin/AdminJobCategories";

// =========================================================
// RECRUITER
// =========================================================

import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard";
import RecruiterJobs from "./pages/Recruiter/RecruiterJobs";
import RecruiterApplicants from "./pages/Recruiter/RecruiterApplicants";
import RecruiterAssessments from "./pages/Recruiter/RecruiterAssessments";
import RecruiterAssessmentQuestions from "./pages/Recruiter/RecruiterAssessmentQuestions";
import RecruiterInterviews from "./pages/Recruiter/RecruiterInterviews";
import RecruiterOffers from "./pages/Recruiter/RecruiterOffers";
import RecruiterAnalytics from "./pages/Recruiter/RecruiterAnalytics";

// =========================================================
// CANDIDATE
// =========================================================

import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import CandidateJobs from "./pages/Candidate/CandidateJobs";
import CandidateJobDetails from "./pages/Candidate/CandidateJobDetails";
import CandidateApply from "./pages/Candidate/CandidateApply";
import CandidateApplications from "./pages/Candidate/CandidateApplications";
import CandidateAssessments from "./pages/Candidate/CandidateAssessments";
import CandidateAssessment from "./pages/Candidate/CandidateAssessment";
import CandidateProfile from "./pages/Candidate/CandidateProfile";
import CandidateInterviews from "./pages/Candidate/CandidateInterviews";
import CandidateInterviewDetails from "./pages/Candidate/CandidateInterviewDetails";
import CandidateOffers from "./pages/Candidate/CandidateOffers";

// =========================================================
// INTERVIEWER
// =========================================================

import InterviewerDashboard from "./pages/interviewer/InterviewerDashboard";
import InterviewerInterviews from "./pages/interviewer/InterviewerInterviews";
import InterviewerInterviewDetails from "./pages/interviewer/InterviewerInterviewDetails";

// NEW: Interview Evaluation
import InterviewerEvaluation from "./pages/interviewer/InterviewerEvaluation";

// =========================================================
// PROTECTED ROUTE
// =========================================================

import ProtectedRoute from "./components/ProtectedRoute";

// =========================================================
// APP
// =========================================================

function App() {
    return (
        <Routes>

            {/* =============================================
                AUTH ROUTES
            ============================================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* =============================================
                ADMIN ROUTES
            ============================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["Admin"]}
                    />
                }
            >
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                />

                <Route
                    path="/admin/recruiters"
                    element={<AdminRecruiters />}
                />

                <Route
                    path="/admin/candidates"
                    element={<AdminCandidates />}
                />

                <Route
                    path="/admin/departments"
                    element={<AdminDepartments />}
                />

                <Route
                    path="/admin/skills"
                    element={<AdminSkills />}
                />

                <Route
                    path="/admin/job-categories"
                    element={<AdminJobCategories />}
                />
            </Route>

            {/* =============================================
                RECRUITER ROUTES
            ============================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["Recruiter"]}
                    />
                }
            >
                <Route
                    path="/recruiter"
                    element={
                        <Navigate
                            to="/recruiter/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="/recruiter/dashboard"
                    element={<RecruiterDashboard />}
                />

                <Route
                    path="/recruiter/jobs"
                    element={<RecruiterJobs />}
                />

                <Route
                    path="/recruiter/applicants"
                    element={<RecruiterApplicants />}
                />

                <Route
                    path="/recruiter/assessments"
                    element={<RecruiterAssessments />}
                />

                <Route
                    path="/recruiter/assessments/:assessmentId/questions"
                    element={
                        <RecruiterAssessmentQuestions />
                    }
                />

                <Route
                    path="/recruiter/interviews"
                    element={<RecruiterInterviews />}
                />

                <Route
                    path="/recruiter/offers"
                    element={<RecruiterOffers />}
                />

                <Route
                    path="/recruiter/analytics"
                    element={<RecruiterAnalytics />}
                />
            </Route>

            {/* =============================================
                CANDIDATE ROUTES
            ============================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["Candidate"]}
                    />
                }
            >
                <Route
                    path="/candidate"
                    element={
                        <Navigate
                            to="/candidate/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="/candidate/dashboard"
                    element={<CandidateDashboard />}
                />

                <Route
                    path="/candidate/jobs"
                    element={<CandidateJobs />}
                />

                <Route
                    path="/candidate/jobs/:id"
                    element={<CandidateJobDetails />}
                />

                <Route
                    path="/candidate/jobs/:id/apply"
                    element={<CandidateApply />}
                />

                <Route
                    path="/candidate/applications"
                    element={<CandidateApplications />}
                />

                <Route
                    path="/candidate/assessments"
                    element={<CandidateAssessments />}
                />

                <Route
                    path="/candidate/assessments/:assessmentId"
                    element={<CandidateAssessment />}
                />

                {/* Candidate Interviews */}

                <Route
                    path="/candidate/interviews"
                    element={<CandidateInterviews />}
                />

                <Route
                    path="/candidate/interviews/:interviewId"
                    element={
                        <CandidateInterviewDetails />
                    }
                />

                {/* Candidate Offers */}

                <Route
                    path="/candidate/offers"
                    element={<CandidateOffers />}
                />

                {/* Candidate Profile */}

                <Route
                    path="/candidate/profile"
                    element={<CandidateProfile />}
                />
            </Route>

            {/* =============================================
                INTERVIEWER ROUTES
            ============================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["Interviewer"]}
                    />
                }
            >

                {/* Interviewer Root */}

                <Route
                    path="/interviewer"
                    element={
                        <Navigate
                            to="/interviewer/dashboard"
                            replace
                        />
                    }
                />

                {/* Interviewer Dashboard */}

                <Route
                    path="/interviewer/dashboard"
                    element={
                        <InterviewerDashboard />
                    }
                />

                {/* My Interviews */}

                <Route
                    path="/interviewer/interviews"
                    element={
                        <InterviewerInterviews />
                    }
                />

                {/* Interview Details */}

                <Route
                    path="/interviewer/interviews/:id"
                    element={
                        <InterviewerInterviewDetails />
                    }
                />

                {/* =========================================
                    NEW: INTERVIEW EVALUATION
                ========================================= */}

                <Route
                    path="/interviewer/interviews/:id/evaluation"
                    element={
                        <InterviewerEvaluation />
                    }
                />

            </Route>

            {/* =============================================
                DEFAULT ROUTE
            ============================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            {/* =============================================
                UNKNOWN ROUTES
            ============================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;