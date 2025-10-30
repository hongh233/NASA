import { useState, useEffect } from 'react';
import { useIceExtentContext } from '../context/IceExtentContext';
import "../components/ChatBox.css";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  response: string;
}

export const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { isoDate } = useIceExtentContext();

  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Hello! I can help you understand the Arctic ice conditions and make predictions. What would you like to know?'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (isoDate) {
      const autoMessage: Message = {
        role: 'assistant',
        content: `I notice you're looking at data for ${isoDate}. Would you like to know about the ice conditions for this date?`
      };
      setMessages(prev => [...prev, autoMessage]);
    }
  }, [isoDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          context: { currentDate: isoDate }
        }),
      });
      const data = await response.json() as ChatResponse;
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-box ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header">
        <h3>Arctic Assistant</h3>
        <button 
          className="minimize-button"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '↗' : '↙'}
        </button>
      </div>
      <div className="chat-content">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about ice conditions..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? '...' : '↑'}
          </button>
        </form>
      </div>
    </div>
  );
};