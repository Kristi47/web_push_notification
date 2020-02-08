let module = (function(){

    // convert vapid key
    const convertedVapidKey = urlBase64ToUint8Array('BAJc8HxoSGRFEVlICpAhIKiQBt7Uct_fnG9HXa5QdV8NhlqjHROELnnjYJPz1_VeDJKGV5ImWjtHuXcWkCtkV_w');
    function urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // user subscribes for push notification
    function subscribeUser() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(reg) {
                reg.pushManager.subscribe({
                    applicationServerKey: convertedVapidKey,
                    userVisibleOnly: true
                }).then(function(sub) {
                    console.log('Endpoint URL: ', sub.endpoint);
                    sendSubscription(sub)
                }).catch(function(e) {
                    if (Notification.permission === 'denied') {
                        console.warn('Permission for notifications was denied');
                    } else {
                        console.error('Unable to subscribe to push', e);
                    }
                });
            })
        }
    }

    // make request to subscribe endpoint
    function sendSubscription(sub) {
        return fetch('http://localhost:3000/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify(sub),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    // Request Permission to show notifications - Notification API
    let requestPermission = function requestPermission() {
        Notification.requestPermission().then(status => {
            console.log('Notification permission status:', status);
            this.registerServiceWorker();
        });
    };

    // Register a service worker which will handle the push event for notifications
    let registerServiceWorker = function register(){
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./../public/sw.js')
                    .then( register => {
                        console.log(register);
                        register.pushManager.getSubscription().then( subscription => {
                            if (subscription == null) {
                                console.log("Please register for subscription");
                                subscribeUser()
                            }
                            else {
                                console.log('Already Registered: ', subscription);
                                sendSubscription(subscription)
                            }
                        })
                    })
                    .catch( error => {
                        console.log(error)
                    })
            });
        }
    };

    return {
        requestPermission: requestPermission,
        registerServiceWorker: registerServiceWorker
    }

})();

/*
On the client:
1. Subscribe to the push service
2. Send the subscription object to the server

On the server:
1. Generate the data that we want to send to the user
2. Encrypt the data with the user public key
3. Send the data to the endpoint URL with a payload of encrypted data.

The message is routed to the user's device. This wakes up the browser, which finds the correct service worker and invokes a "push" event. Now, on the client:
1. Receive the message data (if there is any) in the "push" event
2. Perform some custom logic in the push event
3. Show a notification
*/
