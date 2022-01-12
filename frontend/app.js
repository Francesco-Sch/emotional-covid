function init() {
    fetch('http://localhost:3000/api/getAllTweets')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.data.forEach((tweet) => {
            let p = document.createElement('p');
            p.innerText = tweet.text;

            document.querySelector('body').appendChild(p);
        })
    });
}

init();