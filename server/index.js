import app from 'express';
import dotenv from 'dotenv'
import got from 'got';
import { TwitterApi } from 'twitter-api-v2';
import { sentimentAnalysis } from './sentimentAnalysis.js'

dotenv.config();

const port = process.env.PORT || 3000;
let tweetIDs = []
let tweets = []

console.log(`Server running at ${port}`);

const twitterApi = new TwitterApi({
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

async function collectTweetIDs()  {
    let rawTextData = await got(`https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-01/coronavirus-tweet-id-2021-01-01-01.txt`);
    let rawJsonData = JSON.stringify(rawTextData.body);
    let splittedJSON = rawJsonData.split('n');

    // Clean up and save to array
    splittedJSON.forEach((element) => {
        tweetIDs.push(element.slice(0, element.length-1));
    })
    tweetIDs[0] = tweetIDs[0].slice(1, tweetIDs[0].length)
}

async function getTweets(tweetIDs) {
    for (let index = 0; index < 10; index++) {
        await getSingleTweet(tweetIDs[index]);
    }
} 

async function getSingleTweet(tweetID) {
    const url = `tweets?ids=${tweetID}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=name,username,location,profile_image_url`
    const apiResponse = await twitterApi.v2.get(url);

    if (apiResponse.errors) {
        return
    } else {
        let tweet = {
            id: apiResponse.data[0].id,
            text: apiResponse.data[0].text,
            created_at: apiResponse.data[0].created_at,
            user: {
                id: apiResponse.includes.users[0].id,
                profile_image: apiResponse.includes.users[0].profile_image_url,
                name: apiResponse.includes.users[0].name,
                username: apiResponse.includes.users[0].username,
                location: apiResponse.includes.users[0].location ,
            },
            public_metrics: {
                likes: apiResponse.data[0].public_metrics.like_count,
                retweets: apiResponse.data[0].public_metrics.retweet_count,
                replies: apiResponse.data[0].public_metrics.reply_count,
                quotes: apiResponse.data[0].public_metrics.quote_count,
            },
            link: `https://twitter.com/i/web/status/${apiResponse.data[0].id}`  
        }

        tweets.push(tweet);
    }
};

function init() {
    collectTweetIDs()
    .then(async () => {
        await getTweets(tweetIDs);
    }).then(async () => {
        tweets.forEach(async (tweet) => {
            let sentiment = await sentimentAnalysis(tweet.text);
            let tones = sentiment.result.document_tone.tones;

            if(tones == []) {
                return
            } else {
               tweet.tones = tones; 

               console.log(tweet);
            }
        })
    })
}

init();