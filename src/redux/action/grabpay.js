/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonMessages } from "./common";

export const GrabPayActions = {
  CLEAR_CREDENTIALS: "GRABPAY.CLEAR_CREDENTIALS",
  SET_REQUEST: "SET_REQUEST",
  SET_WALLET: "SET_WALLET",
  TRIGGER_CHECK_WALLET: "TRIGGET_CHECK_WALLET",

  OneTimeCharge: {
    TRIGGER_INIT: "GRABPAY.OTC.TRIGGER_INIT",
    TRIGGER_CONFIRM: "GRABPAY.OTC.TRIGGER_CONFIRM"
  },

  RecurringCharge: {
    TRIGGER_BIND: "GRABPAY.RC.TRIGGER_BIND",
    TRIGGER_CHARGE: "GRABPAY.RC.TRIGGER_CHARGE",
    TRIGGER_UNBIND: "GRABPAY.RC.TRIGGER_UNBIND"
  },

  Transaction: {
    SET_AMOUNT: "GRABPAY.TX.SET_AMOUNT",
    SET_DESCRIPTION: "GRABPAY.TX.SET_DESCRIPTION",
    SET_PARTNER_GROUP_TRANSACTION_ID:
      "GRABPAY.TX.SET_PARTNER_GROUP_TRANSACTION_ID",
    SET_PARTNER_TRANSACTION_ID: "GRABPAY.TX.SET_PARTNER_TRANSACTION_ID",
    SET_TRANSACTION_STATUS: "GRABPAY.TX.SET_TRANSACTION_STATUS"
  }
};

export const GrabPayActionCreators = {
  clearCredentials: () => ({ type: GrabPayActions.CLEAR_CREDENTIALS }),
  setRequest: request => ({
    payload: request,
    type: GrabPayActions.SET_REQUEST
  }),
  setWallet: (wallet = {}) => ({
    payload: wallet,
    type: GrabPayActions.SET_WALLET
  }),
  triggerCheckWallet: () => ({
    payload: async (dispatch, getState, { grabpay: { checkWallet } }) => {
      const {
        configuration: { clientSecret, currency }
      } = getState();

      const wallet = await checkWallet({ clientSecret, currency });
      dispatch(GrabPayActionCreators.setWallet(wallet));
      dispatch(CommonActionCreators.setMessage(`Checked wallet successfully`));
    },
    type: GrabPayActions.TRIGGER_CHECK_WALLET
  }),
  OneTimeCharge: {
    triggerInit: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            oneTimeCharge: { init }
          }
        }
      ) => {
        const {
          configuration: { currency, partnerHMACSecret, partnerID, merchantID },
          grabpay: {
            transaction: { amount, description, partnerGroupTxID }
          }
        } = getState();

        const { partnerTxID, request } = await init({
          amount,
          currency,
          description,
          merchantID,
          partnerGroupTxID,
          partnerHMACSecret,
          partnerID
        });

        dispatch(
          GrabPayActionCreators.Transaction.setPartnerTransactionID(partnerTxID)
        );

        dispatch(GrabPayActionCreators.setRequest(request));

        dispatch(
          CommonActionCreators.setMessage(
            CommonMessages.grabpay.oneTimeCharge.init
          )
        );
      },
      type: GrabPayActions.OneTimeCharge.TRIGGER_INIT
    }),
    triggerConfirm: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            oneTimeCharge: { confirm }
          }
        }
      ) => {
        const {
          configuration: { clientSecret },
          grabpay: {
            transaction: { partnerTxID }
          }
        } = getState();

        const { status } = await confirm({ clientSecret, partnerTxID });

        dispatch(
          GrabPayActionCreators.Transaction.setTransactionStatus(status)
        );

        dispatch(
          CommonActionCreators.setMessage(
            CommonMessages.grabpay.oneTimeCharge.confirm
          )
        );
      },
      type: GrabPayActions.OneTimeCharge.TRIGGER_CONFIRM
    })
  },
  RecurringCharge: {
    triggerBind: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            recurringCharge: { bind }
          }
        }
      ) => {
        const {
          configuration: { countryCode, partnerHMACSecret, partnerID }
        } = getState();

        const { partnerTxID, request } = await bind({
          countryCode,
          partnerHMACSecret,
          partnerID
        });

        dispatch(GrabPayActionCreators.setRequest(request));

        dispatch(
          GrabPayActionCreators.Transaction.setPartnerTransactionID(partnerTxID)
        );

        dispatch(
          CommonActionCreators.setMessage(
            CommonMessages.grabpay.recurringCharge.bind
          )
        );
      },
      type: GrabPayActions.RecurringCharge.TRIGGER_BIND
    }),
    triggerCharge: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            recurringCharge: { charge }
          }
        }
      ) => {
        const {
          configuration: { clientSecret, currency, merchantID },
          grabpay: {
            transaction: { amount, description, partnerGroupTxID, partnerTxID }
          }
        } = getState();

        const { status } = await charge({
          amount,
          clientSecret,
          currency,
          description,
          merchantID,
          partnerGroupTxID,
          partnerTxID
        });

        dispatch(
          GrabPayActionCreators.Transaction.setTransactionStatus(status)
        );

        dispatch(GrabPayActionCreators.triggerCheckWallet());

        dispatch(
          CommonActionCreators.setMessage(
            CommonMessages.grabpay.recurringCharge.charge
          )
        );
      },
      type: GrabPayActions.RecurringCharge.TRIGGER_CHARGE
    }),
    triggerUnbind: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            recurringCharge: { unbind }
          }
        }
      ) => {
        const {
          configuration: { clientSecret },
          grabpay: {
            transaction: { partnerTxID }
          }
        } = getState();

        await unbind({ clientSecret, partnerTxID });

        dispatch(
          CommonActionCreators.setMessage(
            CommonMessages.grabpay.recurringCharge.unbind
          )
        );
      },
      type: GrabPayActions.RecurringCharge.TRIGGER_CHARGE
    })
  },
  Transaction: {
    setDescription: description => ({
      payload: description,
      type: GrabPayActions.Transaction.SET_DESCRIPTION
    }),
    setPartnerGroupTransactionID: partnerGroupTxID => ({
      payload: partnerGroupTxID,
      type: GrabPayActions.Transaction.SET_PARTNER_GROUP_TRANSACTION_ID
    }),
    setPartnerTransactionID: partnerTxID => ({
      payload: partnerTxID,
      type: GrabPayActions.Transaction.SET_PARTNER_TRANSACTION_ID
    }),
    setTransactionAmount: amount => ({
      payload: amount,
      type: GrabPayActions.Transaction.SET_AMOUNT
    }),
    setTransactionStatus: status => ({
      payload: status,
      type: GrabPayActions.Transaction.SET_TRANSACTION_STATUS
    })
  }
};
