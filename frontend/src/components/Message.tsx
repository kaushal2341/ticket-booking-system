import React from 'react';

interface MessageProps {
  message: string;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  if (!message) return null;

  const isError = message.includes('Error') || message.includes('Please');

  return (
    <div className={`message ${isError ? 'error' : 'success'}`}>
      {message}
    </div>
  );
};

export default Message;
