import BasicProfile from "component/Identity/BasicProfile/component";
import ProductContainer from "component/ProductContainer/component";
import React from "react";
import "./style.scss";

const products = [["Basic Profile", BasicProfile]];

function PrivateIdentity() {
  return (
    <div className={"identity-container"}>
      <ProductContainer category="identity" products={products} />
    </div>
  );
}

export default PrivateIdentity;
