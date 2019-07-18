/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonMessages } from "./common";

export const LoyaltyActions = {
  SET_REWARDS_TIER: "SET_REWARDS_TIER",

  TRIGGER_GET_REWARDS_TIER: "TRIGGER_GET_REWARDS_TIER"
};

export const LoyaltyActionCreators = {
  setRewardsTier: rewardsTier => ({
    payload: rewardsTier,
    type: LoyaltyActions.SET_REWARDS_TIER
  }),
  triggerGetRewardsTier: () => ({
    payload: async (dispatch, getState, { loyalty: { getRewardsTier } }) => {
      const tier = await getRewardsTier();
      dispatch(LoyaltyActionCreators.setRewardsTier(tier));

      dispatch(
        CommonActionCreators.setMessage(CommonMessages.loyalty.rewardsTier)
      );
    },
    type: LoyaltyActions.TRIGGER_GET_REWARDS_TIER
  })
};
