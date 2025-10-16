import React, { useRef, useState } from "react";
import { Button } from "antd";
import { CodeOutlined, EyeOutlined } from "@ant-design/icons";
import MonacoEditor from "./MonacoEditor";
import HtmlEditor from "./HtmlEditor";

const Editor = ({ defaultValue, onChange }) => {
  const [activeView, setActiveView] = useState("code");
  const contentRef = useRef(defaultValue || "");

  const handleChange = (newContent) => {
    contentRef.current = newContent;
    onChange?.(newContent);
  };

  return (
    <div className="custom-html-editor w-full">
      <div className="flex items-center gap-2 mb-4">
        <Button.Group>
          <Button
            icon={<CodeOutlined />}
            onClick={() => setActiveView("code")}
            type={activeView === "code" ? "primary" : "default"}
          >
            Edit HTML
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setActiveView("preview")}
            type={activeView === "preview" ? "primary" : "default"}
          >
            Preview
          </Button>
        </Button.Group>
      </div>

      <div className="border rounded-lg">
        {activeView === "code" ? (
          <MonacoEditor 
            defaultValue={contentRef.current} 
            onChange={handleChange}
          />
        ) : (
          <HtmlEditor
            defaultValue={contentRef.current}
            onChange={handleChange}
          />
        )}
      </div>
    </div>
  );
};

export default Editor;
