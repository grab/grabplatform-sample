import React from "react";
import { connect } from "react-redux";
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
  connect(({ repository }) => ({ repository })),
  withProps(({ repository, setStage }) => ({
    setStage: async stage => {
      await repository.navigation.overrideQuery({ stage: stage + 1 });
      setStage(stage);
    }
  }))
)(PrivateStageSwitcher);
