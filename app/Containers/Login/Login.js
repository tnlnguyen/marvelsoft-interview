const handleLogin = () => {
  const { ipcRenderer } = require('electron');

  const username = document.getElementById('uname')?.value;
  const port = document.getElementById('port')?.value;

  ipcRenderer.send('change-view', [
    `./app/containers/Home/Home.html`,
    JSON.stringify({ username, port }),
  ]);
};
