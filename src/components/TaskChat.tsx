/**
 * Task Chat component with user tagging and participant display
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Send, 
  Users, 
  AtSign,
  MessageSquare,
  User,
  Clock
} from 'lucide-react';

interface TaskChatProps {
  taskId: string;
}

interface ChatMessage {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  mentions?: string[];
  timestamp: Date;
}

/**
 * Task chat component with user mentions and participant tracking
 */
const TaskChat: React.FC<TaskChatProps> = ({ taskId }) => {
  const { user } = useAuth();
  const { tasks, users } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const task = tasks.find(t => t.id === taskId);

  // Get all participants in this task
  const taskParticipants = users.filter(u => {
    if (!task) return false;
    return (
      u.id === task.assignedToId ||
      (task.assignedUsers && task.assignedUsers.includes(u.id)) ||
      u.id === task.createdById ||
      u.id === task.assignedById ||
      messages.some(m => m.userId === u.id)
    );
  });

  /**
   * Load messages from localStorage and mark as read
   */
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${taskId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(parsedMessages);
    }

    // Mark messages as read when chat is opened
    if (user?.id) {
      localStorage.setItem(`chat_lastRead_${taskId}_${user.id}`, new Date().toISOString());
    }
  }, [taskId, user?.id]);

  /**
   * Scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle mention detection
   */
  useEffect(() => {
    const messageBeforeCursor = newMessage.slice(0, cursorPosition);
    const mentionMatch = messageBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  }, [newMessage, cursorPosition]);

  /**
   * Save messages to localStorage
   */
  const saveMessages = (updatedMessages: ChatMessage[]) => {
    localStorage.setItem(`chat_${taskId}`, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  /**
   * Send new message
   */
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    // Extract mentions from message
    const mentionMatches = newMessage.match(/@(\w+)/g);
    const mentions = mentionMatches?.map(mention => {
      const username = mention.slice(1);
      const mentionedUser = users.find(u => 
        u.name.toLowerCase().includes(username.toLowerCase()) ||
        u.email.toLowerCase().includes(username.toLowerCase())
      );
      return mentionedUser?.id;
    }).filter(Boolean) || [];

    const message: ChatMessage = {
      id: Date.now().toString(),
      taskId,
      userId: user.id,
      message: newMessage,
      mentions: mentions as string[],
      timestamp: new Date()
    };

    const updatedMessages = [...messages, message];
    saveMessages(updatedMessages);
    setNewMessage('');
    setShowMentions(false);
  };

  /**
   * Handle mention selection
   */
  const selectMention = (selectedUser: any) => {
    const messageBeforeCursor = newMessage.slice(0, cursorPosition);
    const messageAfterCursor = newMessage.slice(cursorPosition);
    const mentionMatch = messageBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = messageBeforeCursor.slice(0, mentionMatch.index);
      const updatedMessage = beforeMention + `@${selectedUser.name} ` + messageAfterCursor;
      setNewMessage(updatedMessage);
      setShowMentions(false);
      
      // Focus back to input
      setTimeout(() => {
        inputRef.current?.focus();
        const newPosition = beforeMention.length + selectedUser.name.length + 2;
        inputRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  /**
   * Handle input change and cursor position
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Format message with mentions
   */
  const formatMessage = (message: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) return message;

    let formattedMessage = message;
    mentions.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user) {
        const regex = new RegExp(`@${user.name}`, 'gi');
        formattedMessage = formattedMessage.replace(
          regex, 
          `<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">@${user.name}</span>`
        );
      }
    });

    return formattedMessage;
  };

  /**
   * Get filtered users for mentions
   */
  const getMentionSuggestions = () => {
    return taskParticipants.filter(u => 
      u.id !== user?.id &&
      (u.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
       u.email.toLowerCase().includes(mentionQuery.toLowerCase()))
    ).slice(0, 5);
  };

  if (!task) {
    return <div className="text-center text-gray-500 p-4">Task not found</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Participants List */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Participants ({taskParticipants.length})</span>
          </div>
          <div className="flex -space-x-2">
            {taskParticipants.slice(0, 3).map(participant => (
              <div
                key={participant.id}
                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-white"
                title={participant.name}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {taskParticipants.length > 3 && (
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white border-2 border-white">
                +{taskParticipants.length - 3}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {taskParticipants.slice(0, 4).map(participant => (
            <Badge key={participant.id} variant="secondary" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              {participant.name}
            </Badge>
          ))}
          {taskParticipants.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{taskParticipants.length - 4} more
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const messageUser = users.find(u => u.id === message.userId);
            const isCurrentUser = message.userId === user?.id;
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 border'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {messageUser?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs opacity-75 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.message, message.mentions)
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white relative">
        {/* Mention Suggestions */}
        {showMentions && getMentionSuggestions().length > 0 && (
          <div className="absolute bottom-full left-0 right-0 bg-white border rounded-lg shadow-lg mb-2 max-h-32 overflow-y-auto z-10">
            {getMentionSuggestions().map(suggestionUser => (
              <button
                key={suggestionUser.id}
                onClick={() => selectMention(suggestionUser)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">
                  {suggestionUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{suggestionUser.name}</div>
                  <div className="text-xs text-gray-500">{suggestionUser.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... Use @username to mention someone"
              className="pr-10"
              onSelect={(e) => setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)}
            />
            <AtSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center mt-2">
          Type @ followed by a name to mention team members
        </div>
    </div>
  );
};

export default TaskChat;