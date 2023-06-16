const { Aggregate } = require('mongoose');
const Action = require('../../models/action.model')
const Drill = require('../../models/drill.model')
const { ObjectId } = require('mongoose').Types;
const UserActionData = require('../../models/UserActionData.model')


exports.getDrillDetailsData = async drillId => {
    try {

        console.log("drillId...",drillId)

        const data = await Drill.aggregate([
            {
                $match: {
                    _id: ObjectId(drillId)
                }
            },
            {
                $lookup: {
                    from: "actions",
                    localField: "_id",
                    foreignField: "drill_id",
                    as: "action_data"
                }
            },
            // {
            //     $unwind: '$action_data',
            // },
            // {
            //     $lookup: {
            //         from: "locations",
            //         localField: "action_data.start_location_id",
            //         foreignField: "_id",
            //         as: "action_data.start_locations_data",
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "locations",
            //         localField: "action_data.finish_location_id",
            //         foreignField: "_id",
            //         as: "action_data.finish_location_data",
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "finish_types",
            //         localField: "action_data.finish_type_id",
            //         foreignField: "_id",
            //         as: "action_data.finish_type_data",
            //     }
            // },
            // {
            //     $unwind: '$action_data.start_locations_data'
            // },
            // {
            //     $unwind: '$action_data.finish_location_data'
            // },
            // {
            //     $unwind: '$action_data.finish_type_data'
            // },
            // {
            //     $group: {
            //         _id: {
            //             _id: "$_id",
            //             name: "$name",
            //             status: "$status",
            //             // skill_level: "$skill_level",
            //             video: "$video",
            //             total_actions: "$total_actions",
            //             updated_at: "$updated_at",
            //             created_at: "$created_at",
            //         },
            //         actionData: {
            //             $push: '$action_data'
            //         }
            //     }
            // },
            // {
            //     $addFields: {
            //         '_id.action_data': '$actionData',
            //     }
            // },
            // {
            //     $replaceRoot: {
            //         newRoot: "$_id"
            //     }
            // }
        ]);

        return data;
    } catch (error) {
        console.log("error..", error)
        throw error;
    }
};

exports.addActionLogsData = async reqBody => {
    try {
        const data = await UserActionData.insertMany(reqBody)
        return data

     } catch (error) {
        console.log("error..", error)
        throw error;
    }
}

// exports.addUserDrillStatus = async reqBody => {
//     try {
//         const data = await UserDrillStatus.(reqBody).save()
//         return data

//      } catch (error) {
//         console.log("error..", error)
//         throw error;
//     }
// }