module.exports = {
    name: 'join',
    async execute(socket, msg, number) {
        const owner = '254735342808';
        const botNumber = socket.user.id.split(':')[0];
        
        // Restriction check
        if (number !== owner && number !== botNumber) return;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;

        // 1. Get text from current message
        let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        // 2. If replying to text, check that text too
        if (quotedMsg?.conversation) {
            text += " " + quotedMsg.conversation;
        } else if (quotedMsg?.extendedTextMessage?.text) {
            text += " " + quotedMsg.extendedTextMessage.text;
        }

        // 3. If replying to an image/video, check the caption
        const mediaCaption = quotedMsg?.imageMessage?.caption || quotedMsg?.videoMessage?.caption;
        if (mediaCaption) {
            text += " " + mediaCaption;
        }

        const match = text.match(/chat\.whatsapp\.com\/([\w\d]+)/);

        if (!match) {
            return socket.sendMessage(msg.key.remoteJid, { 
                text: "❌ Where is the link? Reply to a message with a link or provide it after the command, you potato." 
            }, { quoted: msg });
        }

        try {
            await socket.groupAcceptInvite(match[1]);
            await socket.sendMessage(msg.key.remoteJid, { 
                text: "✅ *Toxic-Mini-Bot has entered the chat.*" 
            }, { quoted: msg });
        } catch (e) {
            await socket.sendMessage(msg.key.remoteJid, { 
                text: "❌ Failed to join. Either the link is revoked, the group is full, or I'm banned from that trash heap." 
            }, { quoted: msg });
        }
    }
};
