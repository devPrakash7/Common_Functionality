const { ObjectId } = require('mongoose').Types;
const programs = require('../../models/programs.model')
const userEnrolledProgram = require('../../models/UserEnrolledProgram.model')
const User = require('../../models/user.model')
const dateFormat = require('../../helper/dateformat.helper');

const { DATA_LIMIT, PROGRAM_DEFAULT_STATUS, WORKOUT_DEFAULT_STATUS } = require('../../config/constants')


exports.getRecommendedProgram = async (userId, skill_level_arr, program_type) => {
    try {
        
        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);

        program_type = [...program_type]
        const program_type_num = program_type.map(Number);

        console.log("program_type_num..",program_type_num)

        
        const data = await programs.aggregate([
            {
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    program_type: {
                        $in: program_type_num
                    },
                    is_recommended: true,
                    status: 1
                }
            },
            { 
                $sort : { 
                    'order' : 1,
                    'created_at': -1
                } 
            },
            {
                $limit: DATA_LIMIT
            },
            {
                $lookup: {
                    from: 'user_enrolled_program',
                    let: {
                        userId: userId,
                        programId: '$_id'

                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$program_id', '$$programId']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user_enrolled_program'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: { $cond: { if: { $isArray: "$user_enrolled_program" }, then: { $size: "$user_enrolled_program" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_enrolled_program', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_enrolled_program.completion_count"
                        }
                    },
                    is_enrolled: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ['$user_enrolled_program.status', 1]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_enrolled_program': 0
                }
            },
            // { 
            //     $sort : { 
            //         'order' : 1,
            //         'created_at': -1
            //     } 
            // }
        ]);

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};


exports.getProgramListTags = async (userId, skill_level_arr, program_type) => {
    try {
        
        skill_level_arr = [...skill_level_arr]
        var skill_level_num = skill_level_arr.map(Number);

        program_type = [...program_type]
        const program_type_num = program_type.map(Number);

        const data = await programs.aggregate([
            {
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    program_type: {
                        $in: program_type_num
                    },
                    is_recommended: false,
                    status: 1
                }
            },
            {
                $unwind: "$tag_ids"
            },
            { 
                $sort : { 
                    'order' : 1,
                    'created_at': -1
                } 
            },
            {
                $group:
                {
                    _id: '$tag_ids',
                    allProgram: {
                        $push: "$$ROOT"
                    }
                }
            },
            // { 
            //     $sort : { 
            //         'order' : 1,
            //         'created_at': -1
            //     } 
            // },
            {
                $project:
                {
                    topFive:
                    {
                        $slice:
                            ["$allProgram", DATA_LIMIT]
                    }
                }
            },
            {
                $unwind: "$topFive"
            },
            {
                $replaceRoot: {
                    "newRoot": "$topFive"
                }
            },
            {
                $lookup: {
                    from: 'user_enrolled_program',
                    let: {
                        userId: userId,
                        programId: '$_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$program_id', '$$programId']
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user_enrolled_program_data'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: { $cond: { if: { $isArray: "$user_enrolled_program_data" }, then: { $size: "$user_enrolled_program_data" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_enrolled_program_data', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_enrolled_program_data.completion_count"
                        }
                    },
                    is_enrolled: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ['$user_enrolled_program_data.status', 1]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_enrolled_program_data': 0
                }
            },
            {
                $group:
                {
                    _id: {
                        _id: "$_id",
                        name: "$name",
                        status: "$status",
                        order: "$order",
                        skill_level: "$skill_level",
                        is_free: "$is_free",
                        is_recommended: "$is_recommended",
                        number_of_workout: "$number_of_workout",
                        suggested_FGM: "$suggested_FGM",
                        suggested_FGA: "$suggested_FGA",
                        program_type: "$program_type",
                        is_star: "$is_star",
                        image: "$image",
                        description: "$description",
                        updated_at: "$updated_at",
                        created_at: "$created_at",
                        completion_count: "$completion_count",
                        is_enrolled: "$is_enrolled"
                    },
                    tag_ids: { $addToSet: "$tag_ids" }
                }
            },
            {
                $addFields: {
                    "_id.tag_ids": "$tag_ids"
                }
            },
            {
                $replaceRoot: {
                    "newRoot": "$_id"
                }
            }
            // { 
            //     $sort : { 
            //         'order' : 1,
            //         'created_at': -1
            //     } 
            // }
        ]);

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.checkEnrolledProgram = async (userId, programId) => {
    try {
        console.log(userId, programId)
        const data = await userEnrolledProgram.findOne({ user_id: userId, program_id: programId })

        return data
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}


exports.addEnrolledProgram = data => new userEnrolledProgram(data).save();

exports.updateEnrolledProgram = async (reqData, conditionData) => {
    try {
        console.log("reqData, conditionData.........", reqData, conditionData)

        const { nModified } = await userEnrolledProgram.update(
            reqData,
            {
                $set: conditionData
            },
            {
                runValidators: true
            }
        )

        return nModified
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}

exports.getProgramListTagsWise = async (userId, skill_level_arr, program_type, tagId, page, limit) => {
    try {

        console.log("(userId, skill_level_arr, program_type, tagId, page, limit)",userId, skill_level_arr, program_type, tagId, page, limit)

        
        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);

        program_type = [...program_type]
        const program_type_num = program_type.map(Number);

        let query = (tagId == '1') ? { is_recommended: true } : { tag_ids: ObjectId(tagId) }
        query.status = 1


        const data = await programs.aggregate([
            {
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    program_type: {
                        $in: program_type_num
                    },
                    status: 1,
                    ...query
                }
            },
            {
                $lookup: {
                    from: 'user_enrolled_program',
                    let: {
                        userId: userId,
                        programId: '$_id'

                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$program_id', '$$programId']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user_enrolled_program'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: { $cond: { if: { $isArray: "$user_enrolled_program" }, then: { $size: "$user_enrolled_program" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_enrolled_program', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_enrolled_program.completion_count"
                        }
                    },
                    is_enrolled: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ['$user_enrolled_program.status', 1]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_enrolled_program': 0
                }
            },
            { 
                $sort : { 
                    'order' : 1,
                    'created_at': -1
                } 
            },
            {
                $skip: ((page - 1) * limit)
            },
            {
                $limit: limit
            }
            
        ]);

        return data;

    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}

exports.getProgramDetailsData = async (userId, programId) => {
    try {

        console.log("userId.......", userId, programId)

        const data = await programs.aggregate([
            {
                $match: {
                    _id: ObjectId(programId)
                }
            },
            {
                $lookup: {
                    from: 'user_enrolled_program',
                    let: {
                        userId: userId,
                        programId: '$_id'

                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$program_id', '$$programId']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user_enrolled_program'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: { $cond: { if: { $isArray: "$user_enrolled_program" }, then: { $size: "$user_enrolled_program" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_enrolled_program', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_enrolled_program.completion_count"
                        }
                    },
                    is_enrolled: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ['$user_enrolled_program.status', 1]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "program_workouts",
                    localField: "_id",
                    foreignField: "program_id",
                    as: "program_workouts_data"
                }
            },
            {
                $unwind: '$program_workouts_data',
            },
            {
                $lookup: {
                    from: "workouts",
                    localField: "program_workouts_data.workout_id",
                    foreignField: "_id",
                    as: "program_workouts_data.workouts_data"
                }
            },
            {
                $unwind: '$program_workouts_data.workouts_data',
            },
            // {
            //     $addFields: {
            //         'tanvir1': '$program_workouts_data.workout_id'
            //     }
            // },

            // {
            //     $lookup: {
            //         from: 'user_favourite_workouts',
            //         let: {
            //             userId: userId,
            //             workout_id: '$program_workouts_data.workout_id'
            //         },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             {
            //                                 $eq: ['$user_id', '$$userId']
            //                             },
            //                             {
            //                                 $eq: ['$workout_id', '$$workout_id']
            //                             },
            //                         ]
            //                     }
            //                 }
            //             }
            //         ],
            //         as: 'program_workouts_data.user_favourite_workout_data'
            //     }
            // },
            // {
            //     $addFields: {
            //         'program_workouts_data.isUserComplitionData': {
            //             $cond: {
            //                 if: {
            //                     $isArray: "$program_workouts_data.user_favourite_workout_data"
            //                 },
            //                 then: {
            //                     $size: "$program_workouts_data.user_favourite_workout_data"
            //                 },
            //                 else: 0
            //             }
            //         }
            //     }
            // },
            // {
            //     $unwind: {
            //         path: '$program_workouts_data.user_favourite_workout_data',
            //         preserveNullAndEmptyArrays: true
            //     }
            // },



            {
                $lookup: {
                    from: 'user_favourite_workouts',
                    let: {
                        userId: userId,
                        workout_id: '$program_workouts_data.workout_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$workout_id', '$$workout_id']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'program_workouts_data.user_favourite_workout_data'
                }
            },
            {
                $addFields: {
                    'program_workouts_data.isUserFavouriteWorkoutData': {
                        $cond: {
                            if: {
                                $isArray: "$program_workouts_data.user_favourite_workout_data"
                            },
                            then: {
                                $size: "$program_workouts_data.user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$program_workouts_data.user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },

            


            {
                $lookup: {
                    from: 'user_workout_completion',
                    let: {
                        userId: userId,
                        workout_id: '$program_workouts_data.workout_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$workout_id', '$$workout_id']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'program_workouts_data.user_workout_completion_data'
                }
            },
            {
                $addFields: {
                    'program_workouts_data.isUserFavouriteWorkoutData': {
                        $cond: {
                            if: {
                                $isArray: "$program_workouts_data.user_workout_completion_data"
                            },
                            then: {
                                $size: "$program_workouts_data.user_workout_completion_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$program_workouts_data.user_workout_completion_data',
                    preserveNullAndEmptyArrays: true
                }
            },




            {
                $addFields: {
                    'program_workouts_data.completion_count': {
                        $cond: {
                            if: {
                                $eq: ['$program_workouts_data.isUserFavouriteWorkoutData', 0]
                            },
                            then: 0,
                            else: "$program_workouts_data.user_workout_completion_data.completion_count"
                        }
                    },
                    'program_workouts_data.is_favorite': {
                        $cond: {
                            if: {
                                $and: {
                                    $eq: ['$program_workouts_data.isUserFavouriteWorkoutData', 1],
                                    $eq: ['$program_workouts_data.user_favourite_workout_data.status', 1]
                                }
                            },
                            then: true,
                            else: false
                        }
                    },
                    'program_workouts_data.test': '$program_workouts_data.isUserFavouriteWorkoutData',
                    'program_workouts_data.test1': '$program_workouts_data.user_favourite_workout_data.status'

                }
            },
            {
                $addFields: {
                    'program_workouts_data.workout_name': '$program_workouts_data.workouts_data.name',
                    'program_workouts_data.tag_ids': '$program_workouts_data.workouts_data.tag_ids',
                    'program_workouts_data.number_of_drill': '$program_workouts_data.workouts_data.number_of_drill',
                    'program_workouts_data.suggested_FGM': '$program_workouts_data.workouts_data.suggested_FGM',
                    'program_workouts_data.suggested_FGA': '$program_workouts_data.workouts_data.suggested_FGA',
                    'program_workouts_data.image': '$program_workouts_data.workouts_data.image',
                    'program_workouts_data.status': '$program_workouts_data.workouts_data.status',
                    // 'program_workouts_data.completion_count': '$program_workouts_data.workouts_data.completion_count',
                    // 'program_workouts_data.is_favorite': '$program_workouts_data.workouts_data.is_favorite',
                }
            },
// //--

//  ////1           

            {
                $lookup: {
                    from: "user_workout_status",
                    localField: "program_workouts_data._id",
                    foreignField: "workout_program_id",
                    as: "user_workout_status_data"
                }
            },
            {
                $addFields: {
                    workoutStatus: { $cond: { if: { $isArray: "$user_workout_status_data" }, then: { $size: "$user_workout_status_data" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_workout_status_data', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    "program_workouts_data.workout_color": {
                        $cond:
                        {
                            if: {
                                $eq: ['$workoutStatus', 0]
                            },
                            then: WORKOUT_DEFAULT_STATUS,
                            else: "$user_workout_status_data.status",
                        }
                    }
                },
            },
            {
                $project: {
                    'isUserFavouriteWorkoutData': 0,
                    'user_enrolled_program': 0,
                    'user_workout_status_data': 0,
                    'program_workouts_data.workouts_data': 0,
                    'program_workouts_data.isUserFavouriteWorkoutData': 0,
                    'program_workouts_data.user_favourite_workout_data': 0,
                    
                }
            },
            {
                $group:
                {
                    _id: {
                        _id: "$_id",
                        name: "$name",
                        status: "$status",
                        order: "$order",
                        skill_level: "$skill_level",
                        is_free: "$is_free",
                        is_recommended: "$is_recommended",
                        number_of_workout: "$number_of_workout",
                        suggested_FGM: "$suggested_FGM",
                        suggested_FGA: "$suggested_FGA",
                        program_type: "$program_type",
                        is_star: "$is_star",
                        image: "$image",
                        // workout_status: "$workout_status",
                        description: "$description",
                        updated_at: "$updated_at",
                        created_at: "$created_at",
                        completion_count: "$completion_count",
                        is_enrolled: "$is_enrolled",
                        tag_Ids: "$tag_Ids"
                    },
                    workout_data: {
                        $push: "$program_workouts_data"
                    }
                }
            },
            {
                $addFields: {
                    '_id.workout_data': '$workout_data',
                }
            },
            {
                $replaceRoot: {
                    "newRoot": "$_id"
                }
            },
        ])

        console.log("data....",data)

        return data

    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}

exports.enrolledProgramList = async (userId, page, limit) => {
    try {

        const data = await programs.aggregate([
            {
                $lookup: {
                    from: 'user_enrolled_program',
                    let: {
                        userId: userId,
                        programId: '$_id',
                        status: 1
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$program_id', '$$programId']
                                        },
                                        {
                                            $eq: ['$status', '$$status']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user_enrolled_program'
                }
            },
            {
                $unwind: { path: '$user_enrolled_program' }
            },
            {
                $addFields: {
                    completion_count: "$user_enrolled_program.completion_count",
                    is_enrolled: true
                }
            },
            {
                $project: {
                    'user_enrolled_program': 0
                }
            },
            {
                $skip: ((page - 1) * limit)
            },
            {
                $limit: limit
            },
            { 
                $sort : { 
                    // 'order' : 1,
                    'created_at': -1
                } 
            }
        ]);
        
        return data;

    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}




exports.getProgramListTagsWiseCount = async (userId, skill_level_arr, program_type, tagId, page, limit) => {
    try {

        console.log("(userId, skill_level_arr, program_type, tagId, page, limit)",userId, skill_level_arr, program_type, tagId, page, limit)

        
        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);

        program_type = [...program_type]
        const program_type_num = program_type.map(Number);

        let query = (tagId == '1') ? { is_recommended: true } : { tag_ids: ObjectId(tagId) }

        console.log("query....",query)

        const data = await programs.aggregate([
            {
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    program_type: {
                        $in: program_type_num
                    },
                    status: 1,
                    ...query
                }
            },
            {
                $lookup: {
                    from: 'user_enrolled_program',
                    let: {
                        userId: userId,
                        programId: '$_id'

                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$user_id', '$$userId']
                                        },
                                        {
                                            $eq: ['$program_id', '$$programId']
                                        },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user_enrolled_program'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: { $cond: { if: { $isArray: "$user_enrolled_program" }, then: { $size: "$user_enrolled_program" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_enrolled_program', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_enrolled_program.completion_count"
                        }
                    },
                    is_enrolled: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ['$user_enrolled_program.status', 1]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_enrolled_program': 0
                }
            }
        ]);

        return data.length;

    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}