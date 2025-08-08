import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DirectChat from './DirectChat';

export default function DirectChatWrapper() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  if (!conversationId) {
    navigate('/social');
    return null;
  }

  return <DirectChat />;
}