const { Aggregate } = require('mongoose');
const Action = require('../../models/action.model')
const { ObjectId } = require('mongoose').Types;
const UserActionData = require('../../models/UserActionData.model')


exports.getPerformedWorkoutList = async (userId, page, limit) => {
    try {
        console.log("userId.....",userId)
        const data = await UserActionData.aggregate([
            {
                $match: {
                    user_id: ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "workout_drills",
                    localField: "workout_drill_id",
                    foreignField: "_id",
                    as: "workout_drills_data"
                }
            },
            {
                $unwind: '$workout_drills_data',
            },
            {
                $lookup: {
                    from: "workouts",
                    localField: "workout_drills_data.workout_id",
                    foreignField: "_id",
                    as: "workouts_data",
                }
            },
            {
                $unwind: '$workouts_data',
            },
            {
                $lookup: {
                    from: "user_favourite_workouts",
                    localField: "workouts_data._id",
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
                    "workouts_data.completion_count": {
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
                $replaceRoot: {
                    newRoot: "$workouts_data"
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
};

exports.addActionLogsData = async reqBody => {
    try {
        console.log("reqBody........",reqBody)
        const data = await UserActionData.insertMany(reqBody)
        return data

     } catch (error) {
        console.log("error..", error)
        throw error;
    }
}