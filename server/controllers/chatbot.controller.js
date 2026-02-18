const llmService = require('../services/llm.service');
const historyService = require('../services/chatHistory');

/**
 * Handles incoming chat requests and streams responses from the LLM.
 */
exports.handleChat = async (req, res) => {
    try {
        const { message, chatId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Identify or Create Chat Session
        let currentChatId = chatId;
        if (!currentChatId || !historyService.getChat(currentChatId)) {
            const newChat = historyService.createChat();
            currentChatId = newChat.id;
        }

        // 2. Save User Message to History
        historyService.addMessage(currentChatId, 'user', message);

        // 3. Prepare Context (Previous messages)
        // We get history but slice out the message we just added so the LLM gets:
        // [prev_msgs...] + current_input
        const context = historyService.getContext(currentChatId).slice(0, -1);

        // 4. Set Headers for Streaming (NDJSON format)
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Send metadata chunk so client knows the chatId
        res.write(JSON.stringify({ type: 'metadata', chatId: currentChatId }) + '\n');

        // 5. Stream Answer from LLM
        const stream = llmService.streamAnswer(message, context);

        let fullAnswer = "";
        for await (const chunk of stream) {
            // Write each token as an NDJSON line
            res.write(JSON.stringify({ token: chunk }) + '\n');
            fullAnswer += chunk;
        }

        // 6. Save Assistant Response to History
        if (fullAnswer) {
            historyService.addMessage(currentChatId, 'assistant', fullAnswer);
        }

        res.end();

    } catch (error) {
        console.error('Chat Controller Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process chat request' });
        } else {
            res.end();
        }
    }
};

/**
 * Retrieves the full list of chat sessions.
 */
exports.getHistory = (req, res) => {
    try {
        const chats = historyService.getAllChats();
        res.json(chats.map(c => ({
            id: c.id,
            title: c.title,
            createdAt: c.createdAt
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

/**
 * Retrieves a single chat session with its messages.
 */
exports.getChatById = (req, res) => {
    try {
        const chat = historyService.getChat(req.params.id);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
};

/**
 * Deletes a chat session.
 */
exports.deleteChat = (req, res) => {
    try {
        const success = historyService.deleteChat(req.params.id);
        if (!success) return res.status(404).json({ error: 'Chat not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete chat' });
    }
};
