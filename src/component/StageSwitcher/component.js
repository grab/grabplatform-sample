import React from "react";
import { compose, withProps } from "recompose";
import { overrideNavigationQuery } from "utils";
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
    setStage: async stage => {
      overrideNavigationQuery({ stage: stage + 1 });
      setStage(stage);
    }
  }))
)(PrivateStageSwitcher);
