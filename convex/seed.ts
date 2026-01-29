import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // 0. Create a dummy user for the vendor owner
        const userId = await ctx.db.insert("users", {
            clerkId: "demo_user",
            name: "Nexus Admin",
            email: "admin@retailnexus.io",
            role: "admin",
            walletBalance: 1000,
        });

        // 1. Create a dummy vendor
        const vendorId = await ctx.db.insert("vendors", {
            shopName: "Nexus Flagship Store",
            isApproved: true,
            loyaltyConfig: { pointsPerDollar: 10 },
            ownerId: userId
        });

        // 2. Add sample products
        const sampleProducts = [
            {
                name: "Bamboo Toothbrush",
                price: 12,
                stock: 150,
                minStockThreshold: 20,
                category: "Home",
                qualityRating: 9.8,
                images: [
                    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800",
                    "https://images.unsplash.com/photo-1591336395447-068307ba892c?w=800",
                    "https://images.unsplash.com/photo-1606103653951-e3f538356942?w=800",
                    "https://images.unsplash.com/photo-1559591937-e620abc27545?w=800"
                ],
                vendorId
            },
            {
                name: "Eco-Friendly Water Bottle",
                price: 25,
                stock: 80,
                minStockThreshold: 10,
                category: "Home",
                qualityRating: 9.5,
                images: [
                    "https://images.unsplash.com/photo-1602143307185-84e6985ff275?w=800",
                    "https://images.unsplash.com/photo-1610816912165-f938c037f54c?w=800",
                    "https://images.unsplash.com/photo-1523362628742-0c29aafd4c7e?w=800",
                    "https://images.unsplash.com/photo-1544003314-e13f4f8102d1?w=800"
                ],
                vendorId
            },
            {
                name: "Organic Cotton T-Shirt",
                price: 35,
                stock: 45,
                minStockThreshold: 5,
                category: "Fashion",
                qualityRating: 9.2,
                images: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
                    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800",
                    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"
                ],
                vendorId
            },
            {
                name: "Recycled Plastic Sneakers",
                price: 120,
                stock: 20,
                minStockThreshold: 3,
                category: "Fashion",
                qualityRating: 8.9,
                images: [
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
                    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800"
                ],
                vendorId
            },
            {
                name: "Smart Watch X1",
                price: 299,
                stock: 15,
                minStockThreshold: 2,
                category: "Electronics",
                qualityRating: 9.9,
                images: [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
                    "https://images.unsplash.com/photo-1508685096489-7aac29bbbd9a?w=800",
                    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
                    "https://images.unsplash.com/photo-1544117518-30df57809ca7?w=800"
                ],
                vendorId
            }
        ];

        for (const product of sampleProducts) {
            await ctx.db.insert("products", product);
        }

        return "Seeded 5 products and 1 vendor!";
    }
});
