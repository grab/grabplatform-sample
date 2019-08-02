import { parse } from "querystring";
import React from "react";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { compose, withProps } from "recompose";

function CodeBlock({ language, value }) {
  return <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>;
}

function Documentation({ className, enabled, source }) {
  return !!enabled ? (
    <Markdown
      className={className}
      renderers={{ code: CodeBlock }}
      source={source}
    />
  ) : null;
}

export default compose(
  withProps(() => ({
    enabled: (() => {
      const search = window.location.search;
      const { documentation } = parse(search.substr(1));
      return documentation === "true";
    })()
  }))
)(Documentation);
