const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'speed',
    description: 'Check bot latency',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};
        const botName = cfg.botName || 'Toxic-Mini-Bot';

        const latency = Date.now() - (msg.messageTimestamp * 1000 || Date.now());

        const text = `*📡 ${botName} Pɪɴɢ Nᴏᴡ*

╭───(    \`𝐓𝐨𝐱𝐢𝐜-𝐌𝐢𝐧𝐢 𝐒𝐭𝐚𝐭𝐬\`    )───
> ───≫ ⚡ Pɪɴɢ ⚡ <<───
> \`々\` 𝐋𝐚𝐭𝐞𝐧𝐜𝐲 : ${latency}ms
> \`々\` 𝐒𝐞𝐫𝐯𝐞𝐫 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleString()}
> \`々\` 𝐀𝐜𝐭𝐯. 𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐬 : ${activeSockets.size}
╰──────────────────☉

*Took you long enough to check. I'm faster than your response time anyway.*`;

        const fakevcard = {
            key: {
                remoteJid: "status@broadcast",
                participant: "0@s.whatsapp.net",
                fromMe: false,
                id: "META_AI_FAKE_ID"
            },
            message: {
                contactMessage: {
                    displayName: "Toxic-Mini-Bot",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Toxic;;;;\nFN:Toxic-Mini-Bot\nORG:Toxic Bot\nTEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002\nEND:VCARD`
                }
            }
        };

        await socket.sendMessage(msg.key.remoteJid, {
            text: text,
            contextInfo: {
                externalAdReply: {
                    title: `${botName} - Latency Check`,
                    body: `Speed: ${latency}ms`,
                    thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                    sourceUrl: "https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: fakevcard });
    }
};