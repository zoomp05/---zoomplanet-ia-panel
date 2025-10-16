import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Markdown from 'react-markdown';
import { GET_THREAD_MESSAGES, SEND_MESSAGE } from '../../apollo/message';
import { CREATE_THREAD } from '../../apollo/thread';
import { writeFile } from '@utils/files';

const MessageComponent = ({ message, onCodeIdentified }) => {
  const { role, content, contextFiles, outputFiles } = message;

  useEffect(() => {
    if (role === 'assistant') {
      const codeBlocks = content.match(/```[\s\S]*?```/g);
      if (codeBlocks) {
        codeBlocks.forEach(block => {
          const lines = block.split('\n');
          const filePathComment = lines[0].match(/```.*?([\/\w\-\.]+)/);
          if (filePathComment) {
            const filePath = filePathComment[1];
            const code = lines.slice(1, -1).join('\n');
            
            onCodeIdentified({
              path: filePath,
              content: code
            });
          }
        });
      }
    }
  }, [content, role, onCodeIdentified]);

  return (
    <div className={`message message-${role.toLowerCase()}`}>
      <div className="message-content">
        <Markdown>{content}</Markdown>
      </div>
      
      {contextFiles?.length > 0 && (
        <div className="message-files context-files">
          <h4>Referenced Files:</h4>
          <ul>
            {contextFiles.map(file => (
              <li key={file.id}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {outputFiles?.length > 0 && (
        <div className="message-files output-files">
          <h4>Generated Files:</h4>
          <ul>
            {outputFiles.map(file => (
              <li key={file.id}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Chat = ({ 
  threadId: existingThreadId, 
  workerId, 
  projectWorkspacePath,
  projectId 
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [threadId, setThreadId] = useState(existingThreadId);
  const messagesEndRef = useRef(null);
  const [pendingWrites, setPendingWrites] = useState([]);

  // GraphQL Queries & Mutations
  const { data, loading, error, fetchMore } = useQuery(GET_THREAD_MESSAGES, {
    variables: { 
      threadId,
      limit: 50
    },
    fetchPolicy: 'network-only',
    skip: !threadId
  });

  const [createThread] = useMutation(CREATE_THREAD);
  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Initialize OpenAI thread if needed
  useEffect(() => {
    const initializeThread = async () => {
      if (!threadId) {
        try {
          // Create thread in OpenAI
          const response = await fetch('/api/assistants/threads', {
            method: 'POST'
          });
          const data = await response.json();
          const openAiThreadId = data.threadId;

          // Create thread in our backend
          const result = await createThread({
            variables: {
              input: {
                projectId,
                workerId,
                openAiThreadId
              }
            }
          });

          setThreadId(result.data.createThread.id);
        } catch (error) {
          console.error('Error initializing thread:', error);
        }
      }
    };

    initializeThread();
  }, [threadId, createThread, projectId, workerId]);

  const handleCodeIdentified = async (codeInfo) => {
    const fullPath = `${projectWorkspacePath}/${codeInfo.path}`;
    
    setPendingWrites(prev => [...prev, {
      path: fullPath,
      content: codeInfo.content,
      status: 'pending'
    }]);

    try {
      await writeFile({
        path: fullPath,
        content: codeInfo.content,
        message: `Update from assistant in thread ${threadId}`
      });

      setPendingWrites(prev => 
        prev.map(write => 
          write.path === fullPath 
            ? { ...write, status: 'completed' }
            : write
        )
      );
    } catch (error) {
      console.error('Error writing file:', error);
      setPendingWrites(prev => 
        prev.map(write => 
          write.path === fullPath 
            ? { ...write, status: 'error', error: error.message }
            : write
        )
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isProcessing || !threadId) return;

    setIsProcessing(true);
    try {
      // Send message to OpenAI
      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            content: messageInput.trim(),
          }),
        }
      );

      // Create message in our backend
      await sendMessage({
        variables: {
          input: {
            threadId,
            content: messageInput.trim(),
            role: 'USER'
          }
        }
      });

      // Handle OpenAI stream
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadableStream = (stream) => {
    // Handle text creation
    stream.on('textCreated', () => {
      // Add new assistant message placeholder
    });

    // Handle text updates
    stream.on('textDelta', (delta) => {
      if (delta.value != null) {
        // Update assistant message content
      }
    });

    // Handle code interpreter
    stream.on('toolCallCreated', (toolCall) => {
      if (toolCall.type === 'code_interpreter') {
        // Handle code interpreter initialization
      }
    });

    stream.on('toolCallDelta', (delta, snapshot) => {
      if (delta.type === 'code_interpreter' && delta.code_interpreter.input) {
        // Handle code execution
      }
    });

    // Handle function calls
    stream.on('event', async (event) => {
      if (event.event === 'thread.run.requires_action') {
        const runId = event.data.id;
        const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
        
        // Handle function calls and submit results
        const toolCallOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const result = await handleFunctionCall(toolCall);
            return { output: result, tool_call_id: toolCall.id };
          })
        );

        await submitActionResults(runId, toolCallOutputs);
      }
    });
  };

  // Add other helper functions (handleLoadMore, scrollToBottom, etc.)

  if (loading) return <div className="chat-loading">Loading messages...</div>;
  if (error) return <div className="chat-error">Error: {error.message}</div>;

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {/* Messages section */}
        {data?.messages.map(message => (
          <MessageComponent 
            key={message.id} 
            message={message}
            onCodeIdentified={handleCodeIdentified}
          />
        ))}
        
        {/* Pending writes section */}
        {pendingWrites.length > 0 && (
          <div className="pending-writes">
            <h4>File Operations:</h4>
            {pendingWrites.map((write, index) => (
              <div 
                key={index}
                className={`write-status write-status-${write.status}`}
              >
                {write.path}: {write.status}
                {write.error && <span className="write-error">{write.error}</span>}
              </div>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isProcessing}
          rows={3}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={isProcessing || !messageInput.trim()}
          className="chat-send-button"
        >
          {isProcessing ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;