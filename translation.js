import {RTM_TOKEN, TARGET_LANGUAGE, PROJECT_ID} from './config';

const Translate = require('@google-cloud/translate');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const translateClient = Translate({
    projectId: PROJECT_ID,
    keyFilename: './slackTranslationBot-bd49c16473e1.json'
});

const rtm = new RtmClient(RTM_TOKEN);
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
console.log("message", message);
    translateClient.detect(message.text)
        .then((detection) => {

            if(detection[0].language != TARGET_LANGUAGE) {

                translateClient.translate(message.text, TARGET_LANGUAGE)
                    .then((translation) => {
                        rtm._send({
                            type: 'message',
                            text: "[Translation]:" + translation[0],
                            channel: message.channel,
                            'as_user': true
                        });
                    })
                    .catch((err) => {
                        console.error('ERROR:', err);
                    });
            }

        })
});

