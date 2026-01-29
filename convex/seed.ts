import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Hardcoded vendor ID as requested
        const vendorId = "js7frw38nkv63y8snzkd77v6k98029ct" as any;

        console.log(`Seeding products for Vendor ID: ${vendorId}`);

        // 2. Add sample products with appropriate images
        const sampleProducts = [
            // Electronics
            {
                name: "Wireless Noise-Cancelling Headphones",
                price: 24999,
                stock: 35,
                minStockThreshold: 5,
                category: "Electronics",
                qualityRating: 9.6,
                images: [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
                    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
                    "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800"
                ],
                vendorId
            },
            {
                name: "MacBook Pro 14-inch",
                price: 249999,
                stock: 12,
                minStockThreshold: 3,
                category: "Electronics",
                qualityRating: 9.9,
                images: [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
                    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"
                ],
                vendorId
            },
            {
                name: "Smart Watch Series 8",
                price: 45000,
                stock: 28,
                minStockThreshold: 5,
                category: "Electronics",
                qualityRating: 9.4,
                images: [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
                    "https://images.unsplash.com/photo-1508685096489-7aac29bbbd9a?w=800",
                    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800",
                    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"
                ],
                vendorId
            },
            {
                name: "4K Ultra HD Smart TV 55\"",
                price: 65000,
                stock: 18,
                minStockThreshold: 3,
                category: "Electronics",
                qualityRating: 9.2,
                images: [
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
                    "https://images.unsplash.com/photo-1593359863503-f598e1ca29f6?w=800",
                    "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800",
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"
                ],
                vendorId
            },
            // Fashion
            {
                name: "Premium Leather Jacket",
                price: 18500,
                stock: 25,
                minStockThreshold: 5,
                category: "Fashion",
                qualityRating: 9.3,
                images: [
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
                    "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800",
                    "https://images.unsplash.com/photo-1548126032-5c9f327c6f29?w=800",
                    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"
                ],
                vendorId
            },
            {
                name: "Running Sneakers Pro",
                price: 12500,
                stock: 42,
                minStockThreshold: 8,
                category: "Fashion",
                qualityRating: 9.1,
                images: [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
                    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800"
                ],
                vendorId
            },
            {
                name: "Designer Sunglasses",
                price: 15500,
                stock: 30,
                minStockThreshold: 6,
                category: "Fashion",
                qualityRating: 8.9,
                images: [
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
                    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800",
                    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
                    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800"
                ],
                vendorId
            },
            {
                name: "Classic Denim Jeans",
                price: 7500,
                stock: 60,
                minStockThreshold: 12,
                category: "Fashion",
                qualityRating: 8.7,
                images: [
                    "https://images.unsplash.com/photo-1542272454315-7d53b4c8e8c7?w=800",
                    "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800",
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800"
                ],
                vendorId
            },
            // Home
            {
                name: "Ergonomic Office Chair",
                price: 28500,
                stock: 22,
                minStockThreshold: 4,
                category: "Home",
                qualityRating: 9.5,
                images: [
                    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800",
                    "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800",
                    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800",
                    "https://images.unsplash.com/photo-1503602642458-232111445657?w=800"
                ],
                vendorId
            },
            {
                name: "Ceramic Coffee Maker",
                price: 8500,
                stock: 38,
                minStockThreshold: 8,
                category: "Home",
                qualityRating: 8.8,
                images: [
                    "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
                    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"
                ],
                vendorId
            },
            {
                name: "Bamboo Desk Organizer",
                price: 4500,
                stock: 55,
                minStockThreshold: 10,
                category: "Home",
                qualityRating: 9.0,
                images: [
                    "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800",
                    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
                    "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=800",
                    "https://images.unsplash.com/photo-1606103653951-e3f538356942?w=800"
                ],
                vendorId
            },
            {
                name: "LED Desk Lamp",
                price: 5500,
                stock: 48,
                minStockThreshold: 10,
                category: "Home",
                qualityRating: 8.6,
                images: [
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
                    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
                    "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800",
                    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800"
                ],
                vendorId
            },
            // Groceries
            {
                name: "Organic Arabica Coffee Beans 1kg",
                price: 2400,
                stock: 120,
                minStockThreshold: 20,
                category: "Groceries",
                qualityRating: 9.7,
                images: [
                    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
                    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
                    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"
                ],
                vendorId
            },
            {
                name: "Extra Virgin Olive Oil 500ml",
                price: 1800,
                stock: 85,
                minStockThreshold: 15,
                category: "Groceries",
                qualityRating: 9.4,
                images: [
                    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
                    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
                    "https://images.unsplash.com/photo-1608181177806-be7916c9f33b?w=800",
                    "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800"
                ],
                vendorId
            },
            {
                name: "Organic Honey 500g",
                price: 1500,
                stock: 95,
                minStockThreshold: 18,
                category: "Groceries",
                qualityRating: 9.3,
                images: [
                    "https://images.unsplash.com/photo-1587049352846-4a222e784907?w=800",
                    "https://images.unsplash.com/photo-1558642891-54be180ea339?w=800",
                    "https://images.unsplash.com/photo-1471943038693-62b20752ea61?w=800",
                    "https://images.unsplash.com/photo-1600454163894-9d5c47a7f5e1?w=800"
                ],
                vendorId
            }
        ];

        for (const product of sampleProducts) {
            await ctx.db.insert("products", product);
        }

        return "Seeded 15 products for the specified vendor with KSh prices!";
    }
});
