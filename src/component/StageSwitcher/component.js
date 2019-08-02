import { parse, stringify } from "querystring";
import React from "react";
import { compose, withProps } from "recompose";
import "./style.scss";

function PrivateStageSwitcher({ currentStage, stageCount, setStage }) {
  return (
    <div className="stage-container">
      {[...Array(stageCount).keys()].map(stage => (
        <div
          className={`stage${currentStage === stage ? " selected" : ""}`}
          key={stage}
          onClick={() => setStage(stage)}
        >
          Stage {stage + 1}
        </div>
      ))}
    </div>
  );
}

export default compose(
  withProps(({ setStage }) => ({
    setStage: stage => {
      const { origin, pathname, search } = window.location;
      const currentURL = `${origin}${pathname}`;
      const newQuery = { ...parse(search.substr(1)), stage: stage + 1 };
      const newSearch = `?${stringify(newQuery)}`;
      window.history.replaceState(null, null, `${currentURL}${newSearch}`);
      setStage(stage);
    }
  }))
)(PrivateStageSwitcher);
