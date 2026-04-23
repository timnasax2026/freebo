const { jidNormalizedUser, downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'fullpp',
    async execute(socket, msg, number) {
        const owner = '254735342808';
        const botJid = jidNormalizedUser(socket.user.id);
        if (number !== owner && number !== botJid.split('@')[0]) return;

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.imageMessage) return socket.sendMessage(msg.key.remoteJid, { text: "REPLY TO AN IMAGE!" });

        try {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        
            await socket.updateProfilePicture(botJid, buffer);
            
            await socket.sendMessage(msg.key.remoteJid, { text: "✅ *Profile Picture Updated. Looking dangerous.*" });
        } catch (e) {
            await socket.sendMessage(msg.key.remoteJid, { text: `Error: ${e.message}` });
        }
    }
};
