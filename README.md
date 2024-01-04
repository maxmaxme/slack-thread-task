# Task Creator Bot

This is a Slack bot that creates tasks based on the conversation in a thread. It uses the OpenAI API to generate a task summary and description.

## Prerequisites

- Docker installed on your machine.
- Slack bot token, signing secret, and app token.
- OpenAI API key.

## Setup

1. Clone the repository to your local machine.

```bash
git clone https://github.com/maxmaxme/slack-thread-task.git
```

2. Navigate to the project directory.

```bash
cd slack-thread-task
```

3. Create a `.env` file in the root directory of the project and add your Slack and OpenAI credentials.

```plaintext
PORT=3000

SLACK_TOKEN=your-slack-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_APP_TOKEN=your-slack-app-token
OPENAI_API_KEY=your-openai-api-key

YOUTRACK_BASE_URL=https://youtrack.yourcompany.com
```

## Running the Bot

1. Build the Docker image.

```bash
docker build -t slack-thread-task .
```

2. Run the Docker container using Docker Compose.

```bash
docker-compose up
```

The bot is now running and listening for messages on Slack.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](https://choosealicense.com/licenses/isc/)
