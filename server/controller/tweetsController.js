import Tweet, { getTweet } from '../models/tweetModel.js'



export default function init(req, res) {
    getTweet(function (err, contacts) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Tweets retrieved successfully",
            data: contacts
        });
    });
};