const webpush = require('web-push');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// const PUBLIC_KEY = process.env.NOTIFICATION_PUBLIC_KEY;
// const PRIVATE_KEY = process.env.NOTIFICATION_PRIVATE_KEY;

const PUBLIC_KEY = 'BPi3By2R0nFqzVlxVOOjym-co_hFY2QuOzT41mP_NTYchfVpyN1Z4FANRXy5XpTYJ6dfSaS2BfPvx_lwvfL3u4s';
const PRIVATE_KEY = 'Wgp0yFBYeIUFk9Ie1qRzfV-OKjAhqX7MGKVmRjCDels';

webpush.setVapidDetails('mailto:bhargav.sarvaria@gmail.com', PUBLIC_KEY, PRIVATE_KEY);

const sub = {
    endpoint: "https://fcm.googleapis.com/fcm/send/fQVeKZG4sbk:APA91bFlk98iKsDAwLsTomeqb5WVuXeb-y1hHLhFlK_IOWOMTm0gVProKd8ckLUwL9n9bgnNlqyxro2_SGWplh_R0oFWv3ozyQjRgqu5Dd5nmRRiEOuheEb4FTaWmgrnL5KAZkClQmvF",
    expirationTime: null,
    keys: {
      p256dh: "BEGvPayKhQXBuseDxUzJLTi4vZVATIp4FOtrVzaojdm4pDoxbddUDYYuJ_pIlFFy8ABq6y8yXYACVHSZ-9AWtF0",
      auth: "DHiCw4Cq1nXCJ98BWFdBfw"
    }
}

var payload = {
    notification: {
      body: 'body',
      data: 'data',
      icon: 'https://easywaitlist.herokuapp.com/assets/img/logo_wh_48.png',
      silent: false,
      title: 'Your Wait is Over!!',
      vibrate: [100, 50, 100]
  }  
};

function sendNotification(place_name, credential) {
    var payload = {
        notification: {
          body: 'Please reach out at ' + place_name + ', your turn is here.',
          icon: 'https://easywaitlist.herokuapp.com/assets/img/logo_wh_48.png',
          silent: false,
          title: 'Your Wait is Over!!',
          vibrate: [100, 50, 100]
      }  
    };
    webpush.sendNotification(credential, JSON.stringify(payload));
}

module.exports.sendNotification = sendNotification;

// webpush.sendNotification(sub, JSON.stringify(payload));