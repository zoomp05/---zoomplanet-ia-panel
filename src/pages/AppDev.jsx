import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Chat from '../components/Chat/Chat';
import FileBrowser from '../components/FileBrowser/FileBrowser';
import '../css/AppDev.css';

const AppDev = () => {
  const [threadId, setThreadId] = useState('');

  const functionCallHandler = async (call) => {
    if (!call?.function?.name) return;
    
    const args = JSON.parse(call.function.arguments);
    
    switch (call.function.name) {
      case "write_file":
        return await writeFile({
          path: args.path,
          content: args.content,
          message: args.commitMessage || "Update from assistant"
        });
      default:
        return;
    }
  };

  // Crear un nuevo threadID cuando se monta el componente
  useEffect(() => {
    const createThread = async () => {
      try {
        const res = await fetch(`/api/assistants/threads`, {
          method: "POST",
        });
        const data = await res.json();
        setThreadId(data.threadId);
      } catch (error) {
        console.error('Error creating thread:', error);
      }
    };
    createThread();
  }, []);

  return (
    <MainLayout>
      <div className="appDevContainer">
        <div className="chatSection">
          <div className="chatHeader">
            <h2>Chat Assistant</h2>
          </div>
          <div className="chatWrapper">
            {//threadId && (
              <Chat 
                functionCallHandler={functionCallHandler}
                threadId={threadId}
              />
            //)
            }
          
          </div>
        </div>

        <div className="filesSection">
          <div className="filesHeader">
            <h3>Project Context</h3>
          </div>
          <div className="filesList">
            <FileBrowser />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AppDev;