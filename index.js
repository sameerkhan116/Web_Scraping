const rp = require('request-promise');
const cheerio = require('cheerio');
const Table = require('cli-table');

// Array to store users
let users = [];
// Table created using cli-table, needs two params: head for the headings the table will have, and colWidths
let table = new Table({
  head: ['username', '❤️', 'challenges'],
  colWidths: [15, 5, 10]
});

// specify url to hit and wehter its json
// These options are needed by request promise for ajax request
const options = {
  url: `https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received&_=1521255895951`,
  json: true
};

rp(options)
  .then(data => {
    let userData = [];
    // push each user from data.directory_items to userData array with a name and likes_received key
    for (let user of data.directory_items) {
      userData.push({
        name: user.user.username,
        likes_received: user.likes_received
      });
    }
    process.stdout.write('loading...');
    // run the getchallenges function after this
    getChallengesCompletedAndPushToUserArray(userData);
  })
  .catch(err => console.log(err));

function getChallengesCompletedAndPushToUserArray(userData) {
  let i = 0;
  function next() {
    // run this block until we go over all the users
    if (i < userData.length) {
      var options = {
        url: `https://www.freecodecamp.org/${userData[i].name}`,
        // pass the body to cheerio
        transform: body => cheerio.load(body)
      };
      rp(options).then(function($) {
        process.stdout.write(`.`);
        // checking if the user exists
        const fccAccount = $('h1.landing-heading').length == 0;
        // calculating number of challenges completed by counting the number of rows
        const challengesPassed = fccAccount ? $('tbody tr').length : 'unknown';
        // push the name, likes and challengesdata to the table.
        table.push([
          userData[i].name,
          userData[i].likes_received,
          challengesPassed
        ]);
        ++i;
        // call next again until the condition is true
        return next();
      });
    } else {
      printData();
    }
  }
  return next();
}

function printData() {
  console.log('✅');
  console.log(table.toString());
}
