/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { GrabPayActionCreators } from "redux/action";
import "./style.scss";

function PrivateTransaction({
  amount,
  description,
  partnerGroupTxID,
  partnerTxID,
  setAmount,
  setDescription,
  setPartnerGroupTransactionID
}) {
  return (
    <div className="transaction-container">
      <div className="title">Partner group transaction ID</div>

      <input
        onChange={({ target: { value } }) =>
          setPartnerGroupTransactionID(value)
        }
        placeholder="Enter partner transaction ID"
        spellCheck={false}
        value={partnerGroupTxID}
      />

      <div className="title">Transaction description</div>

      <input
        onChange={({ target: { value } }) => setDescription(value)}
        placeholder="Enter transaction description"
        spellCheck={false}
        value={description}
      />

      <div className="title">Transaction amount</div>

      <input
        onChange={({ target: { value } }) => setAmount(value)}
        placeholder="Enter transaction amount"
        spellCheck={false}
        value={amount}
      />

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
      grabpay: {
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
    }),
    dispatch => ({
      setAmount: amount =>
        dispatch(
          GrabPayActionCreators.OneTimeCharge.setTransactionAmount(amount)
        ),
      setDescription: description =>
        dispatch(
          GrabPayActionCreators.OneTimeCharge.setDescription(description)
        ),
      setPartnerGroupTransactionID: partnerGroupTxID =>
        dispatch(
          GrabPayActionCreators.Transaction.setPartnerGroupTransactionID(
            partnerGroupTxID
          )
        )
    })
  )
)(PrivateTransaction);
