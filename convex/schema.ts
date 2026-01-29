import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("vendor"), v.literal("customer")),
    walletBalance: v.number(),
    nexusPoints: v.optional(v.number()),
  }).index("by_clerkId", ["clerkId"]),

  vendors: defineTable({
    ownerId: v.id("users"),
    shopName: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    brandConfig: v.optional(v.object({
      primaryColor: v.string(),
      secondaryColor: v.string(),
    })),
    isApproved: v.boolean(),
    onboardingStatus: v.optional(v.union(v.literal("pending"), v.literal("completed"))),
    loyaltyConfig: v.object({ pointsPerDollar: v.number() }),
  }).index("by_ownerId", ["ownerId"]),

  products: defineTable({
    vendorId: v.id("vendors"),
    supplierId: v.optional(v.id("suppliers")), // Optional to start
    name: v.string(),
    price: v.number(),
    stock: v.number(),
    minStockThreshold: v.number(),
    safetyStockLevel: v.optional(v.number()), // Forecasted safety line
    category: v.string(),
    qualityRating: v.number(),
    images: v.optional(v.array(v.string())),
    buyBackValue: v.optional(v.number()),
    predictedUsageMonths: v.optional(v.number()),
  }).index("by_vendor", ["vendorId"]).index("by_category_price", ["category", "price"]).index("by_supplier", ["supplierId"]),

  orders: defineTable({
    vendorId: v.id("vendors"),
    customerId: v.optional(v.id("users")),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      priceAtSale: v.number()
    })),
    totalAmount: v.number(),
    source: v.union(v.literal("pos"), v.literal("ecommerce")),
    status: v.string(), // "pending", "completed", "dispatched"
    offlineId: v.optional(v.string()),
  }).index("by_vendor", ["vendorId"]),

  bnplOrders: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    totalPrice: v.number(),
    amountPaid: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    planDuration: v.number(), // months
    paymentInterval: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    installmentAmount: v.number(),
    startDate: v.number(),
    nextPaymentDate: v.number(),
  }).index("by_user", ["userId"]),

  loyaltyCards: defineTable({
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    points: v.number(),
    tier: v.optional(v.union(v.literal("gold"), v.literal("silver"), v.literal("bronze"))),
  }).index("by_vendor_user", ["vendorId", "userId"]).index("by_user", ["userId"]),

  productVisits: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  suppliers: defineTable({
    vendorId: v.id("vendors"),
    name: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    leadTimeDays: v.number(),
    reliabilityScore: v.number(),
  }).index("by_vendor", ["vendorId"]),

  purchaseOrders: defineTable({
    vendorId: v.id("vendors"),
    supplierId: v.id("suppliers"),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      expectedPrice: v.number(),
    })),
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("received"), v.literal("cancelled")),
    totalCost: v.number(),
    sentAt: v.optional(v.number()),
    receivedAt: v.optional(v.number()),
  }).index("by_vendor", ["vendorId"]).index("by_status", ["status"]),

  inventoryBatches: defineTable({
    productId: v.id("products"),
    vendorId: v.id("vendors"),
    batchId: v.string(),
    expiryDate: v.number(),
    initialQuantity: v.number(),
    remainingQuantity: v.number(),
    receivedAt: v.number(),
  }).index("by_product", ["productId"]).index("by_vendor_expiry", ["vendorId", "expiryDate"]),

  carts: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  }).index("by_user", ["userId"]),

  marketIntelligence: defineTable({
    productId: v.id("products"),
    vendorId: v.id("vendors"),
    matches: v.array(v.object({
      competitorName: v.string(),
      sourceUrl: v.string(),
      price: v.number(),
      currency: v.string(),
      matchConfidence: v.number(),
      reasoning: v.string(),
      differenceFound: v.optional(v.string()),
    })),
    marketSummary: v.object({
      lowestCompetitorPrice: v.number(),
      priceDifferencePercentage: v.number(),
    }),
    lastUpdated: v.number(),
  }).index("by_product", ["productId"]).index("by_vendor", ["vendorId"]),

  wishlist: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
  }).index("by_user", ["userId"]).index("by_user_product", ["userId", "productId"]),
});
