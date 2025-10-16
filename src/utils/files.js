// utils/files.js

export const writeFile = async ({ path, content, commitMessage }) => {
  try {
    const response = await fetch('/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        content,
        commitMessage,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
};