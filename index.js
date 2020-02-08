const express = require ('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
let { VAPID } = require ('./vapid');

const app = express();

app.use(cors());
app.use(bodyParser.json());
webpush.setVapidDetails(VAPID.subject, VAPID.publicKey, VAPID.privateKey);

app.get('/', (req, res) => {
    res.send('Hello world!')
});

app.post('/notifications/subscribe', (req, res) => {
    const subscription = req.body;
    console.log(subscription);
    const payload = JSON.stringify({
        title: 'Hello!',
        body: 'Notification from Backend',
    });

    webpush.sendNotification(subscription, payload)
        .then(result => console.log(result))
        .catch(e => console.log(e.stack));

    res.status(200).json({'success': true})
});

app.listen(3000, () => console.log('The server has been started on the port 3000'));
