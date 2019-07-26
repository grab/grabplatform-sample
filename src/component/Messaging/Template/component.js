import React, { Fragment } from "react";
import { compose } from "recompose";
import "./style.scss";

function PrivateTemplate({
  templates = {},
  templateID = "",
  templateParams = {},
  onTemplateIDChange,
  onTemplateParamsChange
}) {
  return (
    <div className="template-container">
      <div className="title">Template ID</div>

      <select
        className="template-select"
        onChange={({ currentTarget: { value } }) => onTemplateIDChange(value)}
      >
        <option key={""} label={"Please select a template"} value={""} />

        {Object.entries(templates).map(([key, { name: { value } }]) => (
          <option key={key} label={value} value={key} />
        ))}
      </select>

      {!!templateID && (
        <>
          <div className="title">ID</div>
          <input disabled readonly value={templateID} />

          {Object.entries(templates[templateID])
            .filter(([key]) => key !== "name")
            .map(([key, { readonly, value }]) => (
              <Fragment key={key}>
                <div className="title">{key}</div>

                <input
                  disabled={!!readonly}
                  onChange={({ target: { value } }) =>
                    onTemplateParamsChange({ ...templateParams, [key]: value })
                  }
                  readonly={!!readonly}
                  value={templateParams[key] || value || ""}
                />
              </Fragment>
            ))}
        </>
      )}
    </div>
  );
}

export default compose()(PrivateTemplate);
