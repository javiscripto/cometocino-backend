const LoyaltyAccount = require("../models/loyalty-account.model");
const { normalizePhone } = require("../utils/phone");

const PURCHASES_REQUIRED_FOR_REWARD = 5;

async function recordCompletedPurchase(phone, session) {
  const phoneNormalized = normalizePhone(phone);
  if (!phoneNormalized) return null;

  let account = await LoyaltyAccount.findOne({ phoneNormalized }).session(session);
  if (!account) {
    account = new LoyaltyAccount({ phoneNormalized });
  }

  account.totalCompletedPurchases = (account.totalCompletedPurchases || 0) + 1;
  if (!account.rewardAvailable) {
    account.completedPurchases = (account.completedPurchases || 0) + 1;
    if (account.completedPurchases >= PURCHASES_REQUIRED_FOR_REWARD) {
      account.completedPurchases = PURCHASES_REQUIRED_FOR_REWARD;
      account.rewardAvailable = true;
    }
  }

  await account.save({ session });
  return account;
}

async function getProgress(phone) {
  const phoneNormalized = normalizePhone(phone);
  if (!phoneNormalized) {
    return {
      completedPurchases: 0,
      totalCompletedPurchases: 0,
      purchasesUntilReward: PURCHASES_REQUIRED_FOR_REWARD,
      nextPurchaseHasGift: false,
    };
  }

  const account = await LoyaltyAccount.findOne({ phoneNormalized });
  const completedPurchases = account?.completedPurchases || 0;
  const nextPurchaseHasGift = Boolean(account?.rewardAvailable);

  return {
    completedPurchases,
    totalCompletedPurchases: account?.totalCompletedPurchases || 0,
    purchasesUntilReward: nextPurchaseHasGift
      ? 0
      : Math.max(0, PURCHASES_REQUIRED_FOR_REWARD - completedPurchases),
    nextPurchaseHasGift,
  };
}

module.exports = { recordCompletedPurchase, getProgress };
