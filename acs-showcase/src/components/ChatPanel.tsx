import { useCallback, useState } from 'react';
import {
  MessageThread,
  SendBox,
  TypingIndicator,
  type ChatMessage,
  type CommunicationParticipant,
  type SystemMessage,
} from '@azure/communication-react';
import { LOCAL_DISPLAY_NAME, LOCAL_USER_ID } from '../data/participants';

const TYPING_USERS: CommunicationParticipant[] = [
  { userId: 'p-priya', displayName: 'Priya Raman' },
];

interface ChatPanelProps {
  messages: (ChatMessage | SystemMessage)[];
  onSend: (content: string) => void;
  onClose: () => void;
}

export const ChatPanel = ({ messages, onSend, onClose }: ChatPanelProps): JSX.Element => {
  const [showTyping, setShowTyping] = useState(true);

  const handleSend = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }
      onSend(trimmed);
      // Once you join in, the fabricated typing indicator gets out of the way.
      setShowTyping(false);
    },
    [onSend]
  );

  return (
    <aside className="chat-panel" aria-label="Call chat">
      <header className="chat-panel__header">
        <h2 className="chat-panel__title">Chat</h2>
        <button type="button" className="chat-panel__close" onClick={onClose} aria-label="Close chat panel">
          &#10005;
        </button>
      </header>

      <div className="chat-panel__thread">
        <MessageThread
          userId={LOCAL_USER_ID}
          messages={messages}
          showMessageDate
          showMessageStatus
          participantCount={7}
        />
      </div>

      <div className="chat-panel__typing" aria-live="polite">
        {showTyping && <TypingIndicator typingUsers={TYPING_USERS} />}
      </div>

      <div className="chat-panel__sendbox">
        <SendBox
          onSendMessage={handleSend}
          supportNewline
          strings={{ placeholderText: `Message the call as ${LOCAL_DISPLAY_NAME}` }}
        />
      </div>
    </aside>
  );
};
