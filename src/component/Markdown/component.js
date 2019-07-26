import React from "react";
import BaseMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";

function CodeBlock({ language, value }) {
  return <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>;
}

export default function Markdown({ className, source }) {
  return (
    <BaseMarkdown
      className={className}
      renderers={{ code: CodeBlock }}
      source={source}
    />
  );
}
