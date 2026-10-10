const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Bot is running and active 24/7!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server is listening on port ${PORT}`);
});

const config = {
    host: process.env.SERVER_IP,       
    port: parseInt(process.env.SERVER_PORT) || 25565, 
    username: process.env.BOT_USERNAME || 'AFK_Bot_247',
    password: process.env.BOT_PASSWORD, 
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

        // AdvancedLogin Chat Commands (1.5s delay)
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            console.log("🔑 AdvancedLogin commands sent.");
        }, 1500); 

        // 🌟 HUMAN-LIKE MOVEMENT & HEAD ROTATION (Har 4 seconds me start hoga)
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            // 1. Random Head Movement (Yaw aur Pitch badalna)
            const randomYaw = (Math.random() * 360) * (Math.PI / 180); // 0 to 360 degree
            const randomPitch = ((Math.random() * 60) - 30) * (Math.PI / 180); // -30 to 30 degree (Upar/Neeche)
            bot.look(randomYaw, randomPitch, true);

            // 2. Random Direction choosing
            const directions = ['forward', 'back', 'left', 'right'];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            
            // Bot 3 seconds tak continuous chalega
            bot.setControlState(randomDir, true);
            
            // Exact 3 seconds baad chalna band karega
            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.setControlState(randomDir, false);
                }
            }, 3000);

        }, 4000); // Har 4 second me trigger hoga

        // Jump loop (Har 10 seconds me)
        if (jumpInterval) clearInterval(jumpInterval);
        jumpInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            bot.setControlState('jump', true);
            setTimeout(() => {
                if (bot && bot.entity) bot.setControlState('jump', false);
            }, 500);
        }, 10000);

        // Chat Loop (Har 1 Hour me 1 baar)
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

        // Server anytime online aaye toh join karne ke liye 20s ka loop chalta rahega
        setTimeout(createBot, config.reconnectInterval);
    });

    bot.on('error', (err) => console.log(`❌ Error: ${err.message}`));
}

createBot();
