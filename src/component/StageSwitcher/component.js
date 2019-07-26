import React from "react";
import "./style.scss";

export default function PrivateStageSwitcher({ stageCount, setStage }) {
  return (
    <div className="stage-container">
      {[...Array(stageCount).keys()].map(stage => (
        <div className="stage" onClick={() => setStage(stage)}>
          {stage + 1}
        </div>
      ))}
    </div>
  );
}
