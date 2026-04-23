const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

module.exports = {
    name: 'vv',
    description: 'Retrieve view-once media',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) return socket.sendMessage(msg.key.remoteJid, { text: "Are you blind? Reply to a view-once message." }, { quoted: msg });

            const viewOnce = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessageV2Extension?.message || quoted?.viewOnceMessage || quoted;
            const imageMsg = viewOnce?.imageMessage;
            const videoMsg = viewOnce?.videoMessage;

            if (!imageMsg && !videoMsg) {
                return socket.sendMessage(msg.key.remoteJid, { text: "This isn't even a view-once message. Stop wasting my time." }, { quoted: msg });
            }

            const mediaType = imageMsg ? 'image' : 'video';
            const mediaContent = imageMsg || videoMsg;
            
            const stream = await downloadContentFromMessage(mediaContent, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const caption = `🥀\n—\n*Toxic-Mini*\n\n> Imagine trying to hide this from me. Pathetic.`;

            if (imageMsg) {
                await socket.sendMessage(msg.key.remoteJid, { image: buffer, caption }, { quoted: msg });
            } else {
                await socket.sendMessage(msg.key.remoteJid, { video: buffer, caption }, { quoted: msg });
            }

        } catch (error) {
            console.error('VV Error:', error);
            await socket.sendMessage(msg.key.remoteJid, { text: "I couldn't grab it. Maybe your media is as broken as your logic." }, { quoted: msg });
        }
    }
};
