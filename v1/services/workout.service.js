const {
    ObjectId
} = require('mongoose').Types;
const Workout = require('../../models/workout.model')
const User = require('../../models/user.model')

const UserWorkoutCompletion = require('../../models/userWorkoutCompletion.model')
const UserFavouriteWorkouts = require('../../models/userFavouriteWorkouts.model')





const {
    DATA_LIMIT, DRILL_DEFAULT_STATUS
} = require('../../config/constants')

exports.getWorkoutDetailsData = async (WorkoutId, userId) => {
    try {

        console.log("WorkoutId...",WorkoutId)

        const data = await Workout.aggregate([{
                $match: {
                    _id: ObjectId(WorkoutId)
                }
            },
            {
                $lookup: {
                    from: "workout_drills",
                    localField: "_id",
                    foreignField: "workout_id",
                    as: "workout_drill_data"
                }
            },
            {
                $unwind: '$workout_drill_data',
            },
            {
                $lookup: {
                    from: 'user_favourite_workouts',
                    let: {
                        userId: userId,
                        workout_id: '$_id'

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
                    as: 'user_favourite_workout_data'
                }
            },
            {
                $addFields: {
                    isFavouriteComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_favourite_workout_data"
                            },
                            then: {
                                $size: "$user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $lookup: {
                    from: 'user_workout_completion',
                    let: {
                        userId: userId,
                        workout_id: '$_id'

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
                    as: 'user_workout_completion_data'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_workout_completion_data"
                            },
                            then: {
                                $size: "$user_workout_completion_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_workout_completion_data',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_favourite_workout_data.completion_count"
                        }
                    },
                    is_favorite: {
                        $cond: {
                            if: {
                                $and: {
                                    $eq: ['$isFavouriteComplitionData', 1],
                                    $eq: ['$user_favourite_workout_data.status', 1]
                                }
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },  
            {
                $lookup: {
                    from: "drills",
                    localField: "workout_drill_data.drill_id",
                    foreignField: "_id",
                    as: "workout_drill_data.drills_data"
                }
            },
            {
                $unwind: '$workout_drill_data.drills_data',
            },
            {
                $addFields: {
                    'workout_drill_data.drill_name': '$workout_drill_data.drills_data.name',
                }
            },
            {
                $lookup: {
                    from: "user_drill_status",
                    localField: "workout_drill_data._id",
                    foreignField: "workout_drill_id",
                    as: "user_drill_status_data"
                }
            },
            {
                $addFields: {
                    drillStatus: { $cond: { if: { $isArray: "$user_drill_status_data" }, then: { $size: "$user_drill_status_data" }, else: 0 } }
                }
            },
            {
                $unwind: { path: '$user_drill_status_data', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    "workout_drill_data.drill_color": {
                        $cond:
                        {
                            if: {
                                $eq: ['$drillStatus', 0]
                            },
                            then: DRILL_DEFAULT_STATUS,
                            else: "$user_drill_status_data.status",
                        }
                    }
                },
            },
            {
                $project: {
                    'workout_drill_data.drills_data': 0
                }
            },
            {
                $group: {
                    _id: {
                        _id: "$_id",
                        name: "$name",
                        status: "$status",
                        skill_level: "$skill_level",
                        is_free: "$is_free",
                        is_star: "$is_star",
                        star_start_date: "$star_start_date",
                        end_start_date: "$end_start_date",
                        is_special: "$is_special",
                        image: "$image",
                        number_of_drill: "$number_of_drill",
                        suggested_FGM: "$suggested_FGM",
                        suggested_FGA: "$suggested_FGA",
                        tag_ids: "$tag_ids",
                        is_favorite: "$is_favorite",
                        completion_count: "$completion_count",
                        description: "$description",
                        updated_at: "$updated_at",
                        created_at: "$created_at",
                    },
                    drillData: {
                        $push: '$workout_drill_data'
                    }
                }
            },
            {
                $addFields: {
                    '_id.drill_data': '$drillData',
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$_id"
                }
            },


        ]);

        console.log("data.....",data)

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};


exports.getWorkoutListTags1 = async skill_level_arr => {
    try {

        skill_level_arr = [...skill_level_arr]
        var skill_level_num = skill_level_arr.map(Number);
        const data = await Workout.aggregate([{
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    is_special: false
                }
            },
            {
                $unwind: "$tag_ids"
            },
            {
                $lookup: {
                    from: "tags",
                    localField: "tag_ids",
                    foreignField: "_id",
                    as: "tags_details"
                }
            },
            {
                $unwind: '$tags_details',
            },
            {
                $lookup: {
                    from: "user_favourite_workouts",
                    localField: "_id",
                    foreignField: "workout_id",
                    as: "user_favourite_workout_data"
                }
            },
            {
                $addFields: {
                    isUserComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_favourite_workout_data"
                            },
                            then: {
                                $size: "$user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_favourite_workout_data.completion_count"
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_favourite_workout_data': 0
                }
            },
            {
                $group: {
                    _id: "$tags_details",
                    workout_data: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            status: "$status",
                            skill_level: "$skill_level",
                            is_free: "$is_free",
                            is_star: "$is_star",
                            star_start_date: "$star_start_date",
                            end_start_date: "$end_start_date",
                            is_special: "$is_special",
                            image: "$image",
                            number_of_drill: "$number_of_drill",
                            suggested_FGM: "$suggested_FGM",
                            suggested_FGA: "$suggested_FGA",
                            tag_ids: "$tag_ids",
                            updated_at: "$updated_at",
                            created_at: "$created_at",
                            completion_count: "$completion_count"
                        }
                    }
                }
            },
        ]);

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.getSpecialWorkoutList1 = async skill_level_arr => {
    try {

        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);
        const data = await Workout.aggregate([{
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    is_special: true
                }
            },
            {
                $unwind: "$tag_ids"
            },
            {
                $lookup: {
                    from: "tags",
                    localField: "tag_ids",
                    foreignField: "_id",
                    as: "tags_details"
                }
            },
            {
                $unwind: '$tags_details',
            },
            {
                $lookup: {
                    from: "user_favourite_workouts",
                    localField: "_id",
                    foreignField: "workout_id",
                    as: "user_favourite_workout_data"
                }
            },
            {
                $addFields: {
                    isUserComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_favourite_workout_data"
                            },
                            then: {
                                $size: "$user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_favourite_workout_data.completion_count"
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_favourite_workout_data': 0
                }
            },
        ]);

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.getWorkoutListTags = async (userId, skill_level_arr) => {
    try {

        skill_level_arr = [...skill_level_arr]
        var skill_level_num = skill_level_arr.map(Number);
        const data = await Workout.aggregate([{
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    is_special: false,
                    status: 1
                }
            },
            {       
                $addFields: {
                    tem_tag_ids: '$tag_ids'
                }        
            },
            {
                $unwind: "$tem_tag_ids"
            },
            { 
                $sort : { 
                    'order' : 1,
                    'created_at': -1
                } 
            },
            {
                $group: {
                    _id: '$tem_tag_ids',
                    allWorkout: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            order: "$order",
                            status: "$status",
                            skill_level: "$skill_level",
                            is_free: "$is_free",
                            is_star: "$is_star",
                            star_start_date: "$star_start_date",
                            end_start_date: "$end_start_date",
                            is_special: "$is_special",
                            number_of_drill: "$number_of_drill",
                            suggested_FGM: "$suggested_FGM",
                            suggested_FGA: "$suggested_FGA",
                            image: "$image",
                            tag_ids: "$tag_ids",
                            updated_at: "$updated_at",
                            created_at: "$created_at",
                        }
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
                $project: {
                    topFive: {
                        $slice: ["$allWorkout", DATA_LIMIT]
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
                    from: 'user_favourite_workouts',
                    let: {
                        userId: userId,
                        workout_id: '$_id'

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
                    as: 'user_favourite_workout_data'
                }
            },
            {
                $addFields: {
                    isFavouriteComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_favourite_workout_data"
                            },
                            then: {
                                $size: "$user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $lookup: {
                    from: 'user_workout_completion',
                    let: {
                        userId: userId,
                        workout_id: '$_id'

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
                    as: 'user_workout_completion_data'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_workout_completion_data"
                            },
                            then: {
                                $size: "$user_workout_completion_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_workout_completion_data',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_favourite_workout_data.completion_count"
                        }
                    },
                    is_favorite: {
                        $cond: {
                            if: {
                                $and: {
                                    $eq: ['$isFavouriteComplitionData', 1],
                                    $eq: ['$user_favourite_workout_data.status', 1]
                                }
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_favourite_workout_data': 0,
                    'isFavouriteComplitionData': 0,
                    'user_workout_completion_data': 0
                }
            },
            {
                $group: {
                    _id: {
                        _id: "$_id",
                        name: "$name",
                        status: "$status",
                        order: "$order",
                        skill_level: "$skill_level",
                        is_free: "$is_free",
                        is_star: "$is_star",
                        star_start_date: "$star_start_date",
                        end_start_date: "$end_start_date",
                        is_special: "$is_special",
                        image: "$image",
                        number_of_drill: "$number_of_drill",
                        suggested_FGM: "$suggested_FGM",
                        suggested_FGA: "$suggested_FGA",
                        tag_ids: "$tag_ids",
                        updated_at: "$updated_at",
                        created_at: "$created_at",
                        completion_count: "$completion_count",
                        is_favorite: "$is_favorite",
                        test: "$test"
                    },
                    tem_tag_ids: {
                        $addToSet: "$tem_tag_ids"
                    }
                }
            },
            {
                $addFields: {
                    "_id.tem_tag_ids": "$tem_tag_ids"
                }
            },
            {
                $replaceRoot: {
                    "newRoot": "$_id"
                }
            },
            {
                $project: {
                    'tem_tag_ids': 0
                }
            },
            { 
                $sort : { 
                    'order' : 1,
                    'created_at': -1
                } 
            }
        ]);


        console.log("data...",data)
        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.getSpecialWorkoutList = async (userId, skill_level_arr) => {
    try {

        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);
        const data = await Workout.aggregate([{
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    is_special: true,
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
            // {
            //     $lookup: {
            //         from: 'user_favourite_workouts',
            //         let: {
            //             userId: userId,
            //             workoutId: '$_id'
            //         },
            //         pipeline: [{
            //             $match: {
            //                 $expr: {
            //                     $and: [{
            //                             $eq: ['$user_id', '$$userId']
            //                         },
            //                         {
            //                             $eq: ['$workout_id', '$$workoutId']
            //                         }
            //                     ]
            //                 }
            //             }
            //         }],
            //         as: 'user_favourite_workout_data'
            //     }
            // },
            // {
            //     $addFields: {
            //         isUserComplitionData: {
            //             $cond: {
            //                 if: {
            //                     $isArray: "$user_favourite_workout_data"
            //                 },
            //                 then: {
            //                     $size: "$user_favourite_workout_data"
            //                 },
            //                 else: 0
            //             }
            //         }
            //     }
            // },
            // {
            //     $unwind: {
            //         path: '$user_favourite_workout_data',
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     $addFields: {
            //         completion_count: {
            //             $cond: {
            //                 if: {
            //                     $eq: ['$isUserComplitionData', 0]
            //                 },
            //                 then: 0,
            //                 else: "$user_favourite_workout_data.completion_count"
            //             }
            //         },
            //         is_favorite: {
            //             $cond: {
            //                 if: {
            //                     $and: {
            //                         $eq: ['$isUserComplitionData', 1],
            //                         $eq: ['$user_favourite_workout_data.status', 1]
            //                     }
            //                 },
            //                 then: true,
            //                 else: false
            //             }
            //         }
            //     }
            // },
            {
                $lookup: {
                    from: 'user_favourite_workouts',
                    let: {
                        userId: userId,
                        workout_id: '$_id'
            
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
                    as: 'user_favourite_workout_data'
                }
            },
            {
                $addFields: {
                    isFavouriteComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_favourite_workout_data"
                            },
                            then: {
                                $size: "$user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            
            
            {
                $lookup: {
                    from: 'user_workout_completion',
                    let: {
                        userId: userId,
                        workout_id: '$_id'
            
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
                    as: 'user_workout_completion_data'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_workout_completion_data"
                            },
                            then: {
                                $size: "$user_workout_completion_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_workout_completion_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            
            
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_favourite_workout_data.completion_count"
                        }
                    },
                    is_favorite: {
                        $cond: {
                            if: {
                                $and: {
                                    $eq: ['$isFavouriteComplitionData', 1],
                                    $eq: ['$user_favourite_workout_data.status', 1]
                                }
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_favourite_workout_data': 0,
                    'isFavouriteComplitionData': 0,
                    'user_workout_completion_data': 0
                }
            }
            
        ]);

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.addFavouriteWorkoutId = async (userId, workoutId) => {
    try {

        let data = await User.update({
            _id: userId,
        }, {
            $push: {
                favorit_workouts_ids: workoutId
            }
        }, {
            runValidators: true
        });

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

// exports.getFavouriteWorkoutList = async (workoutIds, page, limit) => {
//     try {

//         const data = await Workout.aggregate([{
//                 $match: {
//                     _id: {
//                         $in: workoutIds
//                     }
//                 }
//             },
//             // {
//             //     $lookup: {
//             //         from: "tags",
//             //         localField: "tag_ids",
//             //         foreignField: "_id",
//             //         as: "tags_details"
//             //     }
//             // },
//             {
//                 $lookup: {
//                     from: "user_favourite_workouts",
//                     localField: "_id",
//                     foreignField: "workoutId",
//                     as: "user_favourite_workout_data"
//                 }
//             },
//             {
//                 $addFields: {
//                     isUserComplitionData: {
//                         $cond: {
//                             if: {
//                                 $isArray: "$user_favourite_workout_data"
//                             },
//                             then: {
//                                 $size: "$user_favourite_workout_data"
//                             },
//                             else: 0
//                         }
//                     }
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$user_favourite_workout_data',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $addFields: {
//                     completion_count: {
//                         $cond: {
//                             if: {
//                                 $eq: ['$isUserComplitionData', 0]
//                             },
//                             then: 0,
//                             else: "$user_favourite_workout_data.completion_count"
//                         }
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     'isUserComplitionData': 0,
//                     'user_favourite_workout_data': 0
//                 }
//             },
//             {
//                 $skip: ((page - 1) * limit)
//             },
//             {
//                 $limit: limit
//             },
//             { 
//                 $sort : { 
//                     // 'order' : 1,
//                     'created_at': -1
//                 } 
//             }

//         ]);
//         return data;
//     } catch (error) {
//         console.log("error..", error)
//         throw error;
//     }
// };

exports.getFavouriteWorkoutList = async (user_id, page, limit) => {
    try {

        console.log("user_id....",user_id)

        const data = await UserFavouriteWorkouts.aggregate([
            {
                $match: {
                    user_id:  user_id,
                    status: 1                    
                }
            },
            {
                $lookup: {
                    from: "workouts",
                    localField: "workout_id",
                    foreignField: "_id",
                    as: "workouts_details"
                }
            },
                        {
                $unwind: {
                    path: '$workouts_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "workouts_details.completion_count": "$completion_count",
                    "favouriteWorkoutUpdated_at": "$updated_at"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$workouts_details"
                }
            },
            { 
                $sort : { 
                    // 'order' : 1,
                    'favouriteWorkoutUpdated_at': -1
                } 
            },
            {
                $skip: ((page - 1) * limit)
            },
            {
                $limit: limit
            },
            

        ]);

        console.log("data.....",data)


        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.getFavouriteWorkoutListTotal = async (user_id, page, limit) => {
    try {

        const data = await UserFavouriteWorkouts.countDocuments({
                    user_id:  user_id,
                    status: 1                    
                });
                
        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.removeFavouriteWorkoutId = async (userId, workoutId) => {
    try {

        let data = await User.update({
            _id: userId,
        }, {
            $pull: {
                favorit_workouts_ids: workoutId
            }
        }, {
            runValidators: true
        });

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.getWorkoutTagList = async (userId, skill_level_arr, tagId, page, limit) => {
    try {
        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);

        let query = (tagId == '1') ? {
            is_special: true
        } : {
            tag_ids: ObjectId(tagId)
        }

        const data = await Workout.aggregate([{
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    status: 1,
                    ...query
                }
            },
            {
                $lookup: {
                    from: 'user_favourite_workouts',
                    let: {
                        userId: userId,
                        workout_id: '$_id'
            
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
                    as: 'user_favourite_workout_data'
                }
            },
            {
                $addFields: {
                    isFavouriteComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_favourite_workout_data"
                            },
                            then: {
                                $size: "$user_favourite_workout_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_favourite_workout_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            
            
            {
                $lookup: {
                    from: 'user_workout_completion',
                    let: {
                        userId: userId,
                        workout_id: '$_id'
            
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
                    as: 'user_workout_completion_data'
                }
            },
            {
                $addFields: {
                    isUserComplitionData: {
                        $cond: {
                            if: {
                                $isArray: "$user_workout_completion_data"
                            },
                            then: {
                                $size: "$user_workout_completion_data"
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$user_workout_completion_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            
            
            {
                $addFields: {
                    completion_count: {
                        $cond: {
                            if: {
                                $eq: ['$isUserComplitionData', 0]
                            },
                            then: 0,
                            else: "$user_favourite_workout_data.completion_count"
                        }
                    },
                    is_favorite: {
                        $cond: {
                            if: {
                                $and: {
                                    $eq: ['$isFavouriteComplitionData', 1],
                                    $eq: ['$user_favourite_workout_data.status', 1]
                                }
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    'isUserComplitionData': 0,
                    'user_favourite_workout_data': 0,
                    'isFavouriteComplitionData': 0,
                    'user_workout_completion_data': 0
                }
            },
            { 
                $sort : 
                { 
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

        return data

    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}

exports.getWorkoutTagCount = async (userId, skill_level_arr, tagId, page, limit) => {
    try {
        skill_level_arr = [...skill_level_arr]
        const skill_level_num = skill_level_arr.map(Number);

        let query = (tagId == '1') ? {
            is_special: true
        } : {
            tag_ids: ObjectId(tagId)
        }

        const data = await Workout.aggregate([{
                $match: {
                    skill_level: {
                        $in: skill_level_num
                    },
                    status: 1,
                    ...query
                }
            }
        ]);

        return data.length

    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}


exports.checkFavouriteWorkout = async (user_id, workout_id) => {
    try {
        // console.log(userId, workout_id)
        const data = await UserFavouriteWorkouts.findOne({ user_id, workout_id })

        return data
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
}

exports.addFavouriteWorkout = data => new UserFavouriteWorkouts(data).save();


exports.updateFavouriteWorkout = async (reqData, conditionData) => {
    try {
        console.log("reqData, conditionData.........", reqData, conditionData)

        const { nModified } = await UserFavouriteWorkouts.update(
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