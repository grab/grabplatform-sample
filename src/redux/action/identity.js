/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators } from "./common";

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
      const {
        grabid: { accessToken }
      } = getState();

      try {
        const profile = await getBasicProfile(accessToken);
        dispatch(IdentityActionCreators.setBasicProfile(profile));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: IdentityActions.TRIGGER_GET_BASIC_PROFILE
  })
};
