const axios = require('axios');

module.exports = {
    name: 'pair',
    description: 'Pair a new number',
    async execute(socket, msg) {
        const fullText = msg.message?.conversation 
            || msg.message?.extendedTextMessage?.text 
            || '';
        
        const args = fullText.trim().split(/\s+/);
        let rawInput = args.slice(1).join('');

        if (!rawInput) {
            await socket.sendMessage(
                msg.key.remoteJid,
                { text: '❌ Please provide a number\nUsage: .pair 254712345678' },
                { quoted: msg }
            );
            return;
        }

        let targetNumber = rawInput.replace(/\D/g, '');

        if (targetNumber.length < 9) {
            await socket.sendMessage(
                msg.key.remoteJid,
                { text: '❌ Invalid number format. Ensure you include the country code without the + sign.\nExample: 254712345678' },
                { quoted: msg }
            );
            return;
        }

        try {
            await socket.sendMessage(
                msg.key.remoteJid,
                { text: `⏳ Generating pairing code for ${targetNumber}...` },
                { quoted: msg }
            );

            const response = await axios.get(
                `https://toxic-mini-bot-f3822bd15856.herokuapp.com/code?number=${targetNumber}`
            );

            if (!response.data?.code) {
                await socket.sendMessage(
                    msg.key.remoteJid,
                    { text: '❌ Failed to generate pairing code. System might be busy.' },
                    { quoted: msg }
                );
                return;
            }

            const pairingCode = response.data.code;

            const text = `✅ *Pairing Code Generated*

╭───(    \`𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐃𝐞𝐭𝐚𝐢𝐥𝐬\`    )───
> ───≫ 🔗 PAIRING <<───
> \`々\` 𝐍𝐮𝐦𝐛𝐞𝐫 : ${targetNumber}
> \`々\` 𝐂𝐨𝐝𝐞 : ${pairingCode}
> \`々\` 𝐒𝐭𝐚𝐭𝐮𝐬 : Active
╰──────────────────☉
*Use this code in WhatsApp:*
1. Open WhatsApp → Settings
2. Tap Linked Devices
3. Tap Link a Device
4. Enter this code`;

            await socket.sendMessage(
                msg.key.remoteJid,
                {
                    text: text,
                    contextInfo: {
                        externalAdReply: {
                            title: "Toxic-Mini-Bot Pairing",
                            body: "Developer: xh_clinton",
                            thumbnailUrl: "https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/mini.png",
                            sourceUrl: "https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: msg }
            );

        } catch (error) {
            await socket.sendMessage(
                msg.key.remoteJid,
                { text: `❌ Failed to generate pairing code: ${error.message}` },
                { quoted: msg }
            );
        }
    }
};
