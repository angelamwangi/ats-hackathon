import { openDB, IDBPDatabase } from 'idb';

export interface LocalProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    vendorId: string;
}

export interface LocalOrder {
    id: string;
    vendorId: string;
    items: {
        productId: string;
        quantity: number;
        priceAtSale: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'synced';
    createdAt: number;
}

class LocalDatabase {
    private dbName = 'retail_nexus_pos';
    private dbVersion = 1;

    private async getDB(): Promise<IDBPDatabase> {
        return openDB(this.dbName, this.dbVersion, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: '_id' });
                }
                if (!db.objectStoreNames.contains('orders')) {
                    db.createObjectStore('orders', { keyPath: 'id' });
                }
            },
        });
    }

    async getAllProducts(): Promise<LocalProduct[]> {
        const db = await this.getDB();
        return db.getAll('products');
    }

    async syncProducts(products: LocalProduct[]) {
        const db = await this.getDB();
        const tx = db.transaction('products', 'readwrite');
        await tx.store.clear();
        for (const product of products) {
            await tx.store.put(product);
        }
        await tx.done;
    }

    async saveOrder(order: LocalOrder) {
        const db = await this.getDB();
        await db.put('orders', order);
    }

    async getPendingOrders(): Promise<LocalOrder[]> {
        const db = await this.getDB();
        const allOrders = await db.getAll('orders');
        return (allOrders as LocalOrder[]).filter(o => o.status === 'pending');
    }

    async markAsSynced(orderId: string) {
        const db = await this.getDB();
        const order = await db.get('orders', orderId);
        if (order) {
            order.status = 'synced';
            await db.put('orders', order);
        }
    }
}

export const localDB = new LocalDatabase();
