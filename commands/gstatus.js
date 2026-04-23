const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'gstatus',
    aliases: ['groupstatus', 'gs'],
    async execute(socket, msg, number, config, loadUserConfigFromMongo, activeSockets, socketCreationTime, extras) {
        const { isGroup, from } = extras;
        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};
        const botName = cfg.botName || 'Toxic-Mini-Bot';

        // 1. Group Validation
        if (!isGroup) {
            return socket.sendMessage(from, { text: `*This command is for groups only.*` });
        }

        try {
            // 2. Identify Media/Text
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage || null;
            const messageToProcess = quoted ? quoted : msg.message;
            const type = Object.keys(messageToProcess)[0];
            const mime = messageToProcess[type]?.mimetype || '';
            
            const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
            const caption = body.replace(new RegExp(`^\\${config.PREFIX}(gstatus|groupstatus|gs)\\s*`, 'i'), '').trim();

            const defaultCaption = `⚡ *Group Status Uploaded* ⚡\n_Via ${botName}_`;

            // Helper to download media
            const downloadMedia = async (message, type) => {
                const stream = await downloadContentFromMessage(message, type.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            };

            // 3. Execution Logic
            if (/image/.test(mime)) {
                const buffer = await downloadMedia(messageToProcess[type], 'image');
                await socket.sendMessage(from, { groupStatusMessage: { image: buffer, caption: caption || defaultCaption } });
            } else if (/video/.test(mime)) {
                const buffer = await downloadMedia(messageToProcess[type], 'video');
                await socket.sendMessage(from, { groupStatusMessage: { video: buffer, caption: caption || defaultCaption } });
            } else if (/audio/.test(mime)) {
                const buffer = await downloadMedia(messageToProcess[type], 'audio');
                await socket.sendMessage(from, { groupStatusMessage: { audio: buffer, mimetype: 'audio/mp4' } });
            } else if (caption) {
                await socket.sendMessage(from, { groupStatusMessage: { text: caption } });
            } else {
                return socket.sendMessage(from, { text: `*Reply to media or add text to post a status.*` });
            }

            // 4. Success Response with your Styling
            const successText = `*📡 ${botName} Sᴛᴀᴛᴜs Uᴘʟᴏᴀᴅ*

╭───(    \`𝐓𝐨𝐱𝐢𝐜-𝐌𝐢𝐧𝐢 𝐒𝐭𝐚𝐭𝐬\`    )───
> ───≫ ⚡ Sᴛᴀᴛᴜs ⚡ <<───
> \`々\` 𝐓𝐲𝐩𝐞 : ${mime ? mime.split('/')[0].toUpperCase() : 'TEXT'}
> \`々\` 𝐔𝐩𝐥𝐨𝐚𝐝 : SUCCESSFUL ✅
> \`々\` 𝐒𝐞𝐫𝐯𝐞𝐫 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleString()}
╰──────────────────☉

*Status has been deployed to the group feed.*`;

            const fakevcard = {
                key: {
                    remoteJid: "status@broadcast",
                    participant: "0@s.whatsapp.net",
                    fromMe: false,
                    id: "META_AI_FAKE_ID"
                },
                message: {
                    contactMessage: {
                        displayName: botName,
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Toxic;;;;\nFN:${botName}\nORG:Toxic Bot\nTEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002\nEND:VCARD`
                    }
                }
            };

            await socket.sendMessage(from, {
                text: successText,
                contextInfo: {
                    externalAdReply: {
                        title: `${botName} - Status System`,
                        body: `Upload Complete`,
                        thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                        sourceUrl: "https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fakevcard });

        } catch (error) {
            console.error("GStatus Error:", error);
            await socket.sendMessage(from, { text: `*Error:* ${error.message}` });
        }
    }
};
