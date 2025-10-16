import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_WORKSPACE } from "../../apollo/workspace";
import { CREATE_DIRECTORY } from "../../apollo/directory";

const CreateWorkspace = ({ projectId, onCreate }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [directoryName, setDirectoryName] = useState("");
  const [directories, setDirectories] = useState([]);

  const [createWorkspace] = useMutation(CREATE_WORKSPACE);
  const [createDirectory] = useMutation(CREATE_DIRECTORY);

  const handleCreateWorkspace = async () => {
    try {
      const { data } = await createWorkspace({
        variables: {
          input: {
            name: workspaceName,
            description: workspaceDescription,
            projectId,
          },
        },
      });
      const workspace = data.createWorkspace;
      console.log("Workspace created:", workspace);
      onCreate(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const handleAddDirectory = async () => {
    try {
      const { data } = await createDirectory({
        variables: {
          input: {
            name: directoryName,
            workspaceId: projectId,
          },
        },
      });
      const directory = data.createDirectory;
      setDirectories([...directories, directory]);
      console.log("Directory added:", directory);
    } catch (error) {
      console.error("Error adding directory:", error);
    }
  };

  return (
    <div>
      <h2>Create Workspace</h2>
      <div>
        <label>
          Workspace Name:
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Workspace Description:
          <input
            type="text"
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleCreateWorkspace}>Create Workspace</button>

      <h2>Add Directory</h2>
      <div>
        <label>
          Directory Name:
          <input
            type="text"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleAddDirectory}>Add Directory</button>

      <h3>Directories</h3>
      <ul>
        {directories.map((dir) => (
          <li key={dir.id}>{dir.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CreateWorkspace;
