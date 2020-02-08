
self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('New notification', data);
    const options = {
        body: data.body
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    let notification = event.notification;
    let action = event.action;
    if (action === 'close') {
        notification.close()
    } else {
        clients.openWindow('https://google.com')
    }
});
