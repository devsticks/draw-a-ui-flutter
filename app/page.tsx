"use client";

import dynamic from "next/dynamic";
import "@tldraw/tldraw/tldraw.css";
import { useEditor } from "@tldraw/tldraw";
import { getSvgAsImage } from "@/lib/getSvgAsImage";
import { blobToBase64 } from "@/lib/blobToBase64";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FlutterPreviewModal } from "@/components/FlutterPreviewModal";

const Tldraw = dynamic(async () => (await import("@tldraw/tldraw")).Tldraw, {
  ssr: false,
});

export default function Home() {
  const [flutterCode, setFlutterCode] = useState<null | string>(null);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFlutterCode(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  });

  return (
    <>
      <div className={`w-screen h-screen`}>
        <Tldraw persistenceKey="tldraw">
          <ExportButton setFlutterCode={setFlutterCode} />
        </Tldraw>
      </div>
      {flutterCode &&
        ReactDOM.createPortal(
          <div
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
            style={{ zIndex: 2000, backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setFlutterCode(null)}
          >
            <FlutterPreviewModal flutterCode={flutterCode} setFlutterCode={setFlutterCode} />
          </div>,
          document.body
        )}
    </>
  );
}

function ExportButton({ setFlutterCode }: { setFlutterCode: (code: string) => void }) {
  const editor = useEditor();
  const [loading, setLoading] = useState(false);
  // A tailwind styled button that is pinned to the bottom right of the screen
  return (
    <button
      onClick={async (e) => {
        setLoading(true);
        try {
          e.preventDefault();
          const svg = await editor.getSvg(
            Array.from(editor.currentPageShapeIds)
          );
          if (!svg) {
            return;
          }
          const png = await getSvgAsImage(svg, {
            type: "png",
            quality: 1,
            scale: 1,
          });
          const dataUrl = await blobToBase64(png!);
          const resp = await fetch("/api/toFlutter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: dataUrl }),
          });

          const json = await resp.json();

          if (json.error) {
            alert("Error from OpenAI: " + JSON.stringify(json.error));
            return;
          }

          const message = json.choices[0].message.content;
          const start = message.indexOf(`\`\`\`dart`);
          console.log(start);
          let end = message.indexOf(`}\`\`\``);
          if (end != -1) { end += 1; }
          else { end = message.indexOf(`}\n\`\`\``); }
          if (end != -1) { end += 2; }
          else { end = message.length; }
          console.log(end);
          const flutterCode = message.slice(start + `\`\`\`dart`.length, end).trim();
          console.log(flutterCode);
          setFlutterCode(flutterCode);
        } finally {
          setLoading(false);
        }
      }}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      style={{ zIndex: 1000 }}
      disabled={loading}
    >
      {loading ? (
        <div className="flex justify-center items-center ">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      ) : (
        "Make Real"
      )}
    </button>
  );
}
