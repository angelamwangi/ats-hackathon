import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("vendor"), v.literal("customer"), v.literal("logistics")),
    walletBalance: v.number(),
    nexusPoints: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()), // For riders
    currentLocation: v.optional(v.object({ lat: v.number(), lng: v.number() })), // For riders
    vehicleType: v.optional(v.string()), // e.g. "Bike", "Van"
    plateNumber: v.optional(v.string()),
    companyName: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]).index("by_role", ["role"]),

  vendors: defineTable({
    ownerId: v.id("users"),
    shopName: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()), // Added for settings page
    brandConfig: v.optional(v.object({
      primaryColor: v.string(),
      secondaryColor: v.string(),
      typography: v.optional(v.string()), // Added for settings page
    })),
    contactInfo: v.optional(v.object({ // Added for settings page
      supportEmail: v.optional(v.string()),
      whatsappNumber: v.optional(v.string()),
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
    source: v.union(v.literal("pos"), v.literal("ecommerce"), v.literal("bnpl")),
    status: v.string(), // "pending", "completed", "dispatched"
    offlineId: v.optional(v.string()),
    mpesaCheckoutId: v.optional(v.string()),
    supplierId: v.optional(v.id("suppliers")),
  }).index("by_vendor", ["vendorId"]).index("by_supplier", ["supplierId"]).index("by_checkoutId", ["mpesaCheckoutId"]),

  payments: defineTable({
    orderId: v.optional(v.id("orders")),
    vendorId: v.id("vendors"),
    amount: v.number(),
    method: v.union(v.literal("cash"), v.literal("mpesa")),
    status: v.union(v.literal("completed"), v.literal("failed"), v.literal("pending")),
    transactionId: v.optional(v.string()), // M-Pesa Receipt Number
    phoneNumber: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_vendor", ["vendorId"]).index("by_order", ["orderId"]).index("by_transactionId", ["transactionId"]),

  deliveries: defineTable({
    orderId: v.id("orders"),
    vendorId: v.id("vendors"),
    riderId: v.optional(v.id("users")),
    supplierId: v.optional(v.id("suppliers")),
    status: v.union(v.literal("pending"), v.literal("assigned"), v.literal("picked_up"), v.literal("in_transit"), v.literal("delivered"), v.literal("cancelled")),
    pickupLocation: v.object({ lat: v.number(), lng: v.number(), address: v.string() }),
    dropoffLocation: v.object({ lat: v.number(), lng: v.number(), address: v.string() }),
    estimatedDuration: v.optional(v.number()), // minutes
    routeCoordinates: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))), // For drawing path
    cost: v.number(),
  }).index("by_vendor", ["vendorId"]).index("by_rider", ["riderId"]).index("by_status", ["status"]).index("by_order", ["orderId"]).index("by_supplier", ["supplierId"]),

  bnplOrders: defineTable({
    userId: v.id("users"),
    vendorId: v.optional(v.id("vendors")),
    productId: v.id("products"),
    totalPrice: v.number(),
    amountPaid: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    planDuration: v.number(), // months
    paymentInterval: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    installmentAmount: v.number(),
    startDate: v.number(),
    nextPaymentDate: v.number(),
  }).index("by_user", ["userId"]).index("by_vendor_status", ["vendorId", "status"]),

  bnplCheckouts: defineTable({
    planId: v.id("bnplOrders"),
    checkoutId: v.string(),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    mpesaReceiptNumber: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_plan", ["planId"]).index("by_checkoutId", ["checkoutId"]),

  loyaltyCards: defineTable({
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    points: v.number(),
    tier: v.optional(v.union(v.literal("gold"), v.literal("silver"), v.literal("bronze"))),
  }).index("by_vendor_user", ["vendorId", "userId"]).index("by_user", ["userId"]),

  productVisits: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    vendorId: v.optional(v.id("vendors")),
    timestamp: v.number(),
  }).index("by_user", ["userId"]).index("by_vendor", ["vendorId"]),

  suppliers: defineTable({
    vendorId: v.id("vendors"),
    name: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    category: v.string(),
    leadTimeDays: v.number(),
    reliabilityScore: v.number(),
    location: v.optional(v.object({ lat: v.number(), lng: v.number(), address: v.string() })),
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
