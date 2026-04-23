const fs = require('fs');
const path = require('path');

const commands = new Map();

const commandFiles = fs.readdirSync(__dirname).filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(path.join(__dirname, file));
        if (command.name) {
            commands.set(command.name, command);
        }
    } catch (error) {
        console.error(`Error loading command ${file}:`, error);
    }
}

module.exports = commands;