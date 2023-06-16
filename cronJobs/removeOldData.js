const fs = require('fs');
const path = require('path');
const moment = require('moment');
const CronJob = require('cron').CronJob;


// const dateFunc = require('../helpers/dateFunctions.helper');

const removeFiles = new CronJob(
  '1 * * * *',
  async () => {
    try {
      const revenueDir = 'public/documents/revenue';
      const usersDetailDir = 'public/documents/userDetails';

      console.log("cronjob run")

      const directories = [revenueDir, usersDetailDir];

      for (const directory of directories) {
        fs.readdir(directory, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            console.log(
              file,
              `removed at ${moment().tz('Asia/Kolkata').format()}`
            );
            fs.unlink(path.join(directory, file), (err) => {
              if (err) throw err;
            });
          }
        });
      }
    } catch (error) {
      console.log('error in removeFiles.cron=> ', error);
    }
  },
  null,
  true,
  'Asia/Kolkata'
);

removeFiles.start();
