module.exports = {
    'PORT': process.env.PORT || 3001,
    'NODE_ENV': 'development',
    'JWT_SECRET': 'commonappnode',
    'SEND_GRID_API_KEY': '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',
    'EMAIL_FROM': "hoopdna.app@gmail.com",
    // 'MONGODB_URI': 'mongodb+srv://commonApp:qkfbgvDDZ6L1BT0I@cluster0.d3tpr.mongodb.net/commonAppNodejs?retryWrites=true&w=majority',

    //tanvir@inheritx.com's account used in mongo atlas
    'MONGODB_URI': 'mongodb+srv://commonApp:commonApp@123@cluster0.4mscd.mongodb.net/commonApp',



    'BASEURL': 'http://localhost:3001/',
    // 'BASEURL': 'http://119.160.193.114:3001/',


    'AWS_KEY': 'AKIAUMERU453DHPEQLWR',
    'AWS_SECRET': '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',
    'AWS_REGION': 'us-east-2',
    'AWS_BUCKET': 'myabcapp',
    'AWS_BUCKET_URL': 'https://myabcapp.s3.us-east-2.amazonaws.com/',
}


// //setting up keys and their values for development
// module.exports = {
//     'PORT': process.env.PORT || 8090,
//     'NODE_ENV':'development',
// 	'JWT_SECRET': 'commonappnode',
//     'SEND_GRID_API_KEY' :'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',
//     'EMAIL_FROM':"hoopdna.app@gmail.com",
//     // 'MONGODB_URI': 'mongodb://127.0.0.1:27017/commonappnode',
//     'MONGODB_URI': 'mongodb+srv://commonApp:qkfbgvDDZ6L1BT0I@cluster0.d3tpr.mongodb.net/commonAppNodejs?retryWrites=true&w=majority',

//     // 'BASEURL': 'http://localhost:3001/'
//     'BASEURL': 'http://119.160.193.114:3001/'
// }