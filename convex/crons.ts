import { cronJobs } from "convex/server";
import { internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// Hourly check for low stock
crons.interval(
    "check-low-stock-and-notify",
    { hours: 1 },
    api.supplyChain.checkAllProductsStock
);

export default crons;
