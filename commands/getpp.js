const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'getpp',
    async execute(socket, msg) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const args = text.trim().split(/\s+/);
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        
        let target;

     
        if (contextInfo?.mentionedJid?.[0]) {
            target = contextInfo.mentionedJid[0];
        } 
      
        else if (contextInfo?.quotedMessage) {
            target = contextInfo.participant;
        } 
     
        else if (args[1]) {
            let rawNum = args.slice(1).join('').replace(/\D/g, '');
            if (rawNum.length >= 10) {
                target = `${rawNum}@s.whatsapp.net`;
            }
        } 
    
        else {
            target = msg.key.remoteJid;
        }

        const cleanJid = jidNormalizedUser(target);

        try {
          
            const ppUrl = await socket.profilePictureUrl(cleanJid, 'image');

            await socket.sendMessage(msg.key.remoteJid, {
                image: { url: ppUrl },
                caption: `*👤 Target:* @${cleanJid.split('@')[0]}\n*—*\n*Toxic-Mini-Bot*`,
                mentions: [cleanJid]
            }, { quoted: msg });

        } catch (e) {
          
            try {
                const ppUrl = await socket.profilePictureUrl(cleanJid, 'preview');
                await socket.sendMessage(msg.key.remoteJid, {
                    image: { url: ppUrl },
                    caption: `*👤 Target:* @${cleanJid.split('@')[0]}\n*—*\n*Tσxιƈ-ɱԃȥ (Low Res)*`,
                    mentions: [cleanJid]
                }, { quoted: msg });
            } catch (err) {
                await socket.sendMessage(msg.key.remoteJid, { 
                    text: "Privacy settings are blocking me. They have a higher IQ than you." 
                });
            }
        }
    }
};
