// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

const PRIVATE_TOKEN = process.env.PRIVATE_TOKEN;

var task1: cron.ScheduledTask,
  task2: cron.ScheduledTask,
  task3: cron.ScheduledTask,
  task4: cron.ScheduledTask,
  task5: cron.ScheduledTask;

function calculateInterval(
  interval: string,
  time: number,
  period: string
): string {
  if (period === "am" && time === 12) {
    time = 0;
  }
  if (period === "pm") {
    if (time === 12) {
      time = 12;
    } else {
      time += 12;
    }
  }

  let res = "0 ";

  if (interval === "daily") {
    res += `${time.toString()} * * *`;
  }
  if (interval === "weekly") {
    res += `${time.toString()} * * ${new Date().getDay()}`;
  }
  if (interval === "monthly") {
    res += `${time.toString()} ${new Date().getDate()} * *`;
  }

  return cron.validate(res) ? res : "";
}

function formatInterval(interval: string, time: number, period: string) {
  return `${interval} at ${time}${period}`;
}

interface Message {
  id: number;
  text: string;
  interval: string;
  time: number;
  period: string;
}

// limit to maximum five reminders
class Reminder {
  limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  messages: Array<Message> = [];

  addMessage(message: Message) {
    if (this.messages.length >= this.limit) return;
    this.messages.push(message);

    return this.messages[this.messages.length - 1];
  }

  removeMessage(id: number) {
    if (this.messages.length === 0) return;

    this.messages.find((message) => {
      if (message.id === id) {
        this.messages.splice(this.messages.indexOf(message), 1);
        // console.log(this.messages.indexOf(message));
      }
    });
  }

  findMessage(id: number) {
    if (this.messages.length === 0) return;

    this.messages.find((message) => {
      return message.id === id;
    });
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}

const reminder = new Reminder(5);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "remind") {
    const message = interaction.options.getString("message");
    const interval = interaction.options.getString("interval");
    const time = interaction.options.getInteger("time");
    const period = interaction.options.getString("period");
    if (message && interval && time && period) {
      const newMessage = reminder.addMessage({
        id: reminder.messages.length + 1,
        text: message,
        interval: interval,
        time: time,
        period: period,
      });
      await interaction.reply(`Message "${message}" is added😆`);

      var task = cron.schedule(
        calculateInterval(interval, time, period),
        async () => {
          await interaction.followUp(`${message}`);
        },
        {
          scheduled: false,
          timezone: "Asia/Hong_Kong",
        }
      );

      if (newMessage) {
        switch (newMessage.id) {
          case 1:
            task1 = task;
            task1.start();
          case 2:
            task2 = task;
            task2.start();
          case 3:
            task3 = task;
            task3.start();
          case 4:
            task4 = task;
            task4.start();
          case 5:
            task5 = task;
            task5.start();
        }
      }
    }
  }

  if (commandName === "remove") {
    const messageId = interaction.options.getInteger("id") ?? 0;
    reminder.removeMessage(messageId);
    // stop the cron task by messageId
    switch (messageId) {
      case 1:
        task1.stop();
      case 2:
        task2.stop();
      case 3:
        task3.stop();
      case 4:
        task4.stop();
      case 5:
        task5.stop();
    }

    await interaction.reply(`Message ${messageId} is removed😛`);
  }

  if (commandName === "list") {
    const messages = reminder.getMessages();

    let allMessages = "";
    messages.map((message) => {
      allMessages += `ID: ${message.id} | Message: ${
        message.text
      } | Schedule: ${formatInterval(
        message.interval,
        message.time,
        message.period
      )} \n`;
    });
    messages.length > 0
      ? await interaction.reply(allMessages)
      : await interaction.reply("No pending reminder message😌");
  }

  if (commandName === "clear") {
    task1.stop();
    task2.stop();
    task3.stop();
    task4.stop();
    task5.stop();
    reminder.clearMessages();
    await interaction.reply(`Clean now😎`);
  }
});

// Login to Discord with your client's token
client.login(PRIVATE_TOKEN);