const { getLanguageById, submitBatch } = require("../utils/problemUtility");
const Problem = require('../models/problem');
const User = require("../models/user");
const Submission = require("../models/submission");


const createProblem = async (req,res)=>{
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, companies, constraints, hints} = req.body;
    try {
        for (const { language, completeCode } of referenceSolution) {
            const languageData = getLanguageById(language); // { language: "cpp17", versionIndex: "1" }

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language: languageData.language,
                versionIndex: languageData.versionIndex,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            const submitResult = await submitBatch(submissions);
            console.log(submitResult);
            
            for(const test of submitResult){
                if(test.status!=3){
                    return res.status(400).send("Error Occured");
                }
            }
        }
        const lastProblem = await Problem.findOne().sort({ problemNumber: -1 }).select('problemNumber');
        const nextNumber = lastProblem ? lastProblem.problemNumber + 1 : 1;
        await Problem.create({
            ...req.body,
            problemNumber: nextNumber,
            problemCreator:req.result._id
        });
        res.status(201).send("Problem Saved Successfully");
    } catch (err) {
        res.status(400).send("Error: "+err.message);
    }
}

const updateProblem = async (req,res)=>{
    const {id} = req.params;
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, companies, constraints, hints} = req.body;

    try {
        if(!id){
            return res.status(400).send("Missing ID Field");
        }
        const DSAProblem = await Problem.findById(id);
        if(!DSAProblem) return res.status(404).send("ID is not present in server");

        for (const { language, completeCode } of referenceSolution) {
            const languageData = getLanguageById(language); // { language: "cpp17", versionIndex: "1" }

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language: languageData.language,
                versionIndex: languageData.versionIndex,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            const submitResult = await submitBatch(submissions);
            console.log(submitResult);
            
            for(const test of submitResult){
                if(test.status!=3){
                    return res.status(400).send("Error Occured");
                }
            }
        }
        const newProblem = await Problem.findByIdAndUpdate(id,{ ...req.body },{ runValidators: true, new: true });
        return res.status(200).send(newProblem);
    } catch (err) {
        res.status(404).send("Error: "+err.message);        
    }
}

const removeProblemById = async (req,res)=>{
    const {id} = req.params;
    try {
        if(!id) return res.status(400).send("Id is missing");
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if(!deletedProblem) return res.status(404).send("Problem is missing");

        return res.status(200).send("Successfully Deleted");
    } catch (err) {
        res.status(500).send("Error: "+err.message);
    }
}

const getProblemById = async (req,res)=>{
    const {id} = req.params;
    try {
        if(!id) return res.status(400).send("Id is missing");
        const getProblem = await Problem.findById(id).select('title description difficulty tags visibleTestCases startCode companies referenceSolution constraints hints');
        if(!getProblem) return res.status(404).send("Problem is missing");

        return res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: "+err.message);
    }
}

const getProblemAndUpdateById = async (req,res)=>{
    const {id} = req.params;
    try {
        if(!id) return res.status(400).send("Id is missing");
        const getProblem = await Problem.findById(id);
        if(!getProblem) return res.status(404).send("Problem is missing");

        return res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: "+err.message);
    }
}

const getProblemAll = async (req,res)=>{
    try {
        const getProblem = await Problem.find({})
            .select('_id problemNumber title difficulty tags companies')
            .sort({ problemNumber: 1 });
        if(getProblem.length==0) return res.status(404).send("Problems are missing");

        return res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: "+err.message);
    }
}

const solvedAllProblemByUser = async (req,res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags companies"
        });
        res.status(200).send(user);
    } catch (err) {
        res.status(404).send("Error: "+err);
    }
}

const submittedProblem = async (req,res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;
        const ans = await Submission.find({userId,problemId});
        if(ans.length==0) return  res.status(200).send("No Submission is present");
        res.status(200).send(ans);
    } catch (err) {
        res.status(404).send("Error: "+err);
    }
}

module.exports = {createProblem, updateProblem, removeProblemById, getProblemAll, getProblemById, solvedAllProblemByUser, submittedProblem, getProblemAndUpdateById};