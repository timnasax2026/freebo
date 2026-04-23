const axios = require('axios');

module.exports = {
    name: 'play',
    description: 'Downloads songs from Spotify and sends audio',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        try {
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const query = body.split(' ').slice(1).join(' ').trim();

            if (!query) {
                return socket.sendMessage(msg.key.remoteJid, { 
                    text: "Give me a song name, you tone-deaf cretin. I can't play silence." 
                }, { quoted: msg });
            }

            await socket.sendMessage(msg.key.remoteJid, { react: { text: '⌛', key: msg.key } });

            const { data } = await axios.get(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(query)}`);

            if (!data.status || !data.result?.download) {
                await socket.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                return socket.sendMessage(msg.key.remoteJid, { 
                    text: `No song found for "${query}". Your music taste is as bad as your search skills.` 
                }, { quoted: msg });
            }

            const song = data.result;
            const audioUrl = song.download;
            const filename = song.title || "Unknown Song";
            const artist = song.artists || "Unknown Artist";

            await socket.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });

            await socket.sendMessage(msg.key.remoteJid, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${filename}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: filename.substring(0, 30),
                        body: artist.substring(0, 30),
                        thumbnailUrl: song.image || "",
                        sourceUrl: "https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: msg });

            await socket.sendMessage(msg.key.remoteJid, {
                document: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
                caption: `🎵 *${filename}* - ${artist}\n—\n*Toxic-Mini-Bot*`
            }, { quoted: msg });

        } catch (error) {
            console.error('Spotify error:', error);
            await socket.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            await socket.sendMessage(msg.key.remoteJid, { 
                text: `Spotify download failed. The universe rejects your music taste.\nError: ${error.message}` 
            }, { quoted: msg });
        }
    }
};
