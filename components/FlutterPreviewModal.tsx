import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function FlutterPreviewModal({
  flutterCode,
  setFlutterCode,
}: {
  flutterCode: string | null;
  setFlutterCode: (code: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  if (!flutterCode) {
    return null;
  }

  const encodedCode = encodeURIComponent(flutterCode);
  const dartpadUrl = `https://dartpad.dev/embed-flutter.html?split=40`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="bg-white rounded-lg shadow-xl flex flex-col"
      style={{
        width: "calc(100% - 64px)",
        height: "calc(100% - 64px)",
      }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-1">
          <TabButton
            active={activeTab === "preview"}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </TabButton>
          <TabButton
            active={activeTab === "code"}
            onClick={() => setActiveTab("code")}
          >
            Code
          </TabButton>
        </div>

        <button
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          onClick={() => setFlutterCode(null)}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {activeTab === "preview" ? (
        <iframe className="w-full h-full" src={dartpadUrl} />
      ) : (
        <div className="w-full h-full overflow-auto">
          <SyntaxHighlighter
            language="dart"
            style={tomorrow}
            customStyle={{ margin: 0, height: '100%' }}
          >
            {flutterCode}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

interface TabButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

function TabButton({ active, ...buttonProps }: TabButtonProps) {
  const className = active
    ? "px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-t-md focus:outline-none focus:ring"
    : "px-4 py-2 text-sm font-medium text-blue-500 bg-transparent hover:bg-blue-100 focus:bg-blue-100 rounded-t-md focus:outline-none focus:ring";
  return <button className={className} {...buttonProps} />;
}