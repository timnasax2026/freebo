const axios = require('axios');

module.exports = {
    name: 'fbdl',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const args = text.trim().split(/\s+/);
        const url = args[1];

        const fakevcard = {
            key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net", fromMe: false, id: "TOXIC_FB_ID" },
            message: { contactMessage: { displayName: "Toxic-Mini-Bot", vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Toxic;;;;\nFN:Toxic-Mini-Bot\nTEL;type=CELL;type=VOICE;waid=254735342808:+254 735 342 808\nEND:VCARD` } }
        };

        if (!url || (!url.includes("facebook.com") && !url.includes("fb.watch"))) {
            return socket.sendMessage(msg.key.remoteJid, { 
                text: "Give me a valid Facebook link, you absolute potato. I don't have all day." 
            }, { quoted: fakevcard });
        }

        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};
        const botName = cfg.botName || 'Toxic-Mini-Bot';

        try {
            await socket.sendMessage(msg.key.remoteJid, { react: { text: '⌛', key: msg.key } });

            const { data } = await axios.get(`https://vinztyty.my.id/download/facebook`, {
                params: { url: url }
            });

            if (!data.status || !data.result || data.result.length === 0) {
                await socket.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                return socket.sendMessage(msg.key.remoteJid, { text: "No video found. This link is as empty as your head." }, { quoted: fakevcard });
            }

            const videos = data.result;
            let videoToUse = videos.find(v => v.quality && v.quality.includes("720p")) || videos[0];

            if (!videoToUse || !videoToUse.url || videoToUse.url === "/") {
                throw new Error("Invalid URL returned");
            }

            const caption = `*『 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 』*

╭───(    \`𝐕𝐢𝐝𝐞𝐨 𝐃𝐞𝐭𝐚𝐢𝐥𝐬\`    )───
> ───≫ 📱 𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔 ≫ <<───
> \`々\` 𝐐𝐮𝐚𝐥𝐢𝐭𝐲 : ${videoToUse.quality || 'HD'}
> \`々\` 𝐒𝐭𝐚𝐭𝐮𝐬 : Success
╰──────────────────☉

*Downloaded by ${botName}*`;

            await socket.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });

            await socket.sendMessage(msg.key.remoteJid, {
                video: { url: videoToUse.url },
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: `${botName} | FB Downloader`,
                        body: "Video Saved Successfully",
                        thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                        sourceUrl: "https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fakevcard });

        } catch (error) {
            await socket.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            await socket.sendMessage(msg.key.remoteJid, { 
                text: "Facebook download failed harder than your IQ. Try again or touch grass." 
            }, { quoted: fakevcard });
        }
    }
};
