import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateLayout from "../../components/CandidateLayout";
import api from "../../services/api";

const CandidateAssessment = () => {

    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [timeLeft, setTimeLeft] = useState(null);

    const [showSubmitModal, setShowSubmitModal] =
        useState(false);

    const [result, setResult] = useState(null);

    const [completed, setCompleted] = useState(false);


    // ==================================================
    // START ASSESSMENT
    // ==================================================

    useEffect(() => {
        startAssessment();
    }, [assessmentId]);


    const startAssessment = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.post(
                `/CandidateAssessment/${assessmentId}/start`
            );

            const data = response.data;

            setAssessment(data);

            if (
                !data.questions ||
                data.questions.length === 0
            ) {
                setError(
                    "This assessment does not have any questions yet."
                );

                return;
            }

            setTimeLeft(
                Number(
                    data.durationMinutes || 30
                ) * 60
            );

        } catch (error) {

            console.error(
                "Error starting assessment:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to start the assessment."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // TIMER
    // ==================================================

    useEffect(() => {

        if (
            loading ||
            completed ||
            timeLeft === null ||
            timeLeft <= 0
        ) {
            return;
        }

        const timer = setInterval(() => {

            setTimeLeft(
                (previousTime) => {

                    if (previousTime <= 1) {

                        clearInterval(timer);

                        submitAssessment();

                        return 0;
                    }

                    return previousTime - 1;
                }
            );

        }, 1000);

        return () => clearInterval(timer);

    }, [
        loading,
        completed,
        timeLeft
    ]);


    // ==================================================
    // FORMAT TIMER
    // ==================================================

    const formatTime = (seconds) => {

        if (seconds === null) {
            return "00:00";
        }

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };


    // ==================================================
    // SELECT ANSWER
    // ==================================================

    const selectAnswer = (
        questionId,
        answer
    ) => {

        setAnswers(
            (previousAnswers) => ({
                ...previousAnswers,
                [questionId]: answer
            })
        );

    };


    // ==================================================
    // NEXT QUESTION
    // ==================================================

    const nextQuestion = () => {

        if (
            assessment &&
            currentQuestion <
            assessment.questions.length - 1
        ) {

            setCurrentQuestion(
                currentQuestion + 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

    };


    // ==================================================
    // PREVIOUS QUESTION
    // ==================================================

    const previousQuestion = () => {

        if (currentQuestion > 0) {

            setCurrentQuestion(
                currentQuestion - 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


    // ==================================================
    // GO TO QUESTION
    // ==================================================

    const goToQuestion = (index) => {

        setCurrentQuestion(index);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // ==================================================
    // SUBMIT
    // ==================================================

    const submitAssessment = async () => {

        if (
            !assessment ||
            submitting
        ) {
            return;
        }

        try {

            setSubmitting(true);

            const formattedAnswers =
                assessment.questions.map(
                    (question) => ({
                        questionId:
                            question.id,

                        selectedAnswer:
                            answers[
                            question.id
                            ] || ""
                    })
                );

            const response =
                await api.post(
                    `/CandidateAssessment/${assessmentId}/submit`,
                    {
                        answers:
                            formattedAnswers
                    }
                );

            setResult(
                response.data
            );

            setCompleted(true);

            setShowSubmitModal(false);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(
                "Error submitting assessment:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to submit the assessment."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <CandidateLayout
                activePage="assessments"
            >

                <div className="assessment-page">

                    <div className="state-card">

                        <div className="spinner"></div>

                        <h2>
                            Preparing Assessment...
                        </h2>

                        <p>
                            Please wait while your
                            assessment is being loaded.
                        </p>

                    </div>

                </div>

                <AssessmentStyles />

            </CandidateLayout>
        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (
            <CandidateLayout
                activePage="assessments"
            >

                <div className="assessment-page">

                    <div className="state-card">

                        <div className="error-icon">
                            !
                        </div>

                        <h2>
                            Unable to Start Assessment
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/candidate/assessments"
                                )
                            }
                        >
                            ← Back to Assessments
                        </button>

                    </div>

                </div>

                <AssessmentStyles />

            </CandidateLayout>
        );

    }


    // ==================================================
    // RESULT
    // ==================================================

    if (
        completed &&
        result
    ) {

        return (
            <CandidateLayout
                activePage="assessments"
            >

                <div className="assessment-page">

                    <div className="result-card">

                        <div
                            className={
                                result.isPassed
                                    ? "result-icon passed"
                                    : "result-icon failed"
                            }
                        >
                            {result.isPassed
                                ? "✓"
                                : "!"}
                        </div>

                        <span
                            className={
                                result.isPassed
                                    ? "result-badge passed"
                                    : "result-badge failed"
                            }
                        >
                            {result.isPassed
                                ? "Assessment Passed"
                                : "Assessment Not Passed"}
                        </span>

                        <h1>
                            {result.assessmentTitle}
                        </h1>

                        <div className="score">
                            {result.percentage}%
                        </div>

                        <p>
                            Your assessment has
                            been completed.
                        </p>

                        <div className="result-grid">

                            <div>
                                <span>
                                    Total Questions
                                </span>

                                <strong>
                                    {result.totalQuestions}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Correct Answers
                                </span>

                                <strong>
                                    {result.correctAnswers}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Marks Obtained
                                </span>

                                <strong>
                                    {result.obtainedMarks}
                                    /
                                    {result.totalMarks}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Passing Score
                                </span>

                                <strong>
                                    {
                                        assessment.passingScore
                                    }%
                                </strong>
                            </div>

                        </div>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/candidate/assessments"
                                )
                            }
                        >
                            ← Back to Assessments
                        </button>

                    </div>

                </div>

                <AssessmentStyles />

            </CandidateLayout>
        );

    }


    // ==================================================
    // CURRENT QUESTION
    // ==================================================

    const question =
        assessment.questions[
        currentQuestion
        ];

    const totalQuestions =
        assessment.questions.length;

    const answeredCount =
        Object.keys(answers).filter(
            (id) => answers[id]
        ).length;

    const progress =
        ((currentQuestion + 1) /
            totalQuestions) *
        100;

    const isFirst =
        currentQuestion === 0;

    const isLast =
        currentQuestion ===
        totalQuestions - 1;


    // ==================================================
    // MAIN SCREEN
    // ==================================================

    return (
        <CandidateLayout
            activePage="assessments"
        >

            <div className="assessment-page">

                {/* HEADER */}

                <div className="assessment-header">

                    <div>

                        <span className="page-label">
                            CANDIDATE ASSESSMENT
                        </span>

                        <h1>
                            {assessment.title}
                        </h1>

                        <p>
                            {assessment.jobTitle}
                        </p>

                    </div>

                    <div
                        className={
                            timeLeft <= 60
                                ? "timer danger"
                                : "timer"
                        }
                    >

                        <span>
                            ⏱
                        </span>

                        <div>

                            <small>
                                Time Remaining
                            </small>

                            <strong>
                                {formatTime(
                                    timeLeft
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* PROGRESS */}

                <div className="progress-card">

                    <div className="progress-info">

                        <span>
                            Question{" "}
                            {currentQuestion + 1}
                            {" "}of{" "}
                            {totalQuestions}
                        </span>

                        <span>
                            {answeredCount} answered
                        </span>

                    </div>

                    <div className="progress-bar">

                        <div
                            className="progress-fill"
                            style={{
                                width:
                                    `${progress}%`
                            }}
                        />

                    </div>

                </div>


                {/* CONTENT */}

                <div className="assessment-layout">

                    {/* QUESTION */}

                    <div className="question-card">

                        <div className="question-top">

                            <span>
                                Question{" "}
                                {currentQuestion + 1}
                            </span>

                            <span>
                                {question.marks}{" "}
                                {question.marks === 1
                                    ? "Mark"
                                    : "Marks"}
                            </span>

                        </div>


                        <h2>
                            {question.questionText}
                        </h2>


                        {/* OPTIONS */}

                        <div className="options">

                            {[
                                {
                                    key: "A",
                                    text:
                                        question.optionA
                                },
                                {
                                    key: "B",
                                    text:
                                        question.optionB
                                },
                                {
                                    key: "C",
                                    text:
                                        question.optionC
                                },
                                {
                                    key: "D",
                                    text:
                                        question.optionD
                                }
                            ].map(
                                (option) => {

                                    const selected =
                                        answers[
                                        question.id
                                        ] ===
                                        option.key;

                                    return (
                                        <button
                                            type="button"
                                            key={
                                                option.key
                                            }
                                            className={
                                                selected
                                                    ? "option selected"
                                                    : "option"
                                            }
                                            onClick={() =>
                                                selectAnswer(
                                                    question.id,
                                                    option.key
                                                )
                                            }
                                        >

                                            <span className="option-letter">
                                                {
                                                    option.key
                                                }
                                            </span>

                                            <span className="option-text">
                                                {
                                                    option.text
                                                }
                                            </span>

                                            {selected && (
                                                <span className="check">
                                                    ✓
                                                </span>
                                            )}

                                        </button>
                                    );
                                }
                            )}

                        </div>


                        {/* NAVIGATION */}

                        <div className="navigation">

                            <button
                                className="secondary-button"
                                onClick={
                                    previousQuestion
                                }
                                disabled={
                                    isFirst
                                }
                            >
                                ← Previous
                            </button>


                            {!isLast ? (

                                <button
                                    className="primary-button"
                                    onClick={
                                        nextQuestion
                                    }
                                >
                                    Next Question →
                                </button>

                            ) : (

                                <button
                                    className="submit-button"
                                    onClick={() =>
                                        setShowSubmitModal(
                                            true
                                        )
                                    }
                                >
                                    Submit Assessment
                                </button>

                            )}

                        </div>

                    </div>


                    {/* QUESTION NAVIGATION */}

                    <div className="sidebar-card">

                        <h3>
                            Questions
                        </h3>

                        <p>
                            {answeredCount}/
                            {totalQuestions} answered
                        </p>


                        <div className="question-grid">

                            {assessment.questions.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const answered =
                                        Boolean(
                                            answers[
                                            item.id
                                            ]
                                        );

                                    return (
                                        <button
                                            type="button"
                                            key={
                                                item.id
                                            }
                                            className={[
                                                index ===
                                                    currentQuestion
                                                    ? "current"
                                                    : "",

                                                answered
                                                    ? "answered"
                                                    : ""
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    " "
                                                )}
                                            onClick={() =>
                                                goToQuestion(
                                                    index
                                                )
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    );

                                }
                            )}

                        </div>


                        <div className="assessment-info">

                            <div>

                                <span>
                                    Duration
                                </span>

                                <strong>
                                    {
                                        assessment.durationMinutes
                                    }{" "}
                                    minutes
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Passing Score
                                </span>

                                <strong>
                                    {
                                        assessment.passingScore
                                    }%
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                {/* SUBMIT MODAL */}

                {showSubmitModal && (

                    <div className="modal-overlay">

                        <div className="modal">

                            <div className="modal-icon">
                                ?
                            </div>

                            <h2>
                                Submit Assessment?
                            </h2>

                            <p>
                                You have answered{" "}
                                <strong>
                                    {answeredCount}
                                </strong>{" "}
                                out of{" "}
                                <strong>
                                    {totalQuestions}
                                </strong>{" "}
                                questions.
                            </p>

                            {answeredCount <
                                totalQuestions && (

                                    <div className="warning">
                                        You still have unanswered
                                        questions. You can still
                                        submit the assessment.
                                    </div>

                                )}

                            <div className="modal-actions">

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowSubmitModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Continue
                                </button>

                                <button
                                    className="submit-button"
                                    onClick={
                                        submitAssessment
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Yes, Submit"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

            <AssessmentStyles />

        </CandidateLayout>
    );
};


// ======================================================
// STYLES
// ======================================================

const AssessmentStyles = () => (

    <style>{`

        .assessment-page {
            min-height: calc(100vh - 70px);
            background: #f7f9fc;
            padding: 28px 32px 50px;
        }

        .assessment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 22px;
        }

        .page-label {
            color: #2d6ee8;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .assessment-header h1 {
            margin: 6px 0;
            color: #172033;
            font-size: 26px;
        }

        .assessment-header p {
            margin: 0;
            color: #737e90;
            font-size: 14px;
        }

        .timer {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 165px;
            padding: 12px 16px;
            background: white;
            border: 1px solid #dfe5ee;
            border-radius: 12px;
        }

        .timer > span {
            font-size: 20px;
        }

        .timer div {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .timer small {
            color: #8993a4;
            font-size: 11px;
        }

        .timer strong {
            color: #172033;
            font-size: 20px;
        }

        .timer.danger {
            background: #fff7f7;
            border-color: #edbcbc;
        }

        .timer.danger strong {
            color: #d64545;
        }

        .progress-card {
            padding: 15px 18px;
            margin-bottom: 22px;
            background: white;
            border: 1px solid #e4e9f1;
            border-radius: 13px;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 9px;
            color: #697487;
            font-size: 12px;
        }

        .progress-bar {
            height: 7px;
            overflow: hidden;
            background: #edf1f6;
            border-radius: 20px;
        }

        .progress-fill {
            height: 100%;
            background: #2d6ee8;
            border-radius: 20px;
            transition: width .25s ease;
        }

        .assessment-layout {
            display: grid;
            grid-template-columns:
                minmax(0, 1fr) 280px;
            gap: 22px;
            align-items: start;
        }

        .question-card,
        .sidebar-card {
            background: white;
            border: 1px solid #e4e9f1;
            border-radius: 16px;
            box-shadow:
                0 4px 16px
                rgba(31,45,61,.04);
        }

        .question-card {
            padding: 28px;
        }

        .question-top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 22px;
            color: #2d6ee8;
            font-size: 13px;
            font-weight: 700;
        }

        .question-top span:last-child {
            padding: 6px 10px;
            background: #f5f7fa;
            color: #737e90;
            border-radius: 20px;
        }

        .question-card h2 {
            margin: 0 0 27px;
            color: #172033;
            font-size: 21px;
            line-height: 1.5;
        }

        .options {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .option {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 14px;
            text-align: left;
            background: white;
            border: 1px solid #dfe5ee;
            border-radius: 11px;
            color: #344054;
            cursor: pointer;
            transition: .18s ease;
        }

        .option:hover {
            background: #fbfcff;
            border-color: #9db8e9;
        }

        .option.selected {
            background: #f1f6ff;
            border-color: #2d6ee8;
        }

        .option-letter {
            width: 35px;
            height: 35px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f4f8;
            border-radius: 9px;
            font-size: 13px;
            font-weight: 700;
        }

        .option.selected .option-letter {
            background: #2d6ee8;
            color: white;
        }

        .option-text {
            flex: 1;
            font-size: 14px;
            line-height: 1.5;
        }

        .check {
            width: 23px;
            height: 23px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #2d6ee8;
            color: white;
            border-radius: 50%;
            font-size: 12px;
        }

        .navigation {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 28px;
            padding-top: 21px;
            border-top: 1px solid #edf0f5;
        }

        .primary-button,
        .secondary-button,
        .submit-button {
            padding: 11px 18px;
            border-radius: 9px;
            font-size: 13px;
            font-weight: 650;
            cursor: pointer;
        }

        .primary-button {
            border: none;
            background: #2d6ee8;
            color: white;
        }

        .secondary-button {
            background: white;
            border: 1px solid #d9e0e9;
            color: #344054;
        }

        .submit-button {
            border: none;
            background: #16834b;
            color: white;
        }

        button:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        .sidebar-card {
            padding: 19px;
        }

        .sidebar-card h3 {
            margin: 0;
            color: #172033;
            font-size: 16px;
        }

        .sidebar-card > p {
            margin: 6px 0 16px;
            color: #8a94a6;
            font-size: 12px;
        }

        .question-grid {
            display: grid;
            grid-template-columns:
                repeat(5, 1fr);
            gap: 8px;
        }

        .question-grid button {
            height: 38px;
            border: 1px solid #dfe5ee;
            background: #f8fafc;
            border-radius: 8px;
            color: #667085;
            cursor: pointer;
            font-weight: 650;
        }

        .question-grid button.current {
            background: #2d6ee8;
            border-color: #2d6ee8;
            color: white;
        }

        .question-grid button.answered:not(.current) {
            background: #ecfdf3;
            border-color: #bce5ce;
            color: #16834b;
        }

        .assessment-info {
            margin-top: 18px;
            padding-top: 14px;
            border-top: 1px solid #edf0f5;
        }

        .assessment-info div {
            display: flex;
            justify-content: space-between;
            padding: 9px 0;
            font-size: 12px;
        }

        .assessment-info span {
            color: #7a8596;
        }

        .assessment-info strong {
            color: #344054;
        }

        .state-card {
            min-height: 420px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            background: white;
            border: 1px solid #e4e9f1;
            border-radius: 16px;
            text-align: center;
        }

        .state-card h2 {
            margin: 17px 0 8px;
            color: #172033;
        }

        .state-card p {
            max-width: 500px;
            margin-bottom: 20px;
            color: #737e90;
            line-height: 1.6;
        }

        .spinner {
            width: 38px;
            height: 38px;
            border: 3px solid #e5eaf1;
            border-top-color: #2d6ee8;
            border-radius: 50%;
            animation: spin .8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .error-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff0f0;
            color: #d64545;
            border-radius: 50%;
            font-size: 23px;
            font-weight: 700;
        }

        .result-card {
            max-width: 760px;
            margin: 35px auto;
            padding: 42px;
            background: white;
            border: 1px solid #e4e9f1;
            border-radius: 18px;
            text-align: center;
        }

        .result-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 30px;
            font-weight: 700;
        }

        .result-icon.passed {
            background: #e9f9f0;
            color: #16834b;
        }

        .result-icon.failed {
            background: #fff0f0;
            color: #d64545;
        }

        .result-badge {
            display: inline-block;
            padding: 6px 13px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
        }

        .result-badge.passed {
            background: #e9f9f0;
            color: #16834b;
        }

        .result-badge.failed {
            background: #fff0f0;
            color: #d64545;
        }

        .result-card h1 {
            margin: 13px 0;
            color: #172033;
        }

        .score {
            margin: 25px auto 10px;
            color: #2d6ee8;
            font-size: 48px;
            font-weight: 750;
        }

        .result-card > p {
            color: #737e90;
            margin-bottom: 28px;
        }

        .result-grid {
            display: grid;
            grid-template-columns:
                repeat(4, 1fr);
            margin-bottom: 25px;
            border-top: 1px solid #edf0f5;
            border-bottom: 1px solid #edf0f5;
        }

        .result-grid div {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 17px 10px;
        }

        .result-grid div + div {
            border-left: 1px solid #edf0f5;
        }

        .result-grid span {
            color: #8a94a6;
            font-size: 11px;
        }

        .result-grid strong {
            color: #263247;
            font-size: 15px;
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(20,29,44,.45);
        }

        .modal {
            width: 100%;
            max-width: 430px;
            padding: 30px;
            background: white;
            border-radius: 16px;
            text-align: center;
        }

        .modal-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eef4ff;
            color: #2d6ee8;
            border-radius: 50%;
            font-size: 20px;
            font-weight: 700;
        }

        .modal h2 {
            margin: 0 0 10px;
            color: #172033;
        }

        .modal p {
            color: #737e90;
            line-height: 1.6;
        }

        .warning {
            margin: 15px 0;
            padding: 11px;
            background: #fff8e8;
            border: 1px solid #f3dfaa;
            border-radius: 8px;
            color: #806b35;
            font-size: 12px;
        }

        .modal-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }

        @media (max-width: 950px) {

            .assessment-layout {
                grid-template-columns: 1fr;
            }

        }

        @media (max-width: 650px) {

            .assessment-page {
                padding: 20px 15px 35px;
            }

            .assessment-header {
                flex-direction: column;
            }

            .timer {
                width: 100%;
            }

            .question-card {
                padding: 20px;
            }

            .question-card h2 {
                font-size: 18px;
            }

            .result-card {
                padding: 28px 18px;
            }

            .result-grid {
                grid-template-columns:
                    repeat(2, 1fr);
            }

            .result-grid div:nth-child(3) {
                border-left: none;
                border-top: 1px solid #edf0f5;
            }

            .result-grid div:nth-child(4) {
                border-top: 1px solid #edf0f5;
            }

            .navigation {
                flex-direction: column;
            }

            .navigation button {
                width: 100%;
            }

            .modal-actions {
                flex-direction: column;
            }

            .modal-actions button {
                width: 100%;
            }

        }

    `}</style>
);

export default CandidateAssessment;