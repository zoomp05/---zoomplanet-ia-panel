import React, { useRef, useEffect } from "react";

const HTMLEditor = ({ defaultValue, onChange }) => {
  const contentRef = useRef(defaultValue || "");
  const previewRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const normalizeHtml = (html) => {
    return html
      .replace(/>\s+</g, '><') // Eliminar espacios entre tags
      .replace(/\n+/g, '') // Eliminar saltos de línea
      .replace(/\s{2,}/g, ' ') // Normalizar espacios múltiples
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '<p></p>') // Limpiar párrafos vacíos
      .trim();
  };

  useEffect(() => {
    if (previewRef.current && defaultValue !== undefined) {
      const normalizedContent = normalizeHtml(defaultValue);
      contentRef.current = normalizedContent;
      previewRef.current.innerHTML = normalizedContent;
    }
  }, [defaultValue]);

  const saveCaretPosition = (element) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      cursorPositionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreCaretPosition = () => {
    if (cursorPositionRef.current && previewRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(cursorPositionRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      
      if (e.shiftKey) {
        // Insertar <br/>
        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
      } else {
        // Insertar nuevo párrafo
        const p = document.createElement('p');
        p.innerHTML = '<br/>'; // Asegura que el párrafo tenga altura
        range.insertNode(p);
        range.setStart(p, 0);
      }
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Disparar cambio
      handlePreviewChange({ currentTarget: previewRef.current, preventDefault: () => {} });
    }
  };

  const handlePreviewChange = (e) => {
    e.preventDefault();
    saveCaretPosition(e.currentTarget);
    
    let newContent = e.currentTarget.innerHTML
      .replace(/&nbsp;/g, ' ')
      .replace(/<div>/g, '<p>')
      .replace(/<\/div>/g, '</p>')
      .trim();

    newContent = normalizeHtml(newContent);

    if (newContent !== contentRef.current) {
      contentRef.current = newContent;
      onChange?.(newContent);
      
      setTimeout(restoreCaretPosition, 0);
    }
  };

  return (
    <div className="custom-html-editor w-full">
      <style jsx global>{`
        .custom-html-editor .preview-content {
          min-height: 24rem;
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-y: auto;
          white-space: normal;
          line-height: 1.5;
        }

        .custom-html-editor .preview-content:focus {
          outline: 2px solid #1677ff;
          outline-offset: -2px;
        }

        .custom-html-editor .preview-content p {
          margin: 1em 0;
          min-height: 1.2em;
        }

        .custom-html-editor .preview-content p:first-child {
          margin-top: 0;
        }

        .custom-html-editor .preview-content p:last-child {
          margin-bottom: 0;
        }

        .custom-html-editor .preview-content br {
          line-height: 1.5;
          content: "";
          display: block;
          margin: 0.375em 0;
        }

        .custom-html-editor .preview-content ul,
        .custom-html-editor .preview-content ol {
          margin: 1em 0;
          padding-left: 2em;
        }
      `}</style>

      <div className="border rounded-lg">
        <div
          ref={previewRef}
          contentEditable
          onInput={handlePreviewChange}
          onKeyDown={handleKeyDown}
          className="preview-content prose prose-sm max-w-none"
          suppressContentEditableWarning={true}
        />
      </div>
    </div>
  );
};

export default HTMLEditor;
