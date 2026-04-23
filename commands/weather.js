const axios = require('axios');

module.exports = {
    name: 'weather',
    description: 'Get weather info for a city.',
    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo, activeSockets, socketCreationTime) {
        try {
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const text = body.split(' ').slice(1).join(' ').trim();

            if (!text) {
                return socket.sendMessage(msg.key.remoteJid, { 
                    text: `Yo, genius, give me a city name! Don’t waste my time.` 
                }, { quoted: msg });
            }

            const { data } = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=1ad47ec6172f19dfaf89eb3307f74785`);

            const cityName = data.name;
            const temperature = data.main.temp;
            const feelsLike = data.main.feels_like;
            const description = data.weather[0].description;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const cloudiness = data.clouds.all;

            const weatherReport = `╭───(    \`𝐖𝐞𝐚𝐭𝐡𝐞𝐫 𝐑𝐞𝐩𝐨𝐫𝐭\`    )───
> 🌎 *𝐂𝐢𝐭𝐲:* ${cityName}
> 🌡️ *𝐓𝐞𝐦𝐩:* ${temperature}°C
> 🥵 *𝐅𝐞𝐞𝐥𝐬:* ${feelsLike}°C
> 📝 *𝐃𝐞𝐬𝐜:* ${description}
> 💧 *𝐇𝐮𝐦𝐢𝐝𝐢𝐭𝐲:* ${humidity}%
> 🌀 *𝐖𝐢𝐧𝐝:* ${windSpeed} m/s
> ☁️ *𝐂𝐥𝐨𝐮𝐝𝐬:* ${cloudiness}%
╰──────────────────☉
*There you go. Now stop asking for the obvious.*`;

            await socket.sendMessage(msg.key.remoteJid, { text: weatherReport }, { quoted: msg });

        } catch (e) {
            await socket.sendMessage(msg.key.remoteJid, { 
                text: `What the hell? Can’t find that place. Pick a real city, idiot.` 
            }, { quoted: msg });
        }
    }
};
