const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const router = express.Router();
const pino = require('pino');
const moment = require('moment-timezone');
const axios = require('axios');
const cors = require('cors');
const { MongoClient } = require('mongodb');

process.on('uncaughtException', (err) => {
    if (err.message.includes('Connection Closed') || err.message.includes('Stream Errored')) return;
});

router.use(cors());
router.use(express.json());
moment.tz.setDefault('Africa/Nairobi');

global.fetch = async (url, options = {}) => {
    try {
        const res = await axios({
            url,
            method: options.method || 'GET',
            data: options.body,
            headers: options.headers,
            responseType: options.responseType || 'json'
        });
        return {
            ok: res.status >= 200 && res.status < 300,
            status: res.status,
            json: async () => res.data,
            text: async () => typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        };
    } catch (e) {
        return { ok: false, status: 500, json: async () => ({}), text: async () => "" };
    }
};

const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  getContentType,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const config = {
  PREFIX: ',',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '254735342808',
  BOT_NAME: 'Toxic-Mini-Bot',
  GROUP_CODE: 'GoXKLVJgTAAC3556FXkfFI',
  KenyanTime: () => moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss')
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://frediminbot:fredi@2025@fredi.if1nhvv.mongodb.net/?appName=fredi';
const MONGO_DB = process.env.MONGO_DB || 'frediminbot';

let mongoClient, mongoDB, sessionsCol, numbersCol, adminsCol, configsCol;
const retryCount = new Map();
const retryConfig = new Map();

async function initMongo() {
  if (mongoClient?.topology?.isConnected()) return;
  try {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    mongoDB = mongoClient.db(MONGO_DB);
    sessionsCol = mongoDB.collection('sessions');
    numbersCol = mongoDB.collection('numbers');
    adminsCol = mongoDB.collection('admins');
    configsCol = mongoDB.collection('configs');
  } catch (e) {}
}

async function cleanupJunk() {
    try {
        const tempDir = os.tmpdir();
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            if (file.startsWith('session_')) {
                const fullPath = path.join(tempDir, file);
                const stats = fs.statSync(fullPath);
                if (Date.now() - stats.mtimeMs > 1000 * 60 * 60 * 6) {
                    fs.removeSync(fullPath);
                }
            }
        }
    } catch (e) {}
}

async function saveCredsToMongo(number, creds, keys = null) {
  await initMongo();
  const sanitized = number.replace(/[^0-9]/g, '');
  await sessionsCol.updateOne({ number: sanitized }, { $set: { number: sanitized, creds, keys, updatedAt: new Date() } }, { upsert: true });
}

async function loadCredsFromMongo(number) {
  await initMongo();
  const sanitized = number.replace(/[^0-9]/g, '');
  return await sessionsCol.findOne({ number: sanitized });
}

async function removeSessionFromMongo(number) {
  await initMongo();
  const sanitized = number.replace(/[^0-9]/g, '');
  await sessionsCol.deleteOne({ number: sanitized });
  await numbersCol.deleteOne({ number: sanitized });
  const sessionPath = path.join(os.tmpdir(), `session_${sanitized}`);
  if (fs.existsSync(sessionPath)) fs.removeSync(sessionPath);
}

async function getAllSessionsFromMongo() {
  await initMongo();
  return await sessionsCol.find({}).toArray();
}

const activeSockets = new Map();
const socketCreationTime = new Map();
const commands = require('./commands');

function setupCommandHandlers(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message || msg.key.remoteJid === 'status@broadcast') return;
            const from = msg.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = isGroup ? (msg.key.participant || from) : from;
            const userLid = msg.key.participant || from;
            const type = getContentType(msg.message);
            const body = (type === 'conversation') ? msg.message.conversation
                : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text 
                : (type === 'imageMessage') ? msg.message.imageMessage.caption 
                : (type === 'videoMessage') ? msg.message.videoMessage.caption : '';
            if (!body || !body.startsWith(config.PREFIX)) return;
            const command = body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase();
            const cmd = commands.get(command);
            if (cmd) {
                const loadUserConfigFromMongo = async (num) => {
                    await initMongo();
                    const doc = await configsCol.findOne({ number: num });
                    return doc ? doc.config : {};
                };
                const groupMetadata = isGroup ? await socket.groupMetadata(from).catch(() => null) : null;
                await cmd.execute(socket, msg, number, config, loadUserConfigFromMongo, activeSockets, socketCreationTime, {
                    isGroup, from, sender, userLid, groupMetadata
                });
            }
        } catch (err) {}
    });
}

async function ToxicPair(number, res = null) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const sessionPath = path.join(os.tmpdir(), `session_${sanitizedNumber}`);
  await initMongo();
  const mongoDoc = await loadCredsFromMongo(sanitizedNumber);
  if (mongoDoc?.creds) {
    fs.ensureDirSync(sessionPath);
    fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(mongoDoc.creds, null, 2));
  }
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const socket = makeWASocket({
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })) },
    printQRInTerminal: false,
    logger: pino({ level: 'fatal' }),
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    maxRetries: 5,
    mobile: false,
    generateHighQualityLinkPreview: true
  });

  setupCommandHandlers(socket, sanitizedNumber);

  if (!socket.authState.creds.registered && res) {
    try {
        await delay(3000);
        const code = await socket.requestPairingCode(sanitizedNumber);
        if (!res.headersSent) res.send({ code });
    } catch(e) {
        if (!res.headersSent) res.status(500).send({ error: "Try again later" });
    }
  }

  socket.ev.on('creds.update', async () => {
    await saveCreds();
    try {
        const credsObj = JSON.parse(fs.readFileSync(path.join(sessionPath, 'creds.json'), 'utf8'));
        await saveCredsToMongo(sanitizedNumber, credsObj, state.keys);
    } catch(e){}
  });

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      activeSockets.set(sanitizedNumber, socket);
      socketCreationTime.set(sanitizedNumber, Date.now());
      retryCount.set(sanitizedNumber, 0);
      retryConfig.delete(sanitizedNumber);
      try {
          await delay(2000);
          await socket.groupAcceptInvite(config.GROUP_CODE).catch(() => {});
      } catch(e) {}
      await numbersCol.updateOne({ number: sanitizedNumber }, { $set: { number: sanitizedNumber } }, { upsert: true });
    }
    if (connection === 'close') {
      activeSockets.delete(sanitizedNumber);
      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode;
      const shouldRestart = statusCode !== DisconnectReason.loggedOut;
      if (shouldRestart) {
          const config = retryConfig.get(sanitizedNumber) || { attempts: 0, nextTry: 0 };
          const now = Date.now();

          if (now < config.nextTry) return;

          const delays = [10000, 30000, 60000, 300000, 600000];
          const delayTime = delays[Math.min(config.attempts, delays.length - 1)];

          config.attempts++;
          config.nextTry = now + delayTime;
          retryConfig.set(sanitizedNumber, config);

          setTimeout(() => {
              if (config.attempts <= 10) {
                  ToxicPair(sanitizedNumber).catch(() => {});
              } else {
                  retryConfig.delete(sanitizedNumber);
              }
          }, delayTime);
      }
    }
  });
}

const usedMemory = () => Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;

setInterval(() => {
    console.log(`Memory: ${usedMemory()} MB | Active Bots: ${activeSockets.size}`);
}, 60000);

setInterval(async () => {
  const now = Date.now();
  for (const [number, socket] of activeSockets.entries()) {
    const createdTime = socketCreationTime.get(number);
    if (createdTime && now - createdTime > 1000 * 60 * 60 * 2) {
      try { 
          socket.ev.removeAllListeners();
          socket.end(); 
      } catch(e) {}
      activeSockets.delete(number);
      retryConfig.delete(number);
      await delay(5000);
      ToxicPair(number).catch(() => {});
    }
  }
}, 1000 * 60 * 15);

router.get('/ping', (req, res) => res.json({ status: "Online", timestamp: config.KenyanTime() }));
router.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await getAllSessionsFromMongo();
        res.json({ sessions });
    } catch(e) { res.json({ sessions: [] }); }
});
router.get('/api/active', (req, res) => {
    res.json({ count: activeSockets.size, active: Array.from(activeSockets.keys()) });
});
router.post('/api/session/delete', async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ ok: false });
    const sock = activeSockets.get(number);
    if (sock) { 
        try { 
            sock.ev.removeAllListeners();
            sock.end(); 
        } catch(e){} 
        activeSockets.delete(number); 
    }
    retryConfig.delete(number);
    await removeSessionFromMongo(number);
    res.json({ ok: true });
});
router.post('/api/terminate-all', async (req, res) => {
    try {
        for (const [num, sock] of activeSockets) { 
            try { 
                sock.ev.removeAllListeners();
                sock.end(); 
            } catch(e){} 
        }
        activeSockets.clear();
        retryConfig.clear();
        socketCreationTime.clear();
        await initMongo();
        await Promise.all([
            sessionsCol.deleteMany({}),
            numbersCol.deleteMany({})
        ]);
        const tempDir = os.tmpdir();
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            if (file.startsWith('session_')) {
                fs.removeSync(path.join(tempDir, file));
            }
        }
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false });
    }
});
router.get('/connect-all', async (req, res) => {
    const sessions = await getAllSessionsFromMongo();
    const BATCH_SIZE = 3;
    const DELAY_BETWEEN_BATCHES = 20000;

    for (let i = 0; i < sessions.length; i += BATCH_SIZE) {
        const batch = sessions.slice(i, i + BATCH_SIZE);
        for (let j = 0; j < batch.length; j++) {
            const s = batch[j];
            if (!activeSockets.has(s.number)) {
                await delay(j * 3000);
                ToxicPair(s.number).catch(() => {});
            }
        }
        if (i + BATCH_SIZE < sessions.length) await delay(DELAY_BETWEEN_BATCHES);
    }
    res.json({ status: 'success' });
});
router.get('/reconnect', async (req, res) => {
    const activeNumbers = Array.from(activeSockets.keys());
    for (let i = 0; i < activeNumbers.length; i += 3) {
        const batch = activeNumbers.slice(i, i + 3);
        for (let j = 0; j < batch.length; j++) {
            const num = batch[j];
            const sock = activeSockets.get(num);
            if (sock) { 
                try { 
                    sock.ev.removeAllListeners();
                    sock.end(); 
                } catch(e){} 
                activeSockets.delete(num);
                retryConfig.delete(num);
                await delay(j * 2000);
                ToxicPair(num).catch(() => {}); 
            }
        }
        if (i + 3 < activeNumbers.length) await delay(15000);
    }
    res.json({ status: 'success' });
});
router.get('/', async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).send({ error: 'Number required.' });
  ToxicPair(number, res).catch(() => {});
});

const SHARD_ID = parseInt(process.env.SHARD_ID || '0');
const TOTAL_SHARDS = parseInt(process.env.TOTAL_SHARDS || '1');

initMongo().then(async () => {
  await cleanupJunk();
  const sessions = await getAllSessionsFromMongo();
  const myBots = sessions.filter((_, index) => index % TOTAL_SHARDS === SHARD_ID);
  const BATCH_SIZE = 3;
  const DELAY_BETWEEN_BATCHES = 20000;

  for (let i = 0; i < myBots.length; i += BATCH_SIZE) {
    const batch = myBots.slice(i, i + BATCH_SIZE);
    for (let j = 0; j < batch.length; j++) {
      const s = batch[j];
      if (!activeSockets.has(s.number)) {
        await delay(j * 3000);
        ToxicPair(s.number).catch(() => {});
      }
    }
    if (i + BATCH_SIZE < myBots.length) await delay(DELAY_BETWEEN_BATCHES);
  }
}).catch(() => {});

setInterval(cleanupJunk, 1000 * 60 * 60 * 1);

module.exports = router;