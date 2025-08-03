import { useEffect, useRef, useState } from 'react';

interface ServerSentMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerSentMessage | null>(null);
  const eventSource = useRef<EventSource | null>(null);

  useEffect(() => {
    const sseUrl = `/api/events/live`;
    
    eventSource.current = new EventSource(sseUrl);

    eventSource.current.onopen = () => {
      console.log('Server-Sent Events connected');
      setIsConnected(true);
    };

    eventSource.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.current.onerror = (error) => {
      console.error('Server-Sent Events error:', error);
      setIsConnected(false);
    };

    return () => {
      if (eventSource.current) {
        eventSource.current.close();
      }
    };
  }, []);

  const sendMessage = (message: ServerSentMessage) => {
    // For Server-Sent Events, we use regular HTTP POST requests to send messages
    fetch('/api/events/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }).catch(error => {
      console.error('Error sending message:', error);
    });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
