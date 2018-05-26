'use strict';

// =================================================================================
// General Configuration
// =================================================================================

const isLambda = require('is-lambda');
if (!isLambda) {
    require('dotenv').config();
}

const PERSISTENCE =
        (['1', 'true'].indexOf(
            process.env.PERSISTENCE.toString().toLowerCase()
        ) > -1);
const BUCKET_PREFIX = process.env.BUCKET_PREFIX;
const REGION = process.env.REGION;
const TABLE = process.env.TABLE;

let databaseConfig = {
    type: 'file',
    localDbFilename: 'db',
};
if (isLambda && PERSISTENCE && TABLE) {
    databaseConfig = {
        type: 'dynamodb',
        tableName: TABLE,
    };
}
let requestLogging = true;
if (isLambda) {
    requestLogging = false;
}

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');

const config = {
    requestLogging: requestLogging,
    requestLoggingObjects: 'request',
    intentMap: {
        'AMAZON.CancelIntent': 'END',
        'AMAZON.PauseIntent': 'END',
        'AMAZON.StopIntent': 'END',
        'AMAZON.ResumeIntent': 'ResumeIntent',
        'AMAZON.StartOverIntent': 'StartOverIntent',
        'AMAZON.PreviousIntent': 'PreviousIntent',
        'AMAZON.NextIntent': 'NextIntent',
        'AMAZON.RepeatIntent': 'RepeatIntent',
        'AMAZON.ShuffleOnIntent': 'ShuffleOnIntent',
        'AMAZON.ShuffleOffIntent': 'ShuffleOffIntent',
        'AMAZON.LoopOnIntent': 'LoopOnIntent',
        'AMAZON.LoopOffIntent': 'LoopOffIntent',
    },
    db: databaseConfig,
};

const app = new App(config);

// =================================================================================
// App Logic
// =================================================================================

const audioPlayer = require('./modules/audioPlayer.js');
const buckets = require('./modules/buckets.js');

app.setHandler({
    'ON_REQUEST': function() {
        try {
            console.log(`Request intent: ${this.getIntentName()}`);
        } catch (error) {
            console.log(`Request type: ${this.getPlatform().request.getType()}`);
        }
    },

    'LAUNCH': function() {
        buckets.listBuckets(
            this,
            BUCKET_PREFIX,
            REGION,
            buckets.getRandomItemFromBucket,
            audioPlayer.play
        );
    },

    'END': function() {
        audioPlayer.stop(this);
    },

    'Unhandled': function() {
        this.endSession();
    },

    'ResumeIntent': function() {
        if (
            PERSISTENCE
            && this.user().data.current.file
            && this.user().data.current.token
            && this.user().data.current.offset
        ) {
            audioPlayer.resume(this);
        } else {
            this.toIntent('LAUNCH');
        }
    },

    'StartOverIntent': function() {
        if (
            PERSISTENCE
            && this.user().data.current.file
            && this.user().data.current.token
        ) {
            audioPlayer.startOver(this);
        } else {
            this.toIntent('LAUNCH');
        }
    },

    'PreviousIntent': function() {
        if (
            PERSISTENCE
            && this.user().data.previous
            && this.user().data.previous.file
            && this.user().data.previous.token
        ) {
            audioPlayer.playPrevious(this);
        } else {
            this.toIntent('LAUNCH');
        }
    },

    'NextIntent': function() {
        if (
            PERSISTENCE
            && this.user().data.next.file
            && this.user().data.next.token
        ) {
            audioPlayer.playNext(this);
        } else {
            this.toIntent('LAUNCH');
        }
    },

    'RepeatIntent': function() {
        if (
            PERSISTENCE
            && this.user().data.current
        ) {
            audioPlayer.playAgain(this);
        } else {
            this.endSession();
        }
    },

    'AUDIOPLAYER': {
        'AudioPlayer.PlaybackStarted': function() {
            this.endSession();
        },

        'AudioPlayer.PlaybackFinished': function() {
            if (PERSISTENCE) {
                this.user().data.previous = this.user().data.current;
                this.user().data.current = this.user().data.next;
                delete this.user().data.next;
            }

           this.endSession();
        },

        'AudioPlayer.PlaybackStopped': function() {
            if (PERSISTENCE) {
                this.user().data.current.offset =
                    this.alexaSkill().request.request.offsetInMilliseconds;
            }

            this.endSession();
        },

        'AudioPlayer.PlaybackNearlyFinished': function() {
            if (
                PERSISTENCE
                && this.user().data.next
                && this.user().data.next.file
                && this.user().data.next.token
            ) {
                audioPlayer.enqueueNext(this);
            } else {
                buckets.listBuckets(
                    this,
                    BUCKET_PREFIX,
                    REGION,
                    buckets.getRandomItemFromBucket,
                    audioPlayer.enqueue
                );
            }
        },
    },
});

module.exports.app = app;
