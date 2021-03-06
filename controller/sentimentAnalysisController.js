import Tweet, { getTweet } from '../models/tweetModel.js'
import ToneAnalyzerV3 from 'ibm-watson/tone-analyzer/v3.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import dotenv from 'dotenv';

dotenv.config();

const toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    authenticator: new IamAuthenticator({
        apikey: process.env.IBM_API_KEY,
    }),
    serviceUrl: 'https://api.eu-de.tone-analyzer.watson.cloud.ibm.com',
});

async function sentimentAnalysis(text) {
    const toneParams = {
        toneInput: { 'text': text },
        contentType: 'application/json',
        sentences: false,
        Headers: false,
    };

    const sentiment = await toneAnalyzer.tone(toneParams)
    .then(toneAnalysis => {
        return JSON.stringify(toneAnalysis, null, 2);
    })
    .catch(err => {
        console.log('error:', err);
    });

    return JSON.parse(sentiment);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export default function (req, res) {
    getTweet(function (err, contacts) {
        // if (err) {
        //     res.json({
        //         status: "error",
        //         message: err,
        //     });
        // }
        // res.json({
        //     status: "success",
        //     message: "Contacts retrieved successfully",
        //     data: contacts
        // });

        let count = 0;

        for(let i = 0; i < 10; i++) {
            
            count++

            if(count === 1) {
                return;
            }

            console.log(count);

            Tweet.findById(contacts[i]._id, async function(err, tweet) {
                if(err) {
                    res.send(err);
                }

                let tone = await sentimentAnalysis(contacts[i].text);

                if(tone == []) {
                    Tweet.remove({_id: tweet._id}, function(err) {
                        if(err) {
                            res.json(err);
                        }

                        console.log({
                            message: 'Tweet deleted. No tone available.',
                            data: Tweet
                        });
                    })
                } else {
                    tweet.tones = tone.result.document_tone.tones;

                    // console.log(tweet);

                    tweet.save({_id: tweet._id}, function(err) {
                        if(err) {
                            res.json(err);
                        }

                        console.log({
                            message: 'Tone added!',
                            data: tweet
                        });
                    })
                }
            })
            //console.log(element);
            //console.log(await sentimentAnalysis(element.text));
        };
    });
}