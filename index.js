const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require('cors');


const __path = process.cwd();
const PORT = process.env.PORT || 8000;


let code = require('./pair'); 


require('events').EventEmitter.defaultMaxListeners = 500;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- ROUTES ---

app.use('/code', code);


app.use('/pair', async (req, res) => {
    res.sendFile(path.join(__path, '/pair.html'));
});


app.use('/', async (req, res) => {
    res.sendFile(path.join(__path, '/main.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`
╭───(    \`𝐓𝐨𝐱𝐢𝐜-𝐌𝐢𝐧𝐢 𝐁𝐨𝐭\`    )───
> ───≫ 🚀 Sᴛᴀʀᴛᴜᴘ <<───
> \`々\` 𝐒𝐭𝐚𝐭𝐮𝐬 : Started Successfully
> \`々\` 𝐌𝐨𝐝𝐞 : Online & Ready
> \`々\` 𝐏𝐨𝐫𝐭 : ${PORT}
> \`々\` 𝐔𝐑𝐋 : http://localhost:${PORT}
╰──────────────────☉
`);
});

module.exports = app;