import React from "react";
import "./style.scss";

export default function PrivateStageSwitcher({
  currentStage,
  stageCount,
  setStage
}) {
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
