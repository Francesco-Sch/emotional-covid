
import dotenv from 'dotenv'
import got from 'got';
import readline from 'readline';
import { TwitterApi, ApiResponseError } from 'twitter-api-v2';
import Tweet from './tweetModel.js'

dotenv.config();

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

            if(count >= 150) {
                break
            }
        }
    }
}

async function getTweets(tweetIDs) {
    for (let index = 0; index < tweetIDs.length; index++) {
        await autoRetryOnRateLimitError(getSingleTweet(tweetIDs[index]));
    }
} 

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
    
async function autoRetryOnRateLimitError(callback) {
    while (true) {
        try {
            return await callback;
        } catch (error) {
            if (error instanceof ApiResponseError && error.rateLimitError && error.rateLimit) {
                console.log('Waiting for twitter api...')
                console.log(error.rateLimit);
                const resetTimeout = error.rateLimit.reset * 1000; // convert to ms time instead of seconds time
                const timeToWait = resetTimeout - Date.now();

                await sleep(timeToWait);
                continue;
            }

            throw error;
        }
    }
}

async function getSingleTweet(tweetID) {
    const url = `tweets?ids=${tweetID}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=name,username,location,profile_image_url`
   
    const apiResponse = await twitterApi.v2.get(url);
    console.log(apiResponse);

    if(apiResponse.errors) {
        return
    } else {
        let tweet = new Tweet();
        
        tweet.id = apiResponse.data[0].id,
        tweet.text = apiResponse.data[0].text,
        tweet.created_at = apiResponse.data[0].created_at,
        tweet.user = {
            id: apiResponse.includes.users[0].id,
            profile_image: apiResponse.includes.users[0].profile_image_url,
            name: apiResponse.includes.users[0].name,
            username: apiResponse.includes.users[0].username,
            location: apiResponse.includes.users[0].location ,
        },
        tweet.public_metrics = {
            likes: apiResponse.data[0].public_metrics.like_count,
            retweets: apiResponse.data[0].public_metrics.retweet_count,
            replies: apiResponse.data[0].public_metrics.reply_count,
            quotes: apiResponse.data[0].public_metrics.quote_count,
        },
        tweet.link = `https://twitter.com/i/web/status/${apiResponse.data[0].id}`  

        // save the tweet and check for errors
        tweet.save().then((tweet) => {
            // If everything goes as planed
            //use the retured user document for something
            console.log.json({
                message: 'New tweet created!',
                data: tweet
            });
        })
        .catch((error) => {
            //When there are errors We handle them here
            console.log(error);
        });
    }
};

export default function init() {    
    collectTweetIDs(urls)
    .then(async () => {
        await getTweets(tweetIDs);
    })
}