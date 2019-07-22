import BasicProfile from "component/Identity/BasicProfile/component";
import ProductContainer from "component/ProductContainer/component";
import React from "react";
import "./style.scss";

const products = [["Basic Profile", BasicProfile]];

function PrivateIdentity({ match: { path } }) {
  return (
    <div className={"identity-container"}>
      <ProductContainer products={products} urlPath={path} />
    </div>
  );
}

export default PrivateIdentity;
