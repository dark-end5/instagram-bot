require('dotenv').config();
const { IgApiClient } = require('instagram-private-api');

const ig = new IgApiClient();

// --- Configuration States & Stats ---
let botPrefix = '!';              
let botMode = 'public';           
let autoReadMode = true; 
const startTime = Date.now(); // Track system start time for uptime metrics

// Owner and Bot Configuration Data
const BOT_INFO = {
  name: "Eliud Lesta",
  version: "v2.5.0-Stable"
};

const OWNER_INFO = {
  name: "Eliud Njora",
  username: "eliud_njora", // Change this string to your exact personal Instagram handle if different
  status: "Global Admin Authority"
};

// --- Helper Functions ---
function applyEmojiMox(text) {
  let modifiedText = text;
  if (modifiedText.toLowerCase().includes('success') || modifiedText.toLowerCase().includes('done')) {
    modifiedText += ' 🔥🚀';
  }
  if (modifiedText.toLowerCase().includes('error') || modifiedText.toLowerCase().includes('fail')) {
    modifiedText += ' ⚠️❌';
  }
  return modifiedText;
}

// Format milliseconds into human-readable format string
function getFormattedUptime() {
  const diff = Date.now() - startTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function login() {
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  console.log(`✅ ${BOT_INFO.name} logged into Instagram successfully!`);
}

async function checkDMs() {
  try {
    const inboxFeed = ig.feed.directInbox();
    const threads = await inboxFeed.items();

    for (const thread of threads) {
      const lastMessage = thread.last_permanent_item;
      
      if (lastMessage && lastMessage.item_type === 'text') {
        const rawText = lastMessage.text.trim();
        const myUserId = ig.state.cookieUserId;

        // Skip the bot's own responses
        if (lastMessage.user_id.toString() === myUserId.toString()) continue;

        // Filter Strategy for Bot Mode (Public / Private / Group)
        const isGroup = thread.is_group;
        if (botMode === 'private' && isGroup) continue; 
        if (botMode === 'group' && !isGroup) continue;  

        // Check if the message starts with the defined command prefix
        if (!rawText.startsWith(botPrefix)) continue;

        const cleanInput = rawText.slice(botPrefix.length).trim();
        const args = cleanInput.split(' ');
        const command = args[0].toLowerCase();

        console.log(`Received command: "${command}" from thread: ${thread.thread_id}`);
        const threadEntity = ig.entity.directThread(thread.thread_id);

        if (autoReadMode) {
          await threadEntity.markAsRead(lastMessage.item_id);
        }

        let responseText = '';

        switch (command) {
          // --- Customized Stylized Menu Layout ---
          case 'allmenu':
          case 'help':
            responseText = 
              `┏━━━✨ Eliud 𝐁𝐎𝐓 𝐌𝐄𝐍𝐔 ✨━━━┓\n` +
              `┃ ɴᴀᴍᴇ: [ ${BOT_INFO.name} ]\n` +
              `┃ ᴘʀᴇғɪx: [ ${botPrefix} ] | ᴍᴏᴅᴇ: [ ${botMode.toUpperCase()} ]\n` +
              `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
              `┃ 🤖 *SYSTEM MANAGEMENT*:\n` +
              `┃ 🔗 ${botPrefix}botinfo - Engine parameters\n` +
              `┃ ⏳ ${botPrefix}uptime - Performance lifetime status\n` +
              `┃ 👑 ${botPrefix}owner - Developer credentials\n` +
              `┃ 👥 ${botPrefix}groupinfo - Thread structural context\n` +
              `┃ ⚙️ ${botPrefix}prefix [symbol] - Change global trigger\n` +
              `┃ 🔒 ${botPrefix}mode [public/private/group]\n` +
              `┃ 📋 ${botPrefix}tagstatus - Profile statistics meta\n` +
              `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
              `┃ ⚙️ *AUTOMATION SUITE*:\n` +
              `┃ 🖊️ ${botPrefix}autotyping - Emulate text composition\n` +
              `┃ 📝 ${botPrefix}autobio [text] - Direct profile modification\n` +
              `┃ 🗒️ ${botPrefix}autonote [text] - Server localized logs\n` +
              `┃ 👁️ ${botPrefix}autoread [on/off] - Toggle viewing state\n` +
              `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
              `┃ 🛠️ *UTILITIES & RECREATION*:\n` +
              `┃ 🧠 ${botPrefix}ai [prompt] - Model processing core\n` +
              `┃ 📥 ${botPrefix}download [url] - Multi-media asset pipelines\n` +
              `┃ 🎮 ${botPrefix}game - Rock-Paper-Scissors matrix\n` +
              `┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            break;

          // --- Bot Info ---
          case 'botinfo':
            responseText = 
              `🤖 *🔮 ${BOT_INFO.name} CORE SPECIFICATIONS* 🤖\n\n` +
              `• *Bot Identity Name:* ${BOT_INFO.name}\n` +
              `• *Core Engine:* Node.js (${process.version})\n` +
              `• *Environment:* Termux Sandbox Engine\n` +
              `• *Auto-Read System:* ${autoReadMode ? "Active" : "Disabled"}\n` +
              `• *Scope Filter Profile:* Access matching ${botMode.toUpperCase()} threads.`;
            break;

          // --- System Runtime Uptime ---
          case 'uptime':
            responseText = `⏳ *SYSTEM RUNTIME RECOVERY METRICS*\n• Online uninterrupted duration: *${getFormattedUptime()}*`;
            break;

          // --- Owner Info ---
          case 'owner':
            responseText = 
              `👑 *DEVELOPER COMMAND CENTRE CREDENTIALS*\n\n` +
              `• *Master Admin:* ${OWNER_INFO.name}\n` +
              `• *Contact Account:* @${OWNER_INFO.username}\n` +
              `• *Deploy Package Version:* ${BOT_INFO.version}\n` +
              `• *Status Authority:* ${OWNER_INFO.status}`;
            break;

          // --- Group Info Parser ---
          case 'groupinfo':
            if (!isGroup) {
              responseText = `error: this module can only parse structure parameters within group chat threads.`;
            } else {
              const groupName = thread.thread_title || 'Unnamed Instagram Group';
              const usersCount = thread.users ? thread.users.length : 0;
              const pendingStatus = thread.pending ? 'Yes (Awaiting Confirmation)' : 'No (Active Thread)';
              
              responseText = 
                `👥 *👥 COMPREHENSIVE THREAD STRUCTURAL METADATA* 👥\n\n` +
                `• *Group Identifier Title:* "${groupName}"\n` +
                `• *Unique Thread ID ID:* ${thread.thread_id}\n` +
                `• *Active Participant Population:* ${usersCount} users mapped\n` +
                `• *Inbound Pending Quarantine Status:* ${pendingStatus}\n` +
                `• *Thread Type Class:* Shared Cluster Object`;
            }
            break;

          case 'prefix':
            const newPrefix = args[1];
            if (!newPrefix) {
              responseText = `error: usage: ${botPrefix}prefix [symbol]`;
            } else {
              botPrefix = newPrefix;
              responseText = `success: prefix changed globally to: "${botPrefix}"`;
            }
            break;

          case 'mode':
            const targetMode = args[1]?.toLowerCase();
            if (['public', 'private', 'group'].includes(targetMode)) {
              botMode = targetMode;
              responseText = `success: visibility scope mode updated to: ${botMode}`;
            } else {
              responseText = `error: options are public, private, or group`;
            }
            break;

          case 'tagstatus':
            try {
              const currentUser = await ig.account.currentUser();
              responseText = `📋 *Profile Status Tag Details*:\n` +
                             `- Username: @${currentUser.username}\n` +
                             `- Full Name: ${currentUser.full_name}\n` +
                             `- Account Type ID: ${currentUser.account_type}\n` +
                             `- Business Profile: ${currentUser.is_business ? 'Yes' : 'No'}\n` +
                             `- Engine Context: Live inside Termux sandbox`;
            } catch (err) {
              responseText = `error: tracking parameters profile error`;
            }
            break;

          case 'autotyping':
            await threadEntity.indicateTyping();
            responseText = 'success: active tracking execution simulation loop initialization complete';
            break;

          case 'autobio':
            const newBio = args.slice(1).join(' ');
            if (!newBio) {
              responseText = `error: usage: ${botPrefix}autobio [text]`;
            } else {
              await ig.account.setBiography(newBio);
              responseText = `success: target meta container updated payload text: "${newBio}"`;
            }
            break;

          case 'autonote':
            const noteText = args.slice(1).join(' ');
            if (!noteText) {
              responseText = `error: text parameter undefined`;
            } else {
              console.log(`[Auto-Note Logged]: ${noteText}`);
              responseText = `success: stream output cached`;
            }
            break;

          case 'autoread':
            const modeOption = args[1]?.toLowerCase();
            if (modeOption === 'on') {
              autoReadMode = true;
              responseText = 'success: auto-read toggled to active mode';
            } else if (modeOption === 'off') {
              autoReadMode = false;
              responseText = 'success: auto-read status suspended';
            } else {
              responseText = `error: usage: ${botPrefix}autoread [on/off]`;
            }
            break;

          case 'ai':
            const prompt = args.slice(1).join(' ');
            if (!prompt) {
              responseText = `error: missing query string`;
            } else {
              responseText = `🤖 *AI Evaluation output:* Processed template answer for "${prompt}" string parsing logic.`;
            }
            break;

          case 'download':
            const url = args[1];
            if (!url) {
              responseText = `error: target url path string empty`;
            } else {
              responseText = `📥 Target payload link: ${url}\nInitializing storage pipe routine framework...`;
            }
            break;

          case 'game':
            const choices = ['rock', 'paper', 'scissors'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            responseText = `🎮 *RPS Match Engine Output*\nBot selection evaluation: *${botChoice}*!`;
            break;

          default:
            continue; 
        }

        if (responseText) {
          const processedResponse = applyEmojiMox(responseText);
          await threadEntity.broadcastText(processedResponse);
          console.log(`✉️ Sent response to thread ${thread.thread_id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error handling workflow commands:', error.message);
  }
}

(async () => {
  if (!process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
    console.error('❌ Please verify configuration environment variables.');
    process.exit(1);
  }

  await login();
  console.log(`🤖 ${BOT_INFO.name} System Engine actively listening inside Termux...`);
  setInterval(checkDMs, 15000); 
})();

    
