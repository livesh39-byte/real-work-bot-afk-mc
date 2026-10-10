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

        // AdvancedLogin Chat Commands
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            console.log("🔑 AdvancedLogin commands sent.");
        }, 1500); 

        // 🌟 HUMAN-LIKE MOVEMENT & HEAD ROTATION (4s loop, 3s walk)
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            const randomYaw = (Math.random() * 360) * (Math.PI / 180);
            const randomPitch = ((Math.random() * 60) - 30) * (Math.PI / 180);
            bot.look(randomYaw, randomPitch, true);

            const directions = ['forward', 'back', 'left', 'right'];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            
            bot.setControlState(randomDir, true);
            
            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.setControlState(randomDir, false);
                }
            }, 3000);

        }, 4000);

        // Jump loop (Har 10 seconds me)
        if (jumpInterval) clearInterval(jumpInterval);
        jumpInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            bot.setControlState('jump', true);
            setTimeout(() => {
                if (bot && bot.entity) bot.setControlState('jump', false);
            }, 500);
        }, 10000);

        // 🌟 UPDATED: Chat Loop (Ab har 10 Minutes me 1 baar msg bhejea)
        if (chatInterval) clearInterval(chatInterval);
        chatInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            bot.chat("IM GRINDING.....");
            console.log("💬 Chat sent: IM GRINDING.....");
        }, 10 * 60000); // 10 Minutes * 60000ms
    });

    // 🌟 NEW: MANIOHOST CAPTCHA & VERIFICATION SOLVER
    bot.on('message', (jsonMsg) => {
        const messageText = jsonMsg.toString();
        
        // Kisi normal player ke messages ko ignore karega, sirf System/Server triggers ko read karega
        if (messageText.includes("MangoHost AFK Verification") || messageText.includes("AFK VERIFICATION") || messageText.includes("Type the answer in chat")) {
            console.log(`🚨 MangoHost Captcha Alert Detected: "${messageText}"`);

            // Regular Expression jo text me se numbers aur symbols (जैसे 31 + 9) ko alag nikalega
            const mathMatch = messageText.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);

            if (mathMatch) {
                const num1 = parseInt(mathMatch[1]);
                const operator = mathMatch[2];
                const num2 = parseInt(mathMatch[3]);
                let correctAnswer;

                // Sahi operator se math solve karna
                if (operator === '+') correctAnswer = num1 + num2;
                else if (operator === '-') correctAnswer = num1 - num2;
                else if (operator === '*') correctAnswer = num1 * num2;
                else if (operator === '/') correctAnswer = num1 / num2;

                if (correctAnswer !== undefined) {
                    console.log(`🧠 Bot calculated answer: ${num1} ${operator} ${num2} = ${correctAnswer}`);
                    
                    // 20 Seconds ka delay taaki host ko lagay real insaan type kar raha hai (Safe zone under 5 mins)
                    setTimeout(() => {
                        if (bot && bot.entity) {
                            bot.chat(correctAnswer.toString());
                            console.log(`📤 Captcha Answer sent to chat: ${correctAnswer}`);
                        }
                    }, 20000); // 20 Seconds delay
                }
            } else {
                console.log("⚠️ Verification alert toh mila par Math equation format match nahi hua.");
            }
        }
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
    
