import app from 'express';
import dotenv from 'dotenv'
import got from 'got';
import fs from'fs';
import readline from 'readline';
import LineReader from 'line-reader';
import { TwitterApi } from 'twitter-api-v2';
import { sentimentAnalysis } from './sentimentAnalysis.js'

dotenv.config();

const port = process.env.PORT || 3000;
console.log(`Server running at ${port}`);

let urls = [
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-01/coronavirus-tweet-id-2020-01-21-22.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-02/coronavirus-tweet-id-2020-02-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-03/coronavirus-tweet-id-2020-03-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-04/coronavirus-tweet-id-2020-04-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-05/coronavirus-tweet-id-2020-05-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-06/coronavirus-tweet-id-2020-06-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-07/coronavirus-tweet-id-2020-07-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-08/coronavirus-tweet-id-2020-08-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-09/coronavirus-tweet-id-2020-09-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-10/coronavirus-tweet-id-2020-10-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-11/coronavirus-tweet-id-2020-11-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2020-12/coronavirus-tweet-id-2020-12-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-01/coronavirus-tweet-id-2021-01-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-02/coronavirus-tweet-id-2021-02-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-03/coronavirus-tweet-id-2021-03-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-04/coronavirus-tweet-id-2021-04-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-05/coronavirus-tweet-id-2021-05-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-06/coronavirus-tweet-id-2021-06-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-07/coronavirus-tweet-id-2021-07-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-08/coronavirus-tweet-id-2021-08-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-09/coronavirus-tweet-id-2021-09-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-10/coronavirus-tweet-id-2021-10-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-11/coronavirus-tweet-id-2021-11-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2021-12/coronavirus-tweet-id-2021-12-01-01.txt',
    'https://raw.githubusercontent.com/echen102/COVID-19-TweetIDs/master/2022-01/coronavirus-tweet-id-2022-01-01-01.txt'
]

let tweetIDs = []
let tweets = []

const twitterApi = new TwitterApi({
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

async function collectTweetIDs(files)  {
    for (let i = 0; i < files.length; i++) {
        const fileStream = got.stream(files[i]);
  
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let count = 0;
    
        for await (const line of rl) {
            tweetIDs.push(line);
            console.log(count);
            count++;

            if(count >= 10000) {
                break
            }
        }
    }
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
    collectTweetIDs(urls)
    .then(async () => {
        console.log(tweetIDs.length);
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