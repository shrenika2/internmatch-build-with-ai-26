const { v4: uuidv4 } = require('uuid');

/**
 * ChatHistoryService manages in-memory storage for chat sessions.
 * In a production environment with many users, this would typically 
 * be backed by MongoDB or Redis.
 */
class ChatHistoryService {
    constructor() {
        // In-memory store: Map<chatId, chatObject>
        this.chats = new Map();
    }

    /**
     * Creates a new chat session
     * @param {string} title - Optional title for the chat
     */
    createChat(title = 'New Chat') {
        const id = uuidv4();
        const chat = {
            id,
            title,
            messages: [],
            createdAt: Date.now(),
        };
        this.chats.set(id, chat);
        return chat;
    }

    /**
     * Retrieves a specific chat session
     * @param {string} id - The chat ID
     */
    getChat(id) {
        return this.chats.get(id);
    }

    /**
     * Returns all chat sessions sorted by creation date
     */
    getAllChats() {
        return Array.from(this.chats.values()).sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Adds a message to a chat session
     * @param {string} chatId - The ID of the chat
     * @param {'user' | 'assistant'} role - Who sent the message
     * @param {string} content - The message text
     */
    addMessage(chatId, role, content) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.messages.push({
                role,
                content,
                timestamp: Date.now()
            });

            // Auto-update title based on the first user message
            if (role === 'user' && chat.title === 'New Chat') {
                chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
            }
        }
    }

    /**
     * Returns the array of message contents for LLM context
     * @param {string} chatId - The ID of the chat
     */
    getContext(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return [];
        return chat.messages.map(m => m.content);
    }

    /**
     * Deletes a chat session
     * @param {string} id - The chat ID
     */
    deleteChat(id) {
        return this.chats.delete(id);
    }
}

// Singleton instance
module.exports = new ChatHistoryService();
