const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require('cors');

const __path = process.cwd();
const PORT = process.env.PORT || 8000;

// Import logic ya kule kwenye pair.js
let code = require('./pair'); 

// Kuongeza idadi ya listeners ili kuzuia kraschi wakati bot nyingi zikiwa online
require('events').EventEmitter.defaultMaxListeners = 1000;

app.use(cors());
// Marekebisho: Kutumia express.json() badala ya body-parser ya nje ni bora zaidi kwa sasa
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// Hii inatumia router kutoka pair.js kwa ajili ya ku-generate pairing code
app.use('/code', code);

// Njia ya kuonesha ukurasa wa ku-pair
app.get('/pair', async (req, res) => {
    res.sendFile(path.join(__path, '/pair.html'));
});

// Njia ya ukurasa mkuu (Dashboard)
app.get('/', async (req, res) => {
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
