import WAWebJS, { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

type gptInputMsg = {
  content: string;
  role: "user" | "assistant";
};

const webversion = "2.2412.54v2";
const options: WAWebJS.ClientOptions = {
  qrMaxRetries: 10,
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--verbose"],
  },
  webVersionCache: {
    type: "remote",
    remotePath: `https://raw.githubusercontent.com/guigo613/alternative-wa-version/main/html/${webversion}.html`,
  },
  authStrategy: new LocalAuth({
    dataPath: "auth",
  }),
};

// Create a new client instance
const client = new Client(options);

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Client is ready!");
  client.setStatus("Estou disponível!");
  client.setAutoDownloadAudio(false);
  client.setAutoDownloadPhotos(false);
  client.setAutoDownloadDocuments(false);
  client.setAutoDownloadVideos(false);
});

// When the client received QR-Code
client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("message", async (message) => {
  console.log(`message received from ${message.from}: ${message.body}`);
  switch (message.type) {
    case "image":
      message.reply("Ops, não consigo processar imagens 😩 (ainda)");
      break;
    case "video":
      message.reply("Ops, não consigo processar vídeos 😩 (ainda)");
      break;
    case "document":
      message.reply("Ops, não consigo processar documentos 😩 (ainda)");
      break;
    case "audio":
      message.reply("Ops, não consigo processar áudios 😩 (ainda)");
      break;
    case "sticker":
      message.reply("Por que você enviou um sticker? 😅");
      break;
    case "chat":
      const chat = await client.getChatById(message.from);
      if (message.body === "clear") {
        chat.clearMessages();
        chat.sendMessage("Mensagens apagadas com sucesso!");
        return;
      }
      chat.sendStateTyping();

      let arr:gptInputMsg[] = await chat.fetchMessages({ limit: 30 }).then((msgs)=>{
        return msgs
          .filter((msg) => {
            if (msg.type !== "chat" || msg.body.includes("Ops", 0) ) return false;
            return true;
      })
          .map((msg) => {
            return {
              role: msg.fromMe ? "assistant" : "user",
              content: msg.body || "",
            } as gptInputMsg;
          })})

        console.log(arr)
        console.log(arr.length)

      client.sendMessage(
        message.from,
        "Olá, eu sou um bot e ainda estou em desenvolvimento, por favor, não insista 😅"
      );
      break;
    default:
      console.log(message.type);
      message.reply("Não entendi sua mensagem 😅");
  }
});

client.on("call", async (call) => {
  call.reject();
  client.sendMessage(call.from || "", "I'm sorry, I can't answer calls");
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
  client.destroy();
  client.initialize();
});

// Start your client
client.initialize();
