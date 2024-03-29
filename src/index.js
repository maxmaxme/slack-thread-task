const {App} = require("@slack/bolt");
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const youtrackBaseUrl = process.env.YOUTRACK_BASE_URL
const app = new App({
  token: process.env.SLACK_TOKEN, //Find in the Oauth  & Permissions tab
  signingSecret: process.env.SLACK_SIGNING_SECRET, // Find in Basic Information Tab
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN // Token from the App-level Token that we created
});
let botId = null;
let slackBaseUrl = null;

app.message(/.*/, async ({message, say}) => {
  const messages = []
  const match = message.text.match(/<@(\w+)>/);

  if (match && match[1] === botId) {
    // If this is a first message in a thread
    if (!message.thread_ts) {
      messages.push(message);
    } else {
      // If this is a reply in a thread

      const threadMessages = (await app.client.conversations.replies({
        channel: message.channel,
        ts: message.thread_ts,
      })).messages
        .filter(m => m.user !== botId)

      messages.push(...threadMessages);
    }

    if (messages.length === 0) {
      return
    }

    const systemPrompt = `
    You are a bot <@${botId}> and you need to create a task summary and description based on the conversation below.
    Find the main problem and suggest a task to solve it. If there are several problems, choose the most important one.
    Remember to use the following format in JSON:
    {
      "summary": "Task summary (max 80 characters)",
      "description": "Task description (max 2048 characters)"
    }
    
    Be very brief and divide the description into paragraphs (use \n). (each paragraph should be no more than 2 sentences)
    Use only information from the conversation below and do not add any additional information.
    Don't ask any questions, just create a task summary and description.
    Summary and description should be written in English.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {role: 'system', content: systemPrompt},
        ...messages.map(m => ({
          role: 'user',
          content: `<@${m.user}>: ${m.text}`,
        }))
      ],
      response_format: {type: "json_object"},
      model: "gpt-3.5-turbo-1106",
    });

    try {
      const reply = JSON.parse(completion.choices[0].message.content || '{}')
      const createTaskDescription = `**Task:**\n` + reply.description + `\n\n\n\n**Slack thread:** ${slackBaseUrl}archives/${message.channel}/p${message.thread_ts.replace('.', '')}`
      const createTaskLink = `<${youtrackBaseUrl}/newIssue?summary=${encodeURIComponent(reply.summary)}&description=${encodeURIComponent(createTaskDescription)}|Create task>`
      const text = `Task: ${reply.summary}\n\nDescription: ${reply.description}\n\n${createTaskLink}`
      await say({
        thread_ts: message.ts,
        text,
      });
    } catch (e) {
      console.log(e)
    }
  }
});

(async () => {
  const port = process.env.PORT || 3000;
  // Start the app
  await app.start(port);

  const test = await app.client.auth.test()
  botId = test.user_id;
  slackBaseUrl = test.url
  console.log('⚡️ Bolt app is running on port ' + port, test);
})();
