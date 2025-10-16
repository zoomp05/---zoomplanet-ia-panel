// /src/components/FileBrowser/FileBrowser.js

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WORKSPACES, CREATE_WORKSPACE } from '../../apollo/workspace';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import './FileBrowser.css';

const FileBrowser = () => {

  const { loading, error, data } = useQuery(GET_WORKSPACES);
  const [createWorkspace, { loading: creatingWorkspace }] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{ query: GET_WORKSPACES }],
  });
  

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceType, setWorkspaceType] = useState('context');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to store the selected folder path
  const [selectedFolderPath, setSelectedFolderPath] = useState(null);

  const handleCreateWorkspace = async () => {
    if (!workspaceName || !workspaceType) {
      alert('Please enter a workspace name and type.');
      return;
    }

    try {
      await createWorkspace({
        variables: {
          input: {
            name: workspaceName,
            description: workspaceDescription,
            type: workspaceType,
          },
        },
      });

      setWorkspaceName('');
      setWorkspaceDescription('');
      setWorkspaceType('context');
      setIsModalOpen(false); // Close the modal after creating workspace
    } catch (err) {
      console.error('Error creating workspace:', err);
    }
  };

  
  // Function to handle folder selection
  const handleFolderSelect = (folderPath) => {
    setSelectedFolderPath(folderPath);
  };

  // Function to list files in a directory (replace with your actual implementation)
  const listFiles = (directoryPath) => {
    // This is a placeholder, you'll need to implement the actual logic
    // to read the directory contents and return a list of files/folders.
    // You can use Node.js fs module or any other library for this purpose.
    // Example using fs module (make sure it's available in your environment):
    // const fs = require('fs');
    // return fs.readdirSync(directoryPath);
    return []; // Replace with actual file/folder list
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="file-browser">
      <div className="workspace-list">
        <div className="row">
          <div className="col">
            <h2>Workspaces</h2>
          </div>
          <div className="col right-align">
            <Button onClick={() => setIsModalOpen(true)}>
              <span className="plus-icon">+</span>
            </Button>
          </div>
        </div>
        <ul>
          {data.workspaces && data.workspaces.map((workspace) => (
            <li key={workspace.id}>
              <h3>{workspace.name}</h3>
              <p>{workspace.description}</p>
              <p>Type: {workspace.type}</p>
              <small>Created at: {new Date(workspace.createdAt).toLocaleString()}</small>
              <small>Updated at: {new Date(workspace.updatedAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="workspace-form">
          <h2>Create Workspace</h2>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace Name"
          />
          <input
            type="text"
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
            placeholder="Workspace Description"
          />
          <select
            value={workspaceType}
            onChange={(e) => setWorkspaceType(e.target.value)}
          >
            <option value="context">Context</option>
            <option value="project">Project</option>
          </select>
          <Button onClick={handleCreateWorkspace} loading={creatingWorkspace}>
            Create
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FileBrowser;
