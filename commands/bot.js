module.exports = {
    name: 'bot',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo) {
        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const cfg = await loadUserConfigFromMongo(sanitized) || {};
        const botName = cfg.botName || 'Toxic-Mini-Bot';

        const statusText = `*『 𝚃𝙾𝚇𝙸𝙲-𝙼𝙸𝙽𝙸-𝙱𝙾𝚃 𝚂𝚃𝙰𝚃𝚄𝚂 』*

╭───(    \`𝚂𝚢𝚜𝚝𝚎𝚖 𝙰𝚕𝚒𝚟𝚎\`    )───
> ───≫ ⚡ 𝚂𝚃𝙰𝚃𝚄𝚂 : Online
> \`々\` 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞 : ${botName}
> \`々\` 𝐎𝐰𝐧𝐞𝐫 : xh_clinton
> \`々\` 𝐌𝐞𝐦𝐨𝐫𝐲 : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
╰──────────────────☉

*Stop checking on me and get a life. I'm active and working harder than you ever will.*`;

        await socket.sendMessage(msg.key.remoteJid, {
            text: statusText,
            contextInfo: {
                externalAdReply: {
                    title: `${botName} is Active`,
                    body: "System: Operational",
                    thumbnailUrl: cfg.logo || 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png',
                    sourceUrl: "https://xhclinton.com/minibot",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};