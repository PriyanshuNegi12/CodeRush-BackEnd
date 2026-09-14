const axios = require('axios');

const getLanguageById = (lang) => {
    const LANGUAGE_MAP = {
        "javascript": { language: "nodejs", versionIndex: "4" },
        "c++":        { language: "cpp17",  versionIndex: "1" },
        "java":     { language: "java", versionIndex: "4" },
    };
    return LANGUAGE_MAP[lang.toLowerCase()];
};

const STATUS = {
    ACCEPTED: 3,
    COMPILATION_ERROR: 4,
    OTHER_ERROR: 5,
};

const submitOne = async ({ source_code, language, versionIndex, stdin, expected_output }) => {
    try {
        const { data } = await axios.post(
            "https://api.jdoodle.com/v1/execute",
            {
                clientId: process.env.JDOODLE_CLIENT_ID,
                clientSecret: process.env.JDOODLE_CLIENT_SECRET,
                script: source_code,
                language,
                versionIndex,
                stdin,
            },
            { timeout: 10000 }
        );

        const { output, statusCode, cpuTime, memory } = data;

        if (statusCode !== 200) {
            return { status: STATUS.OTHER_ERROR, output, expected: expected_output, cpuTime, memory };
        }

        const passed = (output || "").trim() === (expected_output || "").trim();

        return {
            status: passed ? STATUS.ACCEPTED : STATUS.OTHER_ERROR,
            output,
            expected: expected_output,
            cpuTime,
            memory,
        };

    } catch (err) {
        const isTimeout = err.code === "ECONNABORTED";
        return {
            status: STATUS.OTHER_ERROR,
            output: isTimeout ? "Time Limit Exceeded" : (err.response?.data?.error || err.message),
            expected: expected_output,
            cpuTime: 0,
            memory: 0,
        };
    }
};

const submitBatch = async (submissions) => {
    return Promise.all(submissions.map(submitOne));
};

module.exports = {getLanguageById, submitBatch, STATUS};