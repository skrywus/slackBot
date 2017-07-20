import {TOKEN, TARGET_LANGUAGE, PROJECT_ID} from './token/config';

const Translate = require('@google-cloud/translate');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const translateClient = Translate({
    projectId: PROJECT_ID,
    keyFilename: './token/slackTranslationBot-bd49c16473e1.json'
});

const web = new WebClient(TOKEN);
const rtm = new RtmClient(TOKEN);
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    translateClient.detect(message.text)
        .then((detection) => {

            if (detection[0].language != TARGET_LANGUAGE) {

                translateClient.translate(message.text, TARGET_LANGUAGE)
                    .then((translation) => {
                        rtm.send({
                            type: 'message',
                            text: "[Translated]: " + translation[0],
                            channel: message.channel,
                            user: message.user,
                            as_user: true
                        });

                        web.channels.info(message.channel)
                            .then(channelInfo => {
                                console.log(channelInfo);
                                web.chat.postMessage(message.user, "Please use English on #" + channelInfo.channel.name + " channel.", true);
                            });
                    })
                    .catch((err) => {
                        console.error('ERROR:', err);
                    });
            }

        });
});

