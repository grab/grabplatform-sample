/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonMessages } from "./common";

export const IdentityActions = {
  SET_BASIC_PROFILE: "SET_BASIC_PROFILE",

  TRIGGER_GET_BASIC_PROFILE: "TRIGGER_GET_BASIC_PROFILE"
};

export const IdentityActionCreators = {
  setBasicProfile: profile => ({
    payload: profile,
    type: IdentityActions.SET_BASIC_PROFILE
  }),
  triggerGetBasicProfile: () => ({
    payload: async (dispatch, getState, { identity: { getBasicProfile } }) => {
      const profile = await getBasicProfile();
      dispatch(IdentityActionCreators.setBasicProfile(profile));

      dispatch(
        CommonActionCreators.setMessage(CommonMessages.identity.basicProfile)
      );
    },
    type: IdentityActions.TRIGGER_GET_BASIC_PROFILE
  })
};
