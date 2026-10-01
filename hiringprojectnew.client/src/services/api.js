import axios from "axios";

// ==========================================
// SMART HIRE API CONFIGURATION
// ==========================================

const api = axios.create({
    baseURL: "https://smarthireapi.runasp.net/api",

    headers: {
        "Content-Type": "application/json",
    },
});


// ==========================================
// ADD JWT TOKEN TO EVERY API REQUEST
// ==========================================

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("smartHireToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
             * Do NOT automatically remove the JWT token.
             *
             * Do NOT automatically redirect to login.
             *
             * This keeps the existing project behaviour
             * unchanged when an individual API request
             * returns 401.
             */

            return Promise.reject(error);
        }


        // ==========================================
        // SERVER ERROR
        // ==========================================

        if (error.response?.status >= 500) {

            console.error(
                "SmartHire server error:",
                error.config?.url
            );

            console.error(
                "Response:",
                error.response?.data
            );

            return Promise.reject(error);
        }


        // ==========================================
        // OTHER API ERRORS
        // ==========================================

        return Promise.reject(error);
    }
);


export default api;