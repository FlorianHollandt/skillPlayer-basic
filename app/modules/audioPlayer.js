
const isLambda = require('is-lambda');
if (!isLambda) {
    require('dotenv').config();
}

const PERSISTENCE =
        (['1', 'true'].indexOf(
            process.env.PERSISTENCE.toString().toLowerCase()
        ) > -1);

module.exports = {
    play: function(jovo, file, token) {
        console.log('audioPlayer.play()');

        if (PERSISTENCE) {
            jovo.user().data.current = {
                file: file,
                token: token,
            };
        }

        jovo.alexaSkill().audioPlayer()
            .setOffsetInMilliseconds(0)
            .play(file, token)
            .endSession();
    },

    enqueue: function(jovo, file, token) {
        console.log('audioPlayer.enqueue()');
        const previousToken = jovo.alexaSkill().request.request.token;

        if (PERSISTENCE) {
            jovo.user().data.next = {
                file: file,
                token: token,
            };
        }

        jovo.alexaSkill().audioPlayer()
            .setExpectedPreviousToken(
                previousToken
            )
            .enqueue(
                file,
                token
            );
    },

    stop: function(jovo) {
        console.log('audioPlayer.stop()');

        jovo.alexaSkill().audioPlayer()
            .stop()
            .endSession();
    },

    resume: function(jovo) {
        console.log('audioPlayer.resume()');

        const offset = jovo.user().data.current.offset;
        delete jovo.user().data.current.offset;
        jovo.alexaSkill().audioPlayer()
            .setOffsetInMilliseconds(
                offset
            )
            .play(
                jovo.user().data.current.file,
                jovo.user().data.current.token
            )
            .endSession();
    },

    startOver: function(jovo) {
        console.log('audioPlayer.startOver()');

        delete jovo.user().data.current.offset;
        jovo.alexaSkill().audioPlayer()
            .setOffsetInMilliseconds(0)
            .play(
                jovo.user().data.current.file,
                jovo.user().data.current.token
            )
            .endSession();
    },

    playPrevious: function(jovo) {
        console.log('audioPlayer.playPrevious()');

        delete jovo.user().data.current.offset;
        jovo.user().data.next = jovo.user().data.current;
        jovo.user().data.current = jovo.user().data.previous;
        delete jovo.user().data.previous;
        jovo.alexaSkill().audioPlayer()
            .setOffsetInMilliseconds(0)
            .play(
                jovo.user().data.current.file,
                jovo.user().data.current.token
            )
            .endSession();
    },

    playNext: function(jovo) {
        console.log('audioPlayer.playNext()');

        delete jovo.user().data.current.offset;
        jovo.user().data.next = jovo.user().data.current;
        jovo.user().data.current = jovo.user().data.previous;
        delete jovo.user().data.previous;
        jovo.alexaSkill().audioPlayer()
            .setOffsetInMilliseconds(0)
            .play(
                jovo.user().data.current.file,
                jovo.user().data.current.token
            )
            .endSession();
    },

    playAgain: function(jovo) {
        console.log('audioPlayer.playAgain()');

        jovo.user().data.next = jovo.user().data.current;
        delete jovo.user().data.next.offset;

        jovo.alexaSkill().audioPlayer()
        .setExpectedPreviousToken(
            jovo.user().data.current.token
        )
        .enqueue(
            jovo.user().data.next.file,
            jovo.user().data.next.token
        )
        .endSession();
    },

    enqueueNext: function(jovo) {
        console.log('audioPlayer.enqueueNext()');

        jovo.alexaSkill().audioPlayer()
        .setExpectedPreviousToken(
            jovo.user().data.current.token
        )
        .enqueue(
            jovo.user().data.next.file,
            jovo.user().data.next.token
        );
    },
};
