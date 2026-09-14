const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard']
    },
    tags: {
        type: [String],
        required: true,
        enum: ['array','string','linkedList', 'graph', 'dp','tree','binaryTree','binarySearchTree','stack', 'queue', 'heap', 'hashMap', 'hashing','binarySearch','twoPointers', 'slidingWindow','recursion','backtracking','greedy','sorting','searching','matrix','trie','bitManipulation','math','numberTheory','unionFind','segmentTree','divideAndConquer','simulation','design','topologicalSort','shortestPath','binaryIndexedTree'],
        validate: {
            validator: arr => arr.length > 0,
            message: 'At least one tag is required'
        }
    },
    companies:{
        type:[String]
    },
    problemNumber: {
        type: Number,
        unique: true
    },
    constraints: {
        type: [String],
        required: true,
        validate: {
            validator: arr => arr.length > 0,
            message: 'At least one constraint is required'
        }
    },
    hints: {
        type: [String]
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ],
    startCode:[
        {
            language:{
                type:String,
                required:true
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],
    referenceSolution:[
        {
            language:{
                type:String,
                required:true
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],
    problemCreator:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'user'
    }
}, { timestamps: true })

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;