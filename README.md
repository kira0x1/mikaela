# Mikaela - Discord Music Bot

[![codebeat badge](https://codebeat.co/badges/6a40e725-5006-4c0c-9948-18326ab5338d)](https://codebeat.co/projects/github-com-kira0x1-mikaela-master)
[![discord badge](https://img.shields.io/discord/585850878532124672?color=7289da&logo=discord&logoColor=white)](https://discord.gg/6fzTAReQtj)

**[Click this to invite mikaela to your server.](https://discordapp.com/api/oauth2/authorize?client_id=585874337618460672&permissions=37038144&scope=bot)**
If you want to add a second instance of mikaela, click [here](https://discord.com/api/oauth2/authorize?client_id=836799311458992138&permissions=37038144&scope=bot) to invite mikaela-2

---
## Setup

Make sure you have node v16+ installed, and windows-build-tools.

### 1. Installing windows-build-tools
```bash
$ npm install --global --production windows-build-tools
```

#### 2. cd into the folder, and install all the modules.
```bash
$ npm install
```

#### 3. Enter the required fields needed in .env.example.
 When you're done, make sure to rename `.env.example` to `.env`.

#### 4. make sure you have typescript installed globaly, if you dont then just run
```bash
$ npm install -g typescript
```
otherwise, just run to compile the typescript.

```bash
$ tsc
```

#### 5. The last step is just to run the bot
```bash
$ npm start
```

## Otional Flags
#### Production / Development
To run the bot using development db / development bot token, just add the development flag, and vice versa.

```bash
$ node . --development
```
```bash
$ node . --production
```

#### Test VC
If you want the bot to join a test vc automatically instead of joining the vc you're in ( so you could test the bot without actually joining a vc ) 

```bash
npm run testvc
```