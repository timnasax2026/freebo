const axios = require('axios');

module.exports = {
    name: 'ig',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const args = text.split(' ');
        const url = args[1];

        if (!url || !url.includes("instagram.com")) {
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
            
            return socket.sendMessage(msg.key.remoteJid, { 
                text: "Link is missing or garbage. Give me a proper Instagram link." 
            }, { quoted: fakevcard });
        }

        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};

        try {
            const { data } = await axios.get(`https://api.fikmydomainsz.xyz/download/instagram`, {
                params: { url: url }
            });

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

            const botName = cfg.botName || 'Toxic-Mini-Bot';
            const videoUrl = data.result?.[0]?.url_download;

            if (!videoUrl) {
                throw new Error('No video URL found');
            }

            const caption = `*『 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 』*

╭───(    \`𝐌𝐞𝐝𝐢𝐚 𝐃𝐞𝐭𝐚𝐢𝐥𝐬\`    )───
> ───≫ 📸 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖 ≫ <<───
> \`々\` 𝐒𝐭𝐚𝐭𝐮𝐬 : Downloaded
> \`々\` 𝐐𝐮𝐚𝐥𝐢𝐭𝐲 : High
> \`々\` 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : Instagram
╰──────────────────☉

*Downloaded by ${botName}*`;

            await socket.sendMessage(msg.key.remoteJid, {
                video: { url: videoUrl },
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: `${botName} | Instagram Downloader`,
                        body: "Media Saved Successfully",
                        thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                        sourceUrl: "https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fakevcard });

        } catch (error) {
            console.error('Instagram Error:', error);
            
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
                text: "Instagram service failed. Link might be private or broken." 
            }, { quoted: fakevcard });
        }
    }
};