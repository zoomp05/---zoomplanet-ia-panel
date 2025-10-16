import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_WORKSPACE_BY_PROJECT, CREATE_WORKSPACE } from "../../apollo/workspace";
import { 
  GET_DIRECTORY_CONTENTS,
  CREATE_DIRECTORY, 
  UPDATE_DIRECTORY, 
  UPLOAD_DIRECTORY_STRUCTURE 
} from "../../apollo/directory";
import CreateWorkspace from "./CreateWorkspace";
import { Modal, Button, Tree, message, Tabs } from "antd";
import FileManager from "./FileManager";

const WorkspaceManager = ({ projectId }) => {
  const { data, loading, error, refetch } = useQuery(GET_WORKSPACE_BY_PROJECT, {
    variables: { projectId },
  });
  const [createWorkspace] = useMutation(CREATE_WORKSPACE);
  
  // Actualizar para usar GET_DIRECTORY_CONTENTS
  const { data: directoriesData, refetch: refetchDirectories } = useQuery(GET_DIRECTORY_CONTENTS, {
    variables: { 
      workspaceId: data?.workspacesByProject?.[0]?.id,
      parentId: null // Para obtener solo directorios raíz
    },
    skip: !data?.workspacesByProject?.[0]?.id,
  });
  const [createDirectory] = useMutation(CREATE_DIRECTORY);
  const [updateDirectory] = useMutation(UPDATE_DIRECTORY);
  const [uploadDirectoryStructure] = useMutation(UPLOAD_DIRECTORY_STRUCTURE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (data?.workspacesByProject?.[0]?.id) {
      refetchDirectories();
    }
  }, [data, refetchDirectories]);

  const handleCreateWorkspace = async (workspaceData) => {
    try {
      await createWorkspace({
        variables: { input: workspaceData },
      });
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const workspace = data?.workspacesByProject?.[0];

  // Lista de directorios a ignorar
  const IGNORED_DIRECTORIES = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.cache'
  ];

  const handleFileUpload = useCallback(async (event) => {
    if (!workspace) return;
    
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Filtrar archivos ignorando los directorios no deseados
    const filteredFiles = files.filter(file => {
      const relativePath = file.webkitRelativePath;
      return !IGNORED_DIRECTORIES.some(dir => 
        relativePath.split('/').includes(dir)
      );
    });

    if (filteredFiles.length === 0) {
      message.warning('No valid files found after filtering');
      return;
    }

    // Crear un FormData con los archivos y sus rutas relativas
    const formData = new FormData();
    const paths = [];

    filteredFiles.forEach(file => {
      const relativePath = file.webkitRelativePath;
      paths.push(relativePath);
      formData.append('files', file);
    });

    try {
      const { data } = await uploadDirectoryStructure({
        variables: {
          workspaceId: workspace.id,
          files: filteredFiles,
          paths: paths
        }
      });

      if (data.uploadDirectoryStructure.success) {
        message.success('Directory structure uploaded successfully');
        refetchDirectories();
      }
    } catch (error) {
      console.error('Error uploading directory structure:', error);
      message.error('Error uploading directory structure');
    }
  }, [workspace, uploadDirectoryStructure, refetchDirectories]);

  const transformToTreeData = (directories) => {
    if (!directories) return [];
    return directories.map(dir => ({
      key: dir.id,
      title: dir.name,
      children: dir.children ? transformToTreeData(dir.children) : []
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const items = [
    {
      key: "fileManager",
      label: "File Manager",
      children: <FileManager workspaceId={workspace?.id} projectId={projectId} />
    }
  ];

  return (
    <div>
      {workspace ? (
        <div>
          <Tabs 
            defaultActiveKey="fileManager"
            items={items}
          />
        </div>
      ) : (
        <div>
          <Button onClick={() => setIsModalOpen(true)}>Create Workspace</Button>
          <Modal
            title="Create Workspace"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <CreateWorkspace projectId={projectId} onCreate={handleCreateWorkspace} />
          </Modal>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManager;
