const axios = require('axios');

module.exports = {
    name: 'tt',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const args = text.trim().split(/\s+/);
        const url = args[1];

        const fakevcard = {
            key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net", fromMe: false, id: "TOXIC_TT_ID" },
            message: { contactMessage: { displayName: "Toxic-Mini-Bot", vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Toxic;;;;\nFN:Toxic-Mini-Bot\nTEL;type=CELL;type=VOICE;waid=254735342808:+254 735 342 808\nEND:VCARD` } }
        };

        if (!url || !url.includes("tiktok.com")) {
            return socket.sendMessage(msg.key.remoteJid, { 
                text: "Drop a valid TikTok link, you absolute potato. My time is more valuable than your search history." 
            }, { quoted: fakevcard });
        }

        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};
        const botName = cfg.botName || 'Toxic-Mini-Bot';

        try {
            await socket.sendMessage(msg.key.remoteJid, { react: { text: '⌛', key: msg.key } });

            const { data } = await axios.get(`https://api.deline.web.id/downloader/tiktok`, {
                params: { url: url }
            });

            if (!data.status || !data.result) {
                await socket.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                return socket.sendMessage(msg.key.remoteJid, { text: "TikTok is playing hard to get. The video might be private or the link is garbage." }, { quoted: fakevcard });
            }

            const res = data.result;
            const caption = `*『 𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 』*

╭───(    \`𝚅𝚒𝚍𝚎𝚘 𝙳𝚎𝚝𝚊𝚒𝚕𝚜\`    )───
> ───≫ 📱 𝚃𝚒𝚔𝚃𝚘𝚔 ≫ <<───
> \`々\` 𝐀𝐮𝐭𝐡𝐨𝐫 : ${res.author?.nickname || 'Unknown'} (@${res.author?.unique_id || 'user'})
> \`々\` 𝐓𝐢𝐭𝐥𝐞 : ${res.title?.substring(0, 50) || 'No Title'}...
> \`々\` 𝐑𝐞𝐠𝐢𝐨𝐧 : ${res.region || 'Global'}
╰──────────────────☉

*Downloaded by ${botName}*`;

            await socket.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });

            await socket.sendMessage(msg.key.remoteJid, {
                video: { url: res.download },
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: `${botName} | TikTok Downloader`,
                        body: `User: ${res.author?.nickname}`,
                        thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                        sourceUrl: "https://xhclinton.com/minibot",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fakevcard });

        } catch (error) {
            console.error('TikTok DL Error:', error);
            await socket.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            await socket.sendMessage(msg.key.remoteJid, { 
                text: "TikTok downloader crashed. Your link is probably as broken as your life choices." 
            }, { quoted: fakevcard });
        }
    }
};
