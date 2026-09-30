import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("smartHireToken");

    const user = JSON.parse(
        localStorage.getItem("smartHireUser") || "null"
    );

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        if (user.role === "Admin") {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        if (user.role === "Recruiter") {
            return (
                <Navigate
                    to="/recruiter"
                    replace
                />
            );
        }

        if (user.role === "Candidate") {
            return (
                <Navigate
                    to="/candidate"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;