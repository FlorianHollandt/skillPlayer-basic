
# Skill Player
## Let Alexa play your old mp3 file collection

Skill Player is a an audioplayer for the Amazon Alexa platform with which *the developer* (and people included in their Beta test) can stream music from mp3 files hosted on an AWS S3 bucket.

###### Why would anyone need such a player?

My motivation for developing this is that I have no really convenient way of listening to mp3 files other than from my laptop or smartphone, optionally sent to a speaker with Bluetooth. I could build a playlist on a paid streaming service, but the disadvantage is that they might not have all my music, and it ties me to their product.

###### But this player has downsides, too, right?

Yes, a lot, but they are not very painful to me. Potential disadvantages are:
- You need internet access to use the player
- In all honesty, you need to have basic dev skills with Alexa and AWS
- To add music, you have to upload it to an AWS S3 bucket and give it public access permissions
- If you listen to a lot of music, you might exceed your AWS free tier
- You don't have the convenience of audioplayer mobile, desktop or browser apps

###### Alright, I might give it a try. What do I need to get this running?

You will need:
- This repository and its dependencies
- It it extremely convenient to run it locally using the Jovo CLI
- The basics for Alexa Skill development (Alexa Dev account, an AWS Lambda function to run this code on)
- An AWS user / service account with read access to S3
- A AWS S3 bucket to upload your mp3 files (with public read access) into
- If you want to use persistence features, you need to give your Lambda function permission to read, write and create DynamoDB tables

You should be able to get this running locally by cloning the repository, installing the dependencies, providing the config and credential files and then running `jovo run` in the main folder.

###### And how does it work?

Meh, there's no rocket science involved. Just look at the code! :)

###### Oh-kay... At least tell us how to config all of this

Alright. Most of the config comes from environment variables, which you can save locally in a file .env, and in Lambda as session variables.

| Key           | Value     | Explanation                                                                           |
|---------------|-----------|---------------------------------------------------------------------------------------|
| PERSISTENCE   | true      | Local file DB or DynamoDB are used to save offset and previous, current and next song |
|               | false     | No database is used, resulting in more basic functionality                            |
| BUCKET_PREFIX | foo       | Either the prefix or the full name of the S3 bucket with your mp3 files               |
| REGION        | eu-west-1 | Whatever the region is where your S3 bucket is located                                |
| TABLE         | db        | This is what you use in the local .env file. The Jovo CLI will create a file db.json. |
|               | FOO       | The name of your DynamoDB table, if you use persistence.                              |

The other thing that you need to get by yourself is the content of the file 'config.json'. You can get the access key and secret key from AWS IAM, where you create a user with 'AmazonS3ReadOnlyAccess' policy.

###### Wait! I have so many more questions about this...

Sure, feel free to ask, really! I think I will expand upon this project and its documentation later.

Looking forward to your Twitter DM, email or issue! :)
