/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonMessages } from "./common";

export const MessagingActions = {
  SET_MESSAGE_ID: "SET_MESSAGE_ID",

  TRIGGET_SEND_INBOX_MESSAGE: "TRIGGER_SEND_INBOX_MESSAGE",
  TRIGGET_SEND_PUSH_MESSAGE: "TRIGGET_SEND_PUSH_MESSAGE"
};

export const MessagingActionCreators = {
  setMessageID: (messageID = "") => ({
    payload: messageID,
    type: MessagingActions.SET_MESSAGE_ID
  }),
  triggerSendInboxMessage: () => ({
    payload: async (
      dispatch,
      getState,
      { messaging: { sendInboxMessage } }
    ) => {
      try {
        const {
          configuration: { partnerHMACSecret, partnerID }
        } = getState();

        const { messageID } = await sendInboxMessage({
          partnerHMACSecret,
          partnerID
        });

        dispatch(MessagingActionCreators.setMessageID(messageID));

        dispatch(
          CommonActionCreators.setMessage(CommonMessages.messaging.inbox)
        );
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: MessagingActions.TRIGGET_SEND_INBOX_MESSAGE
  }),
  triggerSendPushMessage: () => ({
    payload: async (dispatch, getState, { messaging: { sendPushMessage } }) => {
      try {
        const {
          configuration: { partnerHMACSecret, partnerID }
        } = getState();

        await sendPushMessage({ partnerHMACSecret, partnerID });

        dispatch(
          CommonActionCreators.setMessage(CommonMessages.messaging.push)
        );
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: MessagingActions.TRIGGET_SEND_PUSH_MESSAGE
  })
};
