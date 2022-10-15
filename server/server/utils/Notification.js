const webpush = require('web-push');
const SMS_KEY = process.env.SMS_KEY;
const SMS_URL = "https://www.fast2sms.com/dev/bulk";
const axios = require('axios');
const PUBLIC_KEY = "BBRP1ZEl46Gi9hSULLhQ7zDBrLR7R1qPW9l3eRNevfc7Fy_Vs33U4cmmiI3kuuTdYIg_yO_N3MUkSfaB_h5MVFI";
const PRIVATE_KEY = "ZO3lrETtmGdzHgXkSGwlHN8-Qb_Sni0fRu78EUTIf84";

const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys.publicKey);
console.log(vapidKeys.privateKey);


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

// webpush.sendNotification(sub, JSON.stringify(payload));

const sendNotification = async (place_name, credential) => {
  var payload = {
    notification: {
      body: 'Please reach out at ' + place_name + ', your turn is here.',
      icon: 'https://easywaitlist.herokuapp.com/assets/img/logo_wh_48.png',
      silent: false,
      title: 'Your Wait is Over!!',
      vibrate: [100, 50, 100]
    }
  };
  // webpush.sendNotification(credential, JSON.stringify(payload));

  var promise = await new Promise((resol, reject) => {
    webpush.sendNotification(credential, JSON.stringify(payload)).then(data => {
      console.log('push service', JSON.stringify(data));
      resol(true);
    }).catch(err => {

      console.log(err.message);
      console.log(err.statusCode);

      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log('410');
      }
      resol(false);
    });
  });

  return promise;
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


module.exports.sendNotification = sendNotification;

const sendMessage = async (place_name, mobile_no) => {

  var promise = await new Promise((resol, reject) => {
    axios.post(SMS_URL, {
      sender_id: 'CHKSMS',
      language: 'english',
      route: 'p',
      numbers: mobile_no,
      message: 'Your Wait is Over!!\nPlease reach out at ' + place_name + ', your turn is here.'
    }, {
      headers: { "authorization": SMS_KEY, "Content-Type": 'application/json', "Cache-Control": 'no-cache' }
    })
      .then((response) => {
        if (response.data.hasOwnProperty('message') && response.data.message == 'SMS sent successfully.') {
          resol(true);
        } else {
          resol(false)
        }
      }, (error) => {
        console.log(error.message);
        resol(false);
      });
  });
  return promise;
}

module.exports.sendMessage = sendMessage;