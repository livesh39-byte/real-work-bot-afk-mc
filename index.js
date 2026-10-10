const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// ---- PORT FOR RENDER ----
const PORT = process.env.PORT || 3000;

// Simple webpage layout for UptimeRobot to ping
app.get('/', (req, res) => {
    res.send('🤖 Bot is running and active 24/7!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server is listening on port ${PORT}`);
});

// ---- CONFIGURATION USING ENVIRONMENT VARIABLES ----
const config = {
    host: process.env.SERVER_IP,       // Will be set in Render
    port: parseInt(process.env.SERVER_PORT) || 25565, 
    username: process.env.BOT_USERNAME || 'AFK_Bot_247',
    password: process.env.BOT_PASSWORD, // Will be set in Render
    reconnectInterval: 20000,   
    maxOfflineTime: 30 * 60000  
};

let bot;
let offlineTimer = null;
let isOffline = false;
let moveInterval = null;
let jumpInterval = null;
let chatInterval = null;

function createBot() {
    // Safety check if variables are missing
    if (!config.host || !config.password) {
        console.log("❌ Error: SERVER_IP or BOT_PASSWORD environment variables are missing!");
        return;
    }

    console.log("🤖 Server se connect karne ka try kar raha hu...");

    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        auth: 'offline'
    });

    bot.once('spawn', () => {
        console.log("✅ Bot server me join ho gaya!");
        
        if (offlineTimer) {
            clearTimeout(offlineTimer);
            offlineTimer = null;
            isOffline = false;
            console.log("⏱️ Offline timer reset.");
        }

        // Fast AuthMe Login
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            console.log("🔑 AuthMe command send.");
        }, 1500); 

        // Random Movement every 3s
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            const directions = ['forward', 'back', 'left', 'right'];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            bot.setControlState(randomDir, true);
            setTimeout(() => {
                if (bot && bot.entity) bot.setControlState(randomDir, false);
            }, 1000);
        }, 3000);

        // Jump every 10s
        if (jumpInterval) clearInterval(jumpInterval);
        jumpInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            bot.setControlState('jump', true);
            setTimeout(() => {
                if (bot && bot.entity) bot.setControlState('jump', false);
            }, 500);
        }, 10000);

        // Chat every 1 Hour
        if (chatInterval) clearInterval(chatInterval);
        chatInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            bot.chat("IM GRINDING.....");
            console.log("💬 Chat sent: IM GRINDING.....");
        }, 60 * 60000);
    });

    bot.on('end', (reason) => {
        console.log(`⚠️ Bot disconnected: ${reason}`);
        clearInterval(moveInterval);
        clearInterval(jumpInterval);
        clearInterval(chatInterval);
        
        if (!isOffline) {
            isOffline = true;
            offlineTimer = setTimeout(() => {
                console.log("❌ 30m limit reached. Stopping reconnect loop.");
                process.exit(0); 
            }, config.maxOfflineTime);
        }

        setTimeout(createBot, config.reconnectInterval);
    });

    bot.on('error', (err) => console.log(`❌ Error: ${err.message}`));
}

createBot();
  
