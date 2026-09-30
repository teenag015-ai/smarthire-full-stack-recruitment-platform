import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import CandidateLayout from "../../components/CandidateLayout";

function CandidateProfile() {
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        phoneNumber: "",
        professionalHeadline: "",
        location: "",
        about: "",
        skills: "",
        education: "",
        experience: "",
    });

    const [selectedResume, setSelectedResume] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ----------------------------------------------------
    // Load Candidate Profile
    // ----------------------------------------------------

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/CandidateProfile");

            const data = response.data;

            setProfile(data);

            setFormData({
                phoneNumber:
                    data.phoneNumber || "",

                professionalHeadline:
                    data.professionalHeadline || "",

                location:
                    data.location || "",

                about:
                    data.about || "",

                skills:
                    data.skills || "",

                education:
                    data.education || "",

                experience:
                    data.experience || "",
            });
        } catch (err) {
            console.error(
                "Error loading candidate profile:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // Initial Load
    // ----------------------------------------------------

    useEffect(() => {
        loadProfile();
    }, []);

    // ----------------------------------------------------
    // Handle Input
    // ----------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSuccess("");
        setError("");
    };

    // ----------------------------------------------------
    // Save Profile
    // ----------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response =
                await api.put(
                    "/CandidateProfile",
                    formData
                );

            const updatedProfile =
                response.data.profile;

            setProfile(updatedProfile);

            setFormData({
                phoneNumber:
                    updatedProfile.phoneNumber || "",

                professionalHeadline:
                    updatedProfile.professionalHeadline || "",

                location:
                    updatedProfile.location || "",

                about:
                    updatedProfile.about || "",

                skills:
                    updatedProfile.skills || "",

                education:
                    updatedProfile.education || "",

                experience:
                    updatedProfile.experience || "",
            });

            setSuccess(
                "Your profile has been updated successfully."
            );
        } catch (err) {
            console.error(
                "Error updating candidate profile:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // ----------------------------------------------------
    // Select Resume
    // ----------------------------------------------------

    const handleResumeSelect = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx",
        ];

        const fileName =
            file.name.toLowerCase();

        const hasValidExtension =
            allowedExtensions.some(
                (extension) =>
                    fileName.endsWith(extension)
            );

        const hasValidMimeType =
            allowedTypes.includes(
                file.type
            );

        if (
            !hasValidExtension &&
            !hasValidMimeType
        ) {
            setError(
                "Only PDF, DOC, and DOCX resume files are allowed."
            );

            event.target.value = "";

            setSelectedResume(null);

            return;
        }

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Resume file size cannot exceed 5 MB."
            );

            event.target.value = "";

            setSelectedResume(null);

            return;
        }

        setSelectedResume(file);
    };

    // ----------------------------------------------------
    // Upload Resume
    // ----------------------------------------------------

    const handleResumeUpload = async () => {
        if (!selectedResume) {
            setError(
                "Please select a resume before uploading."
            );

            return;
        }

        try {
            setUploadingResume(true);
            setError("");
            setSuccess("");

            const formData =
                new FormData();

            formData.append(
                "resumeFile",
                selectedResume
            );

            const response =
                await api.post(
                    "/CandidateProfile/resume",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

            const updatedProfile =
                response.data.profile;

            setProfile(updatedProfile);

            setSelectedResume(null);

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            setSuccess(
                "Resume uploaded successfully."
            );
        } catch (err) {
            console.error(
                "Error uploading resume:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to upload your resume."
            );
        } finally {
            setUploadingResume(false);
        }
    };

    // ----------------------------------------------------
    // Loading State
    // ----------------------------------------------------

    if (loading) {
        return (
            <CandidateLayout activePage="profile">
                <div style={styles.loadingContainer}>

                    <div style={styles.spinner}></div>

                    <p style={styles.loadingText}>
                        Loading your profile...
                    </p>

                </div>
            </CandidateLayout>
        );
    }

    // ----------------------------------------------------
    // Page
    // ----------------------------------------------------

    return (
        <CandidateLayout activePage="profile">

            <div style={styles.page}>

                {/* Header */}
                <div style={styles.header}>

                    <div>
                        <h1 style={styles.title}>
                            My Profile
                        </h1>

                        <p style={styles.subtitle}>
                            Manage your personal and professional
                            information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/candidate/dashboard"
                            )
                        }
                        style={styles.backButton}
                    >
                        <span style={styles.backArrow}>
                            ←
                        </span>

                        Back to Dashboard
                    </button>

                </div>


                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        {error}
                    </div>
                )}


                {/* Success */}
                {success && (
                    <div style={styles.successBox}>
                        {success}
                    </div>
                )}


                {/* Profile Completion */}
                <div style={styles.completionCard}>

                    <div style={styles.completionTop}>

                        <div>

                            <h3 style={styles.cardTitle}>
                                Profile Completion
                            </h3>

                            <p style={styles.cardDescription}>
                                Complete your profile to improve
                                your visibility to recruiters.
                            </p>

                        </div>

                        <div style={styles.percentage}>
                            {profile?.profileCompletionPercentage || 0}%
                        </div>

                    </div>


                    <div style={styles.progressBackground}>

                        <div
                            style={{
                                ...styles.progressBar,
                                width: `${profile?.profileCompletionPercentage || 0}%`,
                            }}
                        />

                    </div>

                </div>


                {/* Profile Form */}
                <form
                    onSubmit={handleSubmit}
                    style={styles.form}
                >

                    {/* Personal Information */}
                    <div style={styles.card}>

                        <div style={styles.sectionHeader}>

                            <h2 style={styles.sectionTitle}>
                                Personal Information
                            </h2>

                            <p style={styles.sectionDescription}>
                                Your basic contact information.
                            </p>

                        </div>


                        <div style={styles.infoGrid}>

                            {/* Full Name */}
                            <div>

                                <label style={styles.label}>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        profile?.fullName || ""
                                    }
                                    disabled
                                    style={{
                                        ...styles.input,
                                        background: "#F5F7FA",
                                        color: "#718096",
                                        cursor: "not-allowed",
                                    }}
                                />

                            </div>


                            {/* Email */}
                            <div>

                                <label style={styles.label}>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={
                                        profile?.email || ""
                                    }
                                    disabled
                                    style={{
                                        ...styles.input,
                                        background: "#F5F7FA",
                                        color: "#718096",
                                        cursor: "not-allowed",
                                    }}
                                />

                            </div>


                            {/* Phone */}
                            <div>

                                <label style={styles.label}>
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={
                                        formData.phoneNumber
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    maxLength={20}
                                    style={styles.input}
                                />

                            </div>


                            {/* Location */}
                            <div>

                                <label style={styles.label}>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={handleChange}
                                    placeholder="e.g. Bangalore"
                                    maxLength={150}
                                    style={styles.input}
                                />

                            </div>

                        </div>

                    </div>


                    {/* Professional Information */}
                    <div style={styles.card}>

                        <div style={styles.sectionHeader}>

                            <h2 style={styles.sectionTitle}>
                                Professional Information
                            </h2>

                            <p style={styles.sectionDescription}>
                                Highlight your professional
                                background and skills.
                            </p>

                        </div>


                        <div style={styles.field}>

                            <label style={styles.label}>
                                Professional Headline
                            </label>

                            <input
                                type="text"
                                name="professionalHeadline"
                                value={
                                    formData.professionalHeadline
                                }
                                onChange={handleChange}
                                placeholder="e.g. Full Stack Developer"
                                maxLength={150}
                                style={styles.input}
                            />

                        </div>


                        <div style={styles.field}>

                            <label style={styles.label}>
                                About
                            </label>

                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                placeholder="Tell recruiters about yourself..."
                                maxLength={2000}
                                rows={5}
                                style={styles.textarea}
                            />

                            <div style={styles.characterCount}>
                                {formData.about.length}/2000
                            </div>

                        </div>


                        <div style={styles.field}>

                            <label style={styles.label}>
                                Skills
                            </label>

                            <textarea
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g. React, ASP.NET Core, C#, SQL Server, JavaScript"
                                maxLength={2000}
                                rows={4}
                                style={styles.textarea}
                            />

                        </div>

                    </div>


                    {/* Education & Experience */}
                    <div style={styles.card}>

                        <div style={styles.sectionHeader}>

                            <h2 style={styles.sectionTitle}>
                                Education & Experience
                            </h2>

                            <p style={styles.sectionDescription}>
                                Add your academic and professional
                                background.
                            </p>

                        </div>


                        <div style={styles.field}>

                            <label style={styles.label}>
                                Education
                            </label>

                            <textarea
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                placeholder="e.g. Master of Computer Applications"
                                maxLength={2000}
                                rows={4}
                                style={styles.textarea}
                            />

                        </div>


                        <div style={styles.field}>

                            <label style={styles.label}>
                                Experience
                            </label>

                            <textarea
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="Describe your internship, projects or work experience..."
                                maxLength={2000}
                                rows={5}
                                style={styles.textarea}
                            />

                        </div>

                    </div>


                    {/* Resume */}
                    <div style={styles.card}>

                        <div style={styles.sectionHeader}>

                            <h2 style={styles.sectionTitle}>
                                Resume
                            </h2>

                            <p style={styles.sectionDescription}>
                                Upload your latest resume for recruiters.
                            </p>

                        </div>


                        {/* Existing Resume */}
                        {profile?.resumeFileName ? (

                            <div style={styles.existingResume}>

                                <div style={styles.resumeIcon}>
                                    📄
                                </div>

                                <div style={styles.resumeContent}>

                                    <div style={styles.resumeTitle}>
                                        {profile.resumeFileName}
                                    </div>

                                    <div style={styles.resumeText}>
                                        Resume uploaded successfully
                                    </div>

                                </div>

                                {profile.resumeFilePath && (
                                    <a
                                        href={`https://localhost:7254${profile.resumeFilePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.viewResumeButton}
                                    >
                                        View Resume
                                    </a>
                                )}

                            </div>

                        ) : (

                            <div style={styles.noResume}>
                                <div style={styles.noResumeIcon}>
                                    📄
                                </div>

                                <div>
                                    <div style={styles.noResumeTitle}>
                                        No resume uploaded
                                    </div>

                                    <div style={styles.noResumeText}>
                                        Upload your PDF, DOC, or DOCX resume.
                                    </div>
                                </div>
                            </div>

                        )}


                        {/* Upload Area */}
                        <div style={styles.uploadArea}>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeSelect}
                                style={styles.fileInput}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                style={styles.chooseFileButton}
                            >
                                Choose Resume
                            </button>

                            <div style={styles.fileHint}>
                                PDF, DOC or DOCX • Maximum 5 MB
                            </div>

                        </div>


                        {/* Selected Resume */}
                        {selectedResume && (
                            <div style={styles.selectedFile}>

                                <div>

                                    <div style={styles.selectedFileName}>
                                        {selectedResume.name}
                                    </div>

                                    <div style={styles.selectedFileSize}>
                                        {(
                                            selectedResume.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleResumeUpload
                                    }
                                    disabled={
                                        uploadingResume
                                    }
                                    style={{
                                        ...styles.uploadButton,
                                        opacity:
                                            uploadingResume
                                                ? 0.7
                                                : 1,
                                        cursor:
                                            uploadingResume
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    {uploadingResume
                                        ? "Uploading..."
                                        : "Upload Resume"}
                                </button>

                            </div>
                        )}

                    </div>


                    {/* Actions */}
                    <div style={styles.actions}>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/candidate/dashboard"
                                )
                            }
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                ...styles.saveButton,
                                opacity:
                                    saving ? 0.7 : 1,
                                cursor:
                                    saving
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </CandidateLayout>
    );
}


// ============================================================
// Styles
// ============================================================

const styles = {

    page: {
        maxWidth: "1200px",
        margin: "0 auto",
        paddingBottom: "40px",
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
    },

    title: {
        margin: 0,
        color: "#172033",
        fontSize: "25px",
        fontWeight: "700",
    },

    subtitle: {
        margin: "7px 0 0",
        color: "#718096",
        fontSize: "13px",
    },

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        height: "36px",
        padding: "0 13px",
        border: "1px solid #DCE5F2",
        borderRadius: "7px",
        background: "#FFFFFF",
        color: "#52627A",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow:
            "0 2px 6px rgba(15,23,42,0.03)",
    },

    backArrow: {
        fontSize: "15px",
        color: "#2D6EE8",
    },

    completionCard: {
        background: "#FFFFFF",
        border: "1px solid #E4E9F1",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "18px",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)",
    },

    completionTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
    },

    cardTitle: {
        margin: 0,
        color: "#172033",
        fontSize: "15px",
        fontWeight: "700",
    },

    cardDescription: {
        margin: "5px 0 0",
        color: "#718096",
        fontSize: "12px",
    },

    percentage: {
        color: "#2D6EE8",
        fontSize: "22px",
        fontWeight: "700",
    },

    progressBackground: {
        height: "8px",
        width: "100%",
        background: "#E9EEF5",
        borderRadius: "10px",
        overflow: "hidden",
    },

    progressBar: {
        height: "100%",
        background: "#2D6EE8",
        borderRadius: "10px",
        transition: "width 0.3s ease",
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },

    card: {
        background: "#FFFFFF",
        border: "1px solid #E4E9F1",
        borderRadius: "10px",
        padding: "22px",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)",
    },

    sectionHeader: {
        marginBottom: "20px",
    },

    sectionTitle: {
        margin: 0,
        color: "#172033",
        fontSize: "16px",
        fontWeight: "700",
    },

    sectionDescription: {
        margin: "5px 0 0",
        color: "#718096",
        fontSize: "12px",
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "18px",
    },

    field: {
        marginBottom: "18px",
    },

    label: {
        display: "block",
        marginBottom: "7px",
        color: "#344054",
        fontSize: "12px",
        fontWeight: "600",
    },

    input: {
        width: "100%",
        height: "42px",
        boxSizing: "border-box",
        padding: "0 12px",
        border: "1px solid #DCE5F2",
        borderRadius: "7px",
        outline: "none",
        color: "#172033",
        fontSize: "12px",
        background: "#FFFFFF",
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        border: "1px solid #DCE5F2",
        borderRadius: "7px",
        outline: "none",
        color: "#172033",
        fontSize: "12px",
        background: "#FFFFFF",
        resize: "vertical",
        fontFamily: "inherit",
        lineHeight: "1.5",
    },

    characterCount: {
        textAlign: "right",
        marginTop: "5px",
        color: "#98A2B3",
        fontSize: "10px",
    },

    // ----------------------------------------------------
    // Resume Styles
    // ----------------------------------------------------

    existingResume: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "15px",
        marginBottom: "16px",
        border: "1px solid #DCE5F2",
        borderRadius: "8px",
        background: "#F8FAFC",
    },

    resumeIcon: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        background: "#EAF2FF",
        fontSize: "20px",
        flexShrink: 0,
    },

    resumeContent: {
        flex: 1,
        minWidth: 0,
    },

    resumeTitle: {
        color: "#344054",
        fontSize: "12px",
        fontWeight: "600",
        wordBreak: "break-word",
    },

    resumeText: {
        marginTop: "4px",
        color: "#18794E",
        fontSize: "11px",
    },

    viewResumeButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "34px",
        padding: "0 13px",
        borderRadius: "7px",
        background: "#FFFFFF",
        border: "1px solid #DCE5F2",
        color: "#2D6EE8",
        fontSize: "11px",
        fontWeight: "600",
        textDecoration: "none",
        whiteSpace: "nowrap",
    },

    noResume: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "15px",
        marginBottom: "16px",
        border: "1px dashed #C9D5E5",
        borderRadius: "8px",
        background: "#F8FAFC",
    },

    noResumeIcon: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        background: "#EAF2FF",
        fontSize: "20px",
        flexShrink: 0,
    },

    noResumeTitle: {
        color: "#344054",
        fontSize: "12px",
        fontWeight: "600",
    },

    noResumeText: {
        marginTop: "4px",
        color: "#98A2B3",
        fontSize: "11px",
    },

    uploadArea: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px",
        border: "1px dashed #C9D5E5",
        borderRadius: "8px",
        background: "#FFFFFF",
    },

    fileInput: {
        display: "none",
    },

    chooseFileButton: {
        height: "36px",
        padding: "0 14px",
        border: "1px solid #DCE5F2",
        borderRadius: "7px",
        background: "#FFFFFF",
        color: "#52627A",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },

    fileHint: {
        color: "#98A2B3",
        fontSize: "10px",
    },

    selectedFile: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        marginTop: "12px",
        padding: "12px 14px",
        border: "1px solid #DCE5F2",
        borderRadius: "7px",
        background: "#F8FAFC",
    },

    selectedFileName: {
        color: "#344054",
        fontSize: "11px",
        fontWeight: "600",
        wordBreak: "break-word",
    },

    selectedFileSize: {
        marginTop: "3px",
        color: "#98A2B3",
        fontSize: "10px",
    },

    uploadButton: {
        height: "36px",
        padding: "0 14px",
        border: "none",
        borderRadius: "7px",
        background: "#2D6EE8",
        color: "#FFFFFF",
        fontSize: "11px",
        fontWeight: "600",
        boxShadow:
            "0 3px 8px rgba(45,110,232,0.18)",
        whiteSpace: "nowrap",
    },

    // ----------------------------------------------------
    // Actions
    // ----------------------------------------------------

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        paddingBottom: "10px",
    },

    cancelButton: {
        height: "40px",
        padding: "0 18px",
        border: "1px solid #DCE5F2",
        borderRadius: "7px",
        background: "#FFFFFF",
        color: "#52627A",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },

    saveButton: {
        height: "40px",
        padding: "0 20px",
        border: "none",
        borderRadius: "7px",
        background: "#2D6EE8",
        color: "#FFFFFF",
        fontSize: "12px",
        fontWeight: "600",
        boxShadow:
            "0 3px 8px rgba(45,110,232,0.18)",
    },

    // ----------------------------------------------------
    // Messages
    // ----------------------------------------------------

    errorBox: {
        padding: "12px 15px",
        marginBottom: "18px",
        border: "1px solid #F3C4C4",
        borderRadius: "7px",
        background: "#FFF5F5",
        color: "#B42318",
        fontSize: "12px",
    },

    successBox: {
        padding: "12px 15px",
        marginBottom: "18px",
        border: "1px solid #B7E4C7",
        borderRadius: "7px",
        background: "#F1FCF5",
        color: "#18794E",
        fontSize: "12px",
    },

    // ----------------------------------------------------
    // Loading
    // ----------------------------------------------------

    loadingContainer: {
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },

    spinner: {
        width: "30px",
        height: "30px",
        border: "3px solid #E4E9F1",
        borderTop:
            "3px solid #2D6EE8",
        borderRadius: "50%",
        animation:
            "smartHireSpin 0.8s linear infinite",
    },

    loadingText: {
        marginTop: "12px",
        color: "#718096",
        fontSize: "12px",
    },
};

export default CandidateProfile;