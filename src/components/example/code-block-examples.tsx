"use client";

import React from "react";
import CodeBlock, { CodeFile } from "@/components/ui/code";

export function CodeBlockExamples() {
  // Basic code example
  const basicCodeFiles: CodeFile[] = [
    {
      name: "index.js",
      language: "javascript",
      content: `const greeting = "Hello, world!";
console.log(greeting);`,
    },
  ];

  // Command example with different package managers
  const installCommand = "install react react-dom next";
  const npmCommand = `npm ${installCommand}`;
  const pnpmCommand = `pnpm ${installCommand}`;
  const bunCommand = `bun ${installCommand}`;

  // Multiple files example
  const files: CodeFile[] = [
    {
      name: "index.js",
      language: "javascript",
      content: `import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`,
    },
    {
      name: "App.js",
      language: "javascript",
      content: `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello, World!</h1>
    </div>
  );
}

export default App;`,
    },
    {
      name: "styles.css",
      language: "css",
      content: `.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #333;
  font-size: 2rem;
}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Basic Code Block</h2>
        <CodeBlock
          type="files"
          files={basicCodeFiles}
        />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Command with Package Manager Options</h2>
        <CodeBlock
          type="command"
          packageManagers={[
            { type: "npm", command: npmCommand },
            { type: "pnpm", command: pnpmCommand },
            { type: "bun", command: bunCommand },
          ]}
        />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Multiple Files</h2>
        <CodeBlock
          type="files"
          files={files}
        />
      </div>
    </div>
  );
}
