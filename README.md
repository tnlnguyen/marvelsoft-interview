HI ALL, In this chat application I just used pure HTML, CSS, JS and Electron for development. These are some features that I already implemented:

* 'Back' button to login screen.
* Information of current user.
* Status indicator (Online - Offline).
* 'Seen' signal.
* Press Enter to send a message.
* Prevent login on the same port number.
* Auto open development tools (development mode), but you can also open it with right click.

## Quick start
Please make sure you already started websocket server.

## Quick start

Clone the repository
```bash
git clone https://github.com/tnlnguyen/marvelsoft-interview
```

Install dependencies
```bash
cd marvelsoft-interview
npm install
```

Development
```bash
npm run develop
```

## Improvement
There are some points we have to improve because of the lack of help from pure javascript and also from backend side:
	- Saving chat history.
	- Forwarding old messages that user has not received yet.
	- More clearly signals like: Sent, Received, Seen.