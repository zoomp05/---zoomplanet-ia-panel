const TREE_STORAGE_KEY = 'fileManager:tree:';
const LAST_DIR_KEY = 'fileManager:lastDir:';
const LOADED_PATHS_KEY = 'fileManager:loadedPaths:';

export const useAsyncStorage = () => {
  const getStoredTree = async (workspaceId) => {
    try {
      const stored = localStorage.getItem(`${TREE_STORAGE_KEY}${workspaceId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading tree from storage:', error);
      return null;
    }
  };

  const storeTree = async (workspaceId, tree) => {
    try {
      localStorage.setItem(`${TREE_STORAGE_KEY}${workspaceId}`, JSON.stringify(tree));
    } catch (error) {
      console.error('Error storing tree:', error);
    }
  };

  const getLastOpenDirectory = async (workspaceId) => {
    try {
      const stored = localStorage.getItem(`${LAST_DIR_KEY}${workspaceId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading last directory:', error);
      return null;
    }
  };

  const storeLastOpenDirectory = async (workspaceId, directory) => {
    try {
      localStorage.setItem(`${LAST_DIR_KEY}${workspaceId}`, JSON.stringify(directory));
    } catch (error) {
      console.error('Error storing last directory:', error);
    }
  };

  const getLoadedPaths = async (workspaceId) => {
    try {
      const stored = localStorage.getItem(`${LOADED_PATHS_KEY}${workspaceId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('Error reading loaded paths:', error);
      return new Set();
    }
  };

  const storeLoadedPaths = async (workspaceId, paths) => {
    try {
      localStorage.setItem(`${LOADED_PATHS_KEY}${workspaceId}`, JSON.stringify([...paths]));
    } catch (error) {
      console.error('Error storing loaded paths:', error);
    }
  };

  return {
    getStoredTree,
    storeTree,
    getLastOpenDirectory,
    storeLastOpenDirectory,
    getLoadedPaths,
    storeLoadedPaths
  };
};
