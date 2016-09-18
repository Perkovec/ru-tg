//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// setup the fs
const fs = require('fs');
const userHome = (process.env.HOME || process.env.USERPROFILE) + '/.termgram';
const logFolder = userHome + '/log';
try {
  fs.mkdirSync(userHome, '0770');
  fs.mkdirSync(logFolder, '0770');
} catch (e) {}

// setup the logger
process.env.LOGGER_FILE = logFolder + '/termgram';
const getLogger = require('get-log');
getLogger.PROJECT_NAME = 'termgram';
const logger = getLogger('main');

// import other dependencies
require('colors');
require('./telegram.link')(getSignature());
var ui = require('./lib/user-interface');
var i18n = require('./i18n/en-US');
var signUp = require('./lib/use-case/sign-up');
var signIn = require('./lib/use-case/sign-in');
var Updates = require('./lib/updates');
var selectChat = require('./lib/use-case/select-chat');
var chat = require('./lib/use-case/chat');
var userData = require('./lib/user-data');
userData.setBaseFolder(userHome);


// begin
function main() {
    const userLoginned = userData.isLoggin();
    console.log(i18n.welcome);  

    function doSignUp() {
        signUp().then(res => {
            logger.info('signUp res: %s', res);
            home();
        }, error => {
            console.log('signUp error: ', error.stack);
            shutdown();
        });
    }

    // if no users
    if (!userLoginned) {
        logger.info('Sign up a new user.');
        doSignUp();
    } else {
        signIn().then(res => {
            logger.info('signIn res:', res);
            home();
        }, error => {
            if (error) {
                console.log('signIn error: ', error.stack);
                shutdown();
            } else {
                doSignUp();
            }
        });
    }
    ui.events.on(ui.EVENT.EXIT, () => {
        ui.askConfirmationInput(i18n.exit, true).then(shutdown, () => {
            console.log('nothing to do, again...')
        });
    });
}

// userHome page
function home() {
    var updates = Updates.getInstance();
    updates.start().then(() => {
        selectChat().then(peer => {
            if (peer) {
                chat(peer).then(() => {
                    console.log('nothing to do, now...');
                    shutdown();
                }, error => {
                    console.log('chat error: ', error.stack);
                    shutdown();
                });
            } else {
                console.log('No chat selected');
                console.log('nothing to do, now...');
                shutdown();
            }
        }, error => {
            console.log('selectChat error: ', error.stack);
            shutdown();
        });

    }, error => {
        console.log('update-emitter error: ', error.stack);
        shutdown();
    });
}

// end
function shutdown() {
    ui.close();
    Updates.getInstance().stop();
}

// get the application signature
function getSignature() {
    return ('T E R M G R A M by Perkovec'.bold + ' ' + require('./package.json').version ).cyan;
}

// run
main();