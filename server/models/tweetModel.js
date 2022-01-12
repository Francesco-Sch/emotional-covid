import mongoose from 'mongoose';

const tweetSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    created_at: String,
    user: {
        type: Object,
        required: true,
        id: String,
        profile_image: String,
        name: String,
        username: String,
        location: String,
    },
    public_metrics: {
        Object,
        likes: Number,
        retweets: Number,
        replies: Number,
        quotes: Number,
    },
    link: String,
    tones: Object,
})

const Tweet = mongoose.model('tweet', tweetSchema);

export const getTweet = function (callback, limit) {
    Tweet.find(callback).limit(limit);
}

export default Tweet