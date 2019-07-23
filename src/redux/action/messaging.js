/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonMessages } from "./common";

export const MessagingActions = {
  TRIGGET_SEND_INBOX_MESSAGE: "TRIGGER_SEND_INBOX_MESSAGE"
};

export const MessagingActionCreators = {
  triggerSendInboxMessage: () => ({
    payload: async (
      dispatch,
      getState,
      { messaging: { sendInboxMessage } }
    ) => {
      try {
        await sendInboxMessage();

        dispatch(
          CommonActionCreators.setMessage(CommonMessages.messaging.inbox)
        );
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: MessagingActions.TRIGGET_SEND_INBOX_MESSAGE
  })
};
