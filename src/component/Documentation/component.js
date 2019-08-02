import React from "react";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";

function CodeBlock({ language, value }) {
  return <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>;
}

export default function Documentation({ className, source }) {
  return (
    <Markdown
      className={className}
      renderers={{ code: CodeBlock }}
      source={source}
    />
  );
}
