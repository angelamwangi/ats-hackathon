/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bnpl from "../bnpl.js";
import type * as bnpl_payments from "../bnpl_payments.js";
import type * as branding from "../branding.js";
import type * as cart from "../cart.js";
import type * as consumerAnalytics from "../consumerAnalytics.js";
import type * as crons from "../crons.js";
import type * as debug from "../debug.js";
import type * as logistics from "../logistics.js";
import type * as loyalty from "../loyalty.js";
import type * as market_actions from "../market_actions.js";
import type * as market_intel from "../market_intel.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as recommendations from "../recommendations.js";
import type * as restock from "../restock.js";
import type * as retention from "../retention.js";
import type * as seed from "../seed.js";
import type * as supplyChain from "../supplyChain.js";
import type * as users from "../users.js";
import type * as vendorAnalytics from "../vendorAnalytics.js";
import type * as vendorDashboard from "../vendorDashboard.js";
import type * as vendorPulse from "../vendorPulse.js";
import type * as vendors from "../vendors.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bnpl: typeof bnpl;
  bnpl_payments: typeof bnpl_payments;
  branding: typeof branding;
  cart: typeof cart;
  consumerAnalytics: typeof consumerAnalytics;
  crons: typeof crons;
  debug: typeof debug;
  logistics: typeof logistics;
  loyalty: typeof loyalty;
  market_actions: typeof market_actions;
  market_intel: typeof market_intel;
  notifications: typeof notifications;
  orders: typeof orders;
  payments: typeof payments;
  products: typeof products;
  recommendations: typeof recommendations;
  restock: typeof restock;
  retention: typeof retention;
  seed: typeof seed;
  supplyChain: typeof supplyChain;
  users: typeof users;
  vendorAnalytics: typeof vendorAnalytics;
  vendorDashboard: typeof vendorDashboard;
  vendorPulse: typeof vendorPulse;
  vendors: typeof vendors;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
