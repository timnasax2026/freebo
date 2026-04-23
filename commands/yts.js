const yts = require("yt-search");

module.exports = {
    name: 'yts',
    description: 'Search for YouTube videos',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        try {
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const text = body.split(' ').slice(1).join(' ').trim();

            if (!text) return socket.sendMessage(msg.key.remoteJid, { text: "Search for what? Use your words." }, { quoted: msg });

            const search = await yts(text);
            const results = search.videos.slice(0, 10);
            
            let list = `╭───(    \`𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐒𝐞𝐚𝐫𝐜𝐡\`    )───\n`;
            results.forEach((v, i) => {
                list += `> *${i + 1}.* ${v.title}\n> 🔗 ${v.url}\n> 🕒 ${v.timestamp}\n\n`;
            });
            list += `╰──────────────────☉\n*Pick one and use .video to download it.*`;

            await socket.sendMessage(msg.key.remoteJid, {
                image: { url: results[0].thumbnail },
                caption: list
            }, { quoted: msg });

        } catch (e) {
            await socket.sendMessage(msg.key.remoteJid, { text: "Search failed. Even Google hates you." }, { quoted: msg });
        }
    }
};
