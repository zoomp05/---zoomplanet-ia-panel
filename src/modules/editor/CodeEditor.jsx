import React, { useRef, useEffect, useState } from "react";
import { Button } from "antd";

const CodeEditor = ({ defaultValue, onChange }) => {
  const contentRef = useRef(defaultValue || "");
  const textareaRef = useRef(null);

  const getLineCount = () => {
    return contentRef.current.split("\n").length;
  };

  useEffect(() => {
    if (defaultValue && contentRef.current !== defaultValue) {
      contentRef.current = defaultValue;
      if (textareaRef.current) {
        textareaRef.current.value = defaultValue;
      }
    }
  }, [defaultValue]);

  const triggerChange = (newContent) => {
    contentRef.current = newContent;
    if (onChange) {
      onChange(newContent);
    }
  };

  const handleCodeChange = (e) => {
    const newContent = e.target.value;
    triggerChange(newContent);
  };

  const formatHTML = () => {
    const indentSize = 2;
    const newLines = [];
    const tokens = contentRef.current
      .replace(/\s+</g, "<")
      .replace(/>\s+/g, ">")
      .replace(/<!--[\s\S]*?-->/g, "")
      .split(/(<[^>]+>)/);

    let depth = 0;
    let lastToken = "";

    tokens.forEach((token) => {
      if (!token.trim()) return;

      if (token.match(/<[^>]*\/>/)) {
        newLines.push(" ".repeat(depth * indentSize) + token);
        return;
      }

      if (token.startsWith("</")) {
        depth--;
        if (lastToken.startsWith("</") || lastToken.match(/<[^>]+>[^<]+$/)) {
          newLines.push(" ".repeat(depth * indentSize) + token);
        } else {
          newLines[newLines.length - 1] += token;
        }
      } else if (token.startsWith("<")) {
        newLines.push(" ".repeat(depth * indentSize) + token);
        if (!token.endsWith("/>")) depth++;
      } else {
        if (lastToken.startsWith("<") && !lastToken.endsWith("/>")) {
          newLines[newLines.length - 1] += token;
        } else {
          newLines.push(" ".repeat(depth * indentSize) + token);
        }
      }

      lastToken = token;
    });

    const formattedContent = newLines.join("\n");
    contentRef.current = formattedContent;
    if (textareaRef.current) {
      textareaRef.current.value = formattedContent;
    }
    triggerChange(formattedContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = "  ";
      const newContent =
        contentRef.current.substring(0, start) +
        spaces +
        contentRef.current.substring(end);

      contentRef.current = newContent;
      e.target.value = newContent;
      triggerChange(newContent);

      setTimeout(() => {
        e.target.selectionStart = start + 2;
        e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="custom-html-editor w-full">
      <style jsx global>{`
        .custom-html-editor .line-numbers {
          user-select: none;
          padding: 1rem 0.5rem;
          text-align: right;
          background: #1e293b;
          color: #64748b;
          font-family: monospace;
          font-size: 0.875rem;
          min-width: 3rem;
        }

        .custom-html-editor .code-editor {
          width: 100%;
          height: 24rem;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.875rem;
          resize: none;
          background: #020617;
          color: #f8fafc;
          line-height: 1.5;
          tab-size: 2;
        }

        .custom-html-editor .code-editor:focus {
          outline: none;
        }
      `}</style>

      <div className="flex items-center gap-2 mb-4">
        <Button onClick={formatHTML}>Format</Button>
      </div>

      <div className="border rounded-lg">
        <div className="relative flex">
          <div className="line-numbers">
            {Array.from({ length: getLineCount() }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            defaultValue={contentRef.current}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            className="code-editor"
            placeholder="Pega tu código HTML aquí..."
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
