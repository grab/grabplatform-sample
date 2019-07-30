import React, { Fragment } from "react";
import { compose } from "recompose";
import "./style.scss";

function PrivateTemplate({
  templates = {},
  templateName = "",
  templateParams = {},
  onTemplateNameChange,
  onTemplateParamsChange
}) {
  return (
    <div className="template-container">
      <div className="title">Template ID</div>

      <select
        className="template-select"
        onChange={({ currentTarget: { value } }) => onTemplateNameChange(value)}
      >
        <option key={""} label={"Please select a template"} value={""} />

        {Object.keys(templates).map(key => (
          <option key={key} label={key} value={key} />
        ))}
      </select>

      {!!templateName && (
        <>
          {Object.entries(templates[templateName])
            .filter(([key]) => key !== "name")
            .map(([key, { readonly, value }]) => (
              <Fragment key={key}>
                <div className="title">{key}</div>

                <input
                  disabled={!!readonly}
                  onChange={({ target: { value } }) =>
                    onTemplateParamsChange({ ...templateParams, [key]: value })
                  }
                  readOnly={!!readonly}
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
