const axios = require('axios');

module.exports = {
    name: 'gpt',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const prompt = text.split(' ').slice(1).join(' ').trim();

        if (!prompt) {
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
                text: "Where is your prompt? You managed to type the command but forgot the question. Amazing." 
            }, { quoted: fakevcard });
        }

        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};

        try {
            const apiUrl = `https://api.deline.web.id/ai/openai`;
            
            const { data } = await axios.get(apiUrl, {
                params: {
                    text: prompt,
                    prompt: "You are toxic AI created by xhclinton and your replies must always be toxic"
                }
            });

            if (!data.status || !data.result) {
                throw new Error('API returned garbage');
            }

            const botName = cfg.botName || 'Toxic-Mini-Bot';

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

            const messageText = `*『 𝚃𝙾𝚇𝙸𝙲-𝙰𝙸 𝚁𝙴𝚂𝙿𝙾𝙽𝚂𝙴 』*\n\n${data.result}\n\n—\n${botName} • GPT-4O`;

            await socket.sendMessage(msg.key.remoteJid, {
                text: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: `${botName} | Toxic AI`,
                        body: "Created by xhclinton",
                        thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                        sourceUrl: "https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fakevcard });

        } catch (error) {
            console.error('GPT Error:', error);
            
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
                text: "AI failed. Maybe your question was too stupid even for AI." 
            }, { quoted: fakevcard });
        }
    }
};