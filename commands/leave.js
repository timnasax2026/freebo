// leave.js
module.exports = {
    name: 'leave',
    async execute(socket, msg, number) {
        const owner = '254735342808';
        if (number !== owner && number !== (socket.user.id.split(':')[0])) return;
        if (!msg.key.remoteJid.endsWith('@g.us')) return;

        await socket.sendMessage(msg.key.remoteJid, { text: "Toxic-Mini-Bot is leaving this trash. ✌️" });
        await socket.groupLeave(msg.key.remoteJid);
    }
};
