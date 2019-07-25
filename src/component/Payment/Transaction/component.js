/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import "./style.scss";

function PrivateTransaction({
  amount = 0,
  description = "",
  partnerGroupTxID = "",
  partnerTxID = ""
}) {
  return (
    <div className="transaction-container">
      <div className="title">Partner group transaction ID</div>
      <input disabled readOnly spellCheck={false} value={partnerGroupTxID} />
      <div className="title">Transaction description</div>
      <input disabled readOnly spellCheck={false} value={description} />
      <div className="title">Transaction amount</div>
      <input disabled readOnly spellCheck={false} value={amount} />

      {!!partnerTxID && (
        <>
          <div className="title">Partner transaction ID</div>
          <input disabled readOnly spellCheck={false} value={partnerTxID} />
        </>
      )}
    </div>
  );
}

export default compose(
  connect(
    ({
      configuration: {
        transaction: {
          amount,
          description,
          partnerGroupTxID,
          partnerTxID,
          status
        }
      }
    }) => ({
      amount,
      description,
      partnerGroupTxID,
      partnerTxID,
      status
    })
  )
)(PrivateTransaction);
