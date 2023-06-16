const { Aggregate } = require('mongoose');
const Action = require('../../models/action.model')
const { ObjectId } = require('mongoose').Types;


exports.getActionDetailsData = async actionId => {
  try {
    const data = await Action.aggregate([
      {
        $match: {
          _id: ObjectId(actionId)
        }
      },
      {
        $lookup: {
          from: "locations",
          localField: "start_location_id",
          foreignField: "_id",
          as: "start_location_data"
        }
      },
      {
        $lookup: {
          from: "locations",
          localField: "finish_location_id",
          foreignField: "_id",
          as: "finish_location_data"
        }
      },
      {
        $lookup: {
          from: "finish_types",
          localField: "finish_type_id",
          foreignField: "_id",
          as: "finish_type_data"
        }
      },
      {
        $unwind:  '$start_location_data'
      },
      {
        $unwind:  '$finish_location_data'
      },
      {
        $unwind:  '$finish_type_data'
      },
      {
          $addFields: {
            'start_location': '$start_location_data.name',
            'finish_location': '$finish_location_data.name',
            'finish_type': '$finish_type_data.name',
          }
        },
        {
          $project: {
            start_location_data: 0,
            finish_location_data: 0,
            finish_type_data: 0,
            start_location_id: 0,
            finish_location_id: 0,
            finish_type_id: 0,
          }
        }
    ]);

    return data;
  } catch (error) {
    throw error;
  }
};


exports.getActionIdListData = async drillId => {
  try {

    console.log('drillId...',drillId)
    const data = await Action.aggregate([
      {
        $match: {
          drill_id: ObjectId(drillId)
        }
      },
      // {
      //   $addFields: {
      //     'actionId': '$_id'
      //   }
      // },
      {
        $project: {
          // actionId: 1,
          position: 1
        }
      }
    ])

    return data

  } catch (error) {
    throw error;
  }
}