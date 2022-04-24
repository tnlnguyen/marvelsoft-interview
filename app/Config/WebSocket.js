const initServer = async (port, onMessage, onOpen, onClose) => {
  const ws = new WebSocket(`ws://localhost:${port}/ws`);

  if (onOpen) {
    ws.onopen = onOpen;
  }

  if (onMessage) {
    ws.onmessage = onMessage;
  }

  if (onClose) {
    ws.onclose = onClose;
  }

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (ws.readyState === 1) {
        clearInterval(timer);
        resolve(ws);
      }
    }, 10);
  });
};

module.exports = { initServer };
