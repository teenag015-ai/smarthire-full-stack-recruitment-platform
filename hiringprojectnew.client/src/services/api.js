import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "https://localhost:7254/api",

    headers: {
        "Content-Type": "application/json",
    },
});


// ==========================================
// ADD JWT TOKEN TO EVERY API REQUEST
// ==========================================

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("smartHireToken");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// ==========================================
// HANDLE API RESPONSES
// ==========================================

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {

        // ==========================================
        // UNAUTHORIZED RESPONSE
        // ==========================================

        if (error.response?.status === 401) {

            console.error(
                "Unauthorized API request:",
                error.config?.url
            );

            console.error(
                "Response:",
                error.response?.data
            );

            /*
             * Do NOT immediately remove the JWT token
             * or redirect to login.
             *
             * This prevents the application from
             * unexpectedly logging out the recruiter
             * when one API request returns 401.
             */

            return Promise.reject(error);
        }


        // ==========================================
        // RETURN OTHER ERRORS
        // ==========================================

        return Promise.reject(error);
    }
);


export default api;