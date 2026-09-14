const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, STATUS } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        if (language === 'cpp') language = 'c++';

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");

        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });

        const languageData = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language: languageData.language,
            versionIndex: languageData.versionIndex,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const testResult = await submitBatch(submissions);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status === STATUS.ACCEPTED) {
                testCasesPassed++;
                runtime += parseFloat(test.cpuTime) || 0;
                memory = Math.max(memory, parseInt(test.memory) || 0);
            } else {
                status = 'wrong';
                errorMessage = test.output;
            }
        }

        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        if (!req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        const accepted = status === 'accepted';

        res.status(201).json({
            accepted,
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory,
            error: accepted ? null : errorMessage,
        });

    } catch (err) {
        console.error('submitCode error:', err);          // full stack to terminal
        console.error('Error name:', err.name);           // e.g. ValidationError
        console.error('Error message:', err.message);  
        res.status(500).send("Internal Server Error " + err);
    }
};

const runCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        if (language === 'cpp') language = 'c++';

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");

        const languageData = getLanguageById(language);

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language: languageData.language,
            versionIndex: languageData.versionIndex,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const testResult = await submitBatch(submissions);

        let allPassed = true;
        let runtime = 0;
        let memory = 0;

        const testCases = testResult.map((test, i) => {
            const passed = test.status === STATUS.ACCEPTED;
            if (!passed) allPassed = false;
            runtime += parseFloat(test.cpuTime) || 0;
            memory = Math.max(memory, parseInt(test.memory) || 0);

            return {
                stdin: problem.visibleTestCases[i].input,
                expected_output: test.expected,
                stdout: test.output,
                status_id: test.status,
            };
        });

        res.status(201).json({
            success: allPassed,
            testCases,
            runtime,
            memory,
        });

    } catch (err) {
        res.status(500).send("Internal Server Error " + err);
    }
};

module.exports = { submitCode, runCode };