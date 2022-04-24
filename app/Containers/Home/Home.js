#!/usr/bin/env node
const { ipcRenderer } = require('electron');
const { TYPE, CONNECTION_STATUS } = require('../../Config/Constant/Enum');
const { initServer } = require('../../Config/WebSocket');

let config = null;
let ws = null;
let isInterrupt = true;

// Declaration
const initialize = (onMessage) => {
  return new Promise((resolve) => {
    ipcRenderer.on('get-data', async (_, arg) => {
      config = JSON.parse(arg);

      /* Initialize values:
        [1]: port number; 
        [2]: message received callback
        [3]: open connection callback
        [4]: close connection callback
      */
      ws = await initServer(config?.port, onMessage, onOpen, onClose);
      initInformation(config);
      resolve(ws);
    });
  });
};

const initInformation = (name) => {
  const el = document.getElementsByClassName('headerTitle')[0];
  el.innerHTML += `
  <h4>Your account: ${config?.username}</h4>
  <h4>Port: ${config?.port}</h4>
  `;
};

const initChatCard = ({ data, dateTime, username }) => {
  return username !== config?.username
    ? `
    <div class="bubbleWrapper">
      <div class="inlineContainer">
        <img
          class="inlineIcon"
          src="https://www.pinclipart.com/picdir/middle/205-2059398_blinkk-en-mac-app-store-ninja-icon-transparent.png"
        />
        <div class="otherBubble other">${data}</div>
      </div>
      <span class="other">${dateTime}</span>
    </div>`
    : `
    <div class="bubbleWrapper">
      <div class="inlineContainer own">
        <img
          class="inlineIcon"
          src="https://www.pinclipart.com/picdir/middle/205-2059398_blinkk-en-mac-app-store-ninja-icon-transparent.png"
        />
        <div class="ownBubble own">${data}</div>
      </div>
      <span class="own">${dateTime}</span>
    </div>`;
};

const handleMessage = (data) => {
  const newMsg = initChatCard(data);

  const el = document.getElementsByClassName('bubbleContainer')[0];
  el.innerHTML += newMsg;
};

const emitChangeStatus = (isOnline = true, isReplyReturned = false) => {
  const data = {
    type: TYPE.CONNECTION_STATUS,
    data: isOnline ? CONNECTION_STATUS.ONLINE : CONNECTION_STATUS.OFFLINE,
    username: config?.username,
    dateTime: Date.now().toLocaleString(),
    isReplyReturned,
  };

  ws.send(JSON.stringify(data));
};

const handleConnectionStatus = (data) => {
  const el = document.getElementsByClassName('icon')[0];
  const status = document.getElementById('status');

  // Change status on first user window
  el.src =
    data?.data === CONNECTION_STATUS.ONLINE ? '../../assets/check.png' : '../../assets/cross.png';
  status.innerHTML = data?.data;

  // Change status on second user window
  if (!data?.isReplyReturned) {
    emitChangeStatus(true, true);
  }
};

const handleReceivedMessage = () => {
  const el = document.querySelectorAll('span.own');
  const seen = ' - Seen';

  el.forEach(item => {
    item.textContent = item.textContent.replace(seen, '');
  })
  el[el.length - 1].textContent += seen;
};

// Events
const onSend = () => {
  const msg = document.getElementsByClassName('bubbleInput')[0];

  const data = {
    type: TYPE.MESSAGE,
    data: msg.value,
    username: config?.username,
    dateTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  handleMessage(data);
  ws.send(JSON.stringify(data));

  msg.value = '';
};

const onReceiveMessage = () => {
  const data = {
    type: TYPE.STATUS,
    username: config?.username,
    dateTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  ws.send(JSON.stringify(data));
};

const onKeyDown = (e) => {
  const msg = document.getElementsByClassName('bubbleInput')[0];
  msg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      onSend();
      e.preventDefault();
    }
  });
};

const onMessage = (e) => {
  const data = JSON.parse(e?.data);

  switch (data?.type) {
    case TYPE.MESSAGE:
      handleMessage(data);

      // Send received signal
      onReceiveMessage();
      break;
    case TYPE.STATUS:
      handleReceivedMessage();
      break;
    case TYPE.CONNECTION_STATUS:
      handleConnectionStatus(data);
      break;
  }
};

const onOpen = (e) => {
  console.log('Opened connection');
  setTimeout(() => emitChangeStatus(), 2000);
};

const onClose = (e) => {
  emitChangeStatus(false, true);
  ipcRenderer.send('change-view', [`./app/containers/Login/Login.html`])

  if (isInterrupt) {
    alert('Someone just entered your account!!!')
  }
  
  isInterrupt = true;
}

const onBack = () => {
  const el = document.getElementsByClassName('quit')[0];

  el.addEventListener('click', () => {
    setTimeout(() => {
      isInterrupt = false;
      ws.close();
    }, 1000);
  });
};

// Initialization
const main = async () => {
  ws = await initialize(onMessage);

  onKeyDown();
  onBack();
};

main();
