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

// Function for analysing tweets
// async () => {
//   tweets.forEach(async (tweet) => {
//       let sentiment = await sentimentAnalysis(tweet.text);
//       let tones = sentiment.result.document_tone.tones;

//       if(tones == []) {
//           return
//       } else {
//          tweet.tones = tones; 

//          console.log(tweet);
//       }
//   })
// }

export { sentimentAnalysis };