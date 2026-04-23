const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    description: 'Show main menu',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        try {
            const sanitized = (number || '').replace(/[^0-9]/g, '');
            
            // Safety check: if function is missing, use empty object
            let userCfg = {};
            if (typeof loadUserConfigFromMongo === 'function') {
                userCfg = await loadUserConfigFromMongo(sanitized) || {};
            }

            const startTime = socketCreationTime.get(sanitized) || Date.now();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const title = userCfg.botName || 'Toxic-Mini-Bot';
            const sender = msg.key.participant || msg.key.remoteJid;
            const userNumber = sender.split('@')[0];

            let commandNames = '';
            try {
                const commandsDir = __dirname;
                const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'index.js');
                commandNames = commandFiles.map(file => `> 々 .${file.replace('.js', '')}`).join('\n');
            } catch (e) {
                commandNames = '> 々 .play\n> 々 .video\n> 々 .weather'; 
            }

            const text = `Hi *@${userNumber}*... heh you finally found the menu 🫤? 

╭───(    \`𝐓𝐨𝐱𝐢𝐜-𝐌𝐢𝐧𝐢 𝐈𝐧𝐟𝐨\`    )───
> \`々\` 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞 : ${title}
> \`々\` 𝐎𝐰𝐧𝐞𝐫 : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
> \`々\` 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : 𝟏.𝟎.𝐛𝐞𝐭𝐚
> \`々\` 𝐑𝐮𝐧 𝐓𝐢𝐦𝐞 : ${hours}h ${minutes}m ${seconds}s
╰──────────────────☉

*FREE BOT PAIR LINK*
https://xhclinton.com/minibot

╭───(    \`𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬\`    )───
${commandNames}
╰──────────────────☉

*Don't just stare at them, pick one.*`;

            const defaultImg = 'https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png';
            const useLogo = userCfg.logo || defaultImg;
            const imagePayload = (typeof useLogo === 'string' && useLogo.startsWith('http')) ? { url: useLogo } : { url: defaultImg };

            await socket.sendMessage(msg.key.remoteJid, {
                image: imagePayload,
                caption: text,
                mentions: [sender]
            }, { quoted: msg });

        } catch (error) {
            console.error('Menu command error:', error);
            await socket.sendMessage(msg.key.remoteJid, { text: '❌ Error displaying menu.' });
        }
    }
};
