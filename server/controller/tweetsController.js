import { getTweet } from '../models/tweetModel.js'

export default function init(req, res) {
    getTweet(function (err, tweets) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        return tweets;
    });
};