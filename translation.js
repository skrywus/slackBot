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
                            as_user: false
                        });

                        web.groups.list(message.channel)
                            .then(channel => {
                                channel.groups.forEach(channelInfo => {
                                    if(channelInfo.id === message.channel) {
                                        web.chat.postMessage(message.user, "Please use English on #" + channelInfo.name + " channel.", true);
                                    }
                                })
                            })
                            .catch(error => console.log(error));
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }

        });
});


