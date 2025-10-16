import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

const MonacoEditor = ({ defaultValue, onChange }) => {
  const contentRef = useRef(defaultValue || '');
  const monacoRef = useRef(null);
  const initialFormatDoneRef = useRef(false);

  const formatDocument = async (editor) => {
    if (editor) {
      // Obtener las acciones de formato disponibles
      const actions = editor.getAction('editor.action.formatDocument');
      if (actions) {
        await actions.run();
      }
    }
  };

  useEffect(() => {
    if (defaultValue && contentRef.current !== defaultValue) {
      contentRef.current = defaultValue;
      if (monacoRef.current) {
        monacoRef.current.setValue(defaultValue);
        // Formatear después de establecer el nuevo valor
        formatDocument(monacoRef.current);
      }
    }
  }, [defaultValue]);

  const handleEditorDidMount = async (editor, monaco) => {
    monacoRef.current = editor;
    editor.setValue(contentRef.current);
    
    if (monaco.languages.html) {
      monaco.languages.html.htmlDefaults.setOptions({
        format: {
          tabSize: 2,
          insertSpaces: true,
          wrapLineLength: 120,
          unformatted: ''
        }
      });
    }

    // Aseguramos que el formateo inicial solo ocurra una vez
    if (!initialFormatDoneRef.current) {
      // Pequeño delay para asegurar que el editor está listo
      setTimeout(async () => {
        await formatDocument(editor);
        initialFormatDoneRef.current = true;
        // Disparar onChange después del formateo inicial
        const formattedContent = editor.getValue();
        onChange?.(formattedContent);
      }, 100);
    }
  };

  const handleCodeChange = () => {
    const newContent = monacoRef.current.getValue();
    contentRef.current = newContent;
    onChange?.(newContent);
  };

  return (
    <div className="editor-container">
      <div className="code-editor">
        <Editor
          height="500px"
          defaultLanguage="html"
          onMount={handleEditorDidMount}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            automaticLayout: true,
            theme: 'vs-dark',
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;