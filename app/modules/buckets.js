
// =================================================================================
// AWS Configuration
// =================================================================================

let AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// ---------------------------------------------------------------------------------

module.exports = {
    listBuckets: function(jovo, bucketPrefix, region, bucketBehavior, playerBehavior) {
        console.log('buckets.listBuckets()');

        s3.listBuckets({}, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                jovo.tell(
                    '<audio src=\'https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_buzzer_small_01.mp3\'/>'
                );
            } else {
                const allBuckets = data.Buckets.map((foo) => foo.Name);
                // console.log(`Buckets: ${JSON.stringify(allBuckets, null, 4)}`);
                const matchingBuckets = allBuckets.filter((foo) => foo.includes(bucketPrefix));
                console.log(`Matching buckets: ${JSON.stringify(matchingBuckets, null, 4)}`);
                bucketBehavior(
                    jovo,
                    matchingBuckets[0],
                    region,
                    playerBehavior
                );
            }
        });
    },
    getRandomItemFromBucket: function(jovo, bucket, region, playerBehavior) {
        console.log('buckets.getRandomItemFromBucket()');

        const listObjectParams = {
            Bucket: bucket,
            MaxKeys: 1000, // No limit on listed items
        };
        s3.listObjectsV2(listObjectParams, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                jovo.tell(
                    '<audio src=\'https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_buzzer_small_01.mp3\'/>'
                );
            } else {
                console.log(`Number of songs : ${data.Contents.length}`);
                const songId = Math.floor(
                    Math.random() * data.Contents.length
                );
                let songName = data.Contents[songId].Key;
                const song = `https://s3-${region}.amazonaws.com/${bucket}/`
                    + songName.replace(/\s/g, '+');
                console.log(`Song URL: ${JSON.stringify(song, null, 4)}`);

                playerBehavior(jovo, song, songName);
            }
        });
    },
};
