"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
    ShoppingCart,
    ShoppingBag,
    Search,
    Filter,
    Star,
    TrendingUp,
    Wallet,
    ArrowRight,
    ShieldCheck,
    Zap,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export default function MarketplacePage() {
    const { user, isLoaded } = useUser();
    const containerRef = useRef(null);
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const products = useQuery(api.products.getProducts, {}) || [];
    const loyaltyCards = useQuery(api.loyalty.getUserLoyaltyCards, currentUser ? { userId: currentUser._id } : "skip");
    const cartItems = useQuery(api.cart.getCart, currentUser ? { userId: currentUser._id } : "skip") || [];

    const [category, setCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);

    const wishlist = useQuery(api.wishlist.getWishlist, currentUser ? { userId: currentUser._id } : "skip") || [];
    const toggleWishlist = useMutation(api.wishlist.toggleWishlist);

    // Fetch active BNPL plans to check status
    const allBnplPlans = useQuery(api.bnpl.getMyPlans, currentUser ? { userId: currentUser._id } : "skip") || [];
    const activeBnplProductIds = new Set(
        allBnplPlans
            .filter((p: any) => p.status === "active")
            .map((p: any) => p.productId)
    );

    const initiateMpesa = useAction(api.payments.initiateMpesaStkPush);
    const [isPaying, setIsPaying] = useState(false);

    const totalPoints = loyaltyCards?.reduce((acc: number, card: any) => acc + card.points, 0) || 0;
    const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const totalAmount = cartItems.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);

    const checkout = useMutation(api.orders.checkout);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        if (!currentUser) return;

        const phone = prompt("Enter your M-Pesa number (e.g. 254712345678):");
        if (!phone) return;

        setIsPaying(true);
        try {
            const res = await initiateMpesa({ phoneNumber: phone, amount: totalAmount });
            if (res.ResponseCode === "0") {
                await checkout({
                    userId: currentUser._id,
                    paymentMethod: "mpesa",
                    phoneNumber: phone
                });
                alert("STK Push sent to your phone! Order placed successfully.");
                setIsCartOpen(false);
            } else {
                alert("Failed to initiate payment. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during payment.");
        } finally {
            setIsPaying(false);
        }
    };

    useEffect(() => {
        if (!products || products.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".product-card",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: "power3.out",
                    overwrite: "auto"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [products]);

    const categories = ["All", "Electronics", "Fashion", "Home", "Groceries"];

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12 relative">
            {/* Real-time Header Sync */}
            <header className="mb-12 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h2 className="text-5xl font-black tracking-tight mb-2 uppercase">MARKETPLACE</h2>
                        <div className="flex items-center gap-4">
                            {currentUser && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                    <Zap className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{totalPoints} Nexus Points</span>
                                </div>
                            )}
                            <p className="text-white text-xs font-medium">Verify. Compare. Acquire.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search the Nexus..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4 pl-14 pr-8 text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
                            />
                        </div>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all group"
                        >
                            <ShoppingCart className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-bounce-slow">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Product Grid */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-64 shrink-0 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-white tracking-widest mb-4">Categories</h4>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={cn(
                                        "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                        category === cat ? "bg-white text-black" : "text-white hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl">
                        <ShieldCheck className="w-6 h-6 text-primary mb-4" />
                        <h4 className="font-bold text-sm mb-2 text-primary">NEXUS VERIFIED</h4>
                        <p className="text-xs text-white leading-relaxed">
                            All vendors on Retail Nexus are vetted for quality and price transparency.
                        </p>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-sm font-bold text-white">
                            {products.filter((p: any) =>
                                (category === "All" || p.category === category) &&
                                (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).length} Products Found
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Sort by:</span>
                            <select className="bg-transparent text-xs font-bold focus:outline-none">
                                <option>Recommended</option>
                                <option>Price: Low to High</option>
                                <option>Quality Score</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products === undefined ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-96 bg-white/5 rounded-[32px] animate-pulse" />
                            ))
                        ) : products.length === 0 ? (
                            <div className="lg:col-span-3 py-20 text-center text-white">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">No products in the Nexus yet</p>
                            </div>
                        ) : (
                            (() => {
                                const filtered = products.filter((p: any) =>
                                    (category === "All" || p.category === category) &&
                                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                );

                                if (filtered.length === 0) {
                                    return (
                                        <div className="lg:col-span-3 py-20 text-center text-white">
                                            <p className="text-sm font-bold uppercase tracking-widest">No matches found</p>
                                        </div>
                                    );
                                }

                                return filtered.map((product: any) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        userId={currentUser?._id}
                                        openCart={() => setIsCartOpen(true)}
                                        isWishlisted={wishlist.includes(product._id)}
                                        onToggleWishlist={() => toggleWishlist({ userId: currentUser!._id, productId: product._id })}
                                        isInBnpl={activeBnplProductIds.has(product._id)}
                                    />
                                ));
                            })()
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Drawer Overlay */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full p-8 flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-3xl font-black uppercase tracking-tight">Your <span className="text-primary italic">Cart</span></h3>
                            <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                <Zap className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center opacity-20">
                                    <ShoppingBag className="w-16 h-16 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Nexus is Empty</p>
                                </div>
                            ) : (
                                cartItems.map((item: any) => (
                                    <CartItem key={item._id} item={item} />
                                ))
                            )}
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/10 space-y-6">
                            <div className="flex justify-between items-end">
                                <p className="text-xs font-black uppercase tracking-widest text-white">Total Acquisition</p>
                                <p className="text-4xl font-black">${totalAmount.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0 || isPaying}
                                className="w-full py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isPaying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        AWAITING PIN...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" /> Proceed to M-Pesa Checkout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useMutation } from "convex/react";

function CartItem({ item }: { item: any }) {
    const updateQuantity = useMutation(api.cart.updateQuantity);
    const removeItem = useMutation(api.cart.removeFromCart);

    return (
        <div className="flex gap-4 p-4 bg-white/[0.03] rounded-3xl border border-white/5 group">
            <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden shrink-0">
                <img src={item.product?.images?.[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm uppercase truncate max-w-[150px]">{item.product?.name}</h4>
                    <button onClick={() => removeItem({ cartId: item._id })} className="text-[10px] font-bold text-white hover:text-red-500 transition-colors uppercase">Remove</button>
                </div>
                <p className="text-xl font-black mb-2">${item.product?.price}</p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => updateQuantity({ cartId: item._id, quantity: item.quantity - 1 })}
                        className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs hover:bg-white/10 transition-all font-black"
                    >
                        -
                    </button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity({ cartId: item._id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs hover:bg-white/10 transition-all font-black"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProductCard({
    product,
    userId,
    openCart,
    isWishlisted,
    onToggleWishlist,
    isInBnpl
}: {
    product: any;
    userId: any;
    openCart: () => void;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
    isInBnpl: boolean;
}) {
    const addToCart = useMutation(api.cart.addToCart);
    const createPlan = useMutation(api.bnpl.createPlan);
    const [loading, setLoading] = useState(false);
    const [savingToBuy, setSavingToBuy] = useState(false);
    const { user } = useUser();
    const valueScore = ((product.qualityRating / product.price) * 100).toFixed(1);

    const handleAddToCart = async () => {
        if (!userId) {
            window.location.href = "/sign-in?role=customer";
            return;
        }
        setLoading(true);
        try {
            await addToCart({ userId, productId: product._id, quantity: 1 });
            openCart();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToBuy = async () => {
        if (!userId) return;
        setSavingToBuy(true);
        try {
            await createPlan({
                userId,
                productId: product._id,
                totalPrice: product.price,
                planDuration: 3, // Default 3 months
                paymentInterval: "weekly",
                installmentAmount: Math.ceil(product.price / 12),
                startDate: Date.now(),
            });
            alert("Added to Save-to-Buy!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSavingToBuy(false);
        }
    };

    return (
        <div className="product-card group bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden flex flex-col hover:border-white/20 transition-all">
            <Link href={`/consumer/product/${product._id}`} className="aspect-square bg-white/5 relative block overflow-hidden">
                <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"}
                    alt={product.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (userId) onToggleWishlist();
                    }}
                    className={cn(
                        "absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-20 group/heart",
                        isWishlisted ? "bg-red-500/20 text-red-500" : "bg-black/40 text-white hover:bg-white text-white hover:text-red-500"
                    )}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isWishlisted ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 transition-transform group-active/heart:scale-75"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                </button>

                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-primary border border-primary/20 flex items-center gap-1.5 uppercase z-10">
                    <Star className="w-3 h-3 fill-primary" /> Q-Score: {product.qualityRating}
                </div>
                <div className="absolute bottom-4 right-4 text-xs font-bold text-white bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm z-10">
                    {product.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="p-6 flex-1 flex flex-col">
                <Link href={`/consumer/product/${product._id}`}>
                    <h3 className="font-bold text-xl mb-1 hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs text-white font-bold tracking-widest uppercase mb-4">Vendor: Shop #{product.vendorId?.slice(-4) || "0000"}</p>

                <div className="flex items-center justify-between mt-auto mb-6">
                    <div>
                        <p className="text-[10px] font-black text-white uppercase">Price</p>
                        <p className="text-2xl font-black">${product.price}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white uppercase">Value Score</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm font-bold text-green-500">{valueScore}</span>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <SignedIn>
                        {!userId ? (
                            <Link href="/sign-in?role=customer" className="col-span-2 py-3 bg-primary text-black font-black rounded-2xl text-xs hover:bg-primary/90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2">
                                COMPLETE SETUP TO BUY
                            </Link>
                        ) : (
                            <>
                                <button
                                    disabled={loading}
                                    onClick={handleAddToCart}
                                    className="py-3 bg-white text-black font-black rounded-2xl text-xs hover:bg-white/90 active:scale-95 transition-all outline-none disabled:opacity-50"
                                >
                                    {loading ? "ADDING..." : "ADD TO CART"}
                                </button>
                                <button
                                    onClick={handleSaveToBuy}
                                    disabled={savingToBuy || isInBnpl}
                                    className={cn(
                                        "py-3 font-black rounded-2xl text-[10px] active:scale-95 transition-all outline-none flex items-center justify-center gap-1.5 disabled:opacity-50",
                                        isInBnpl
                                            ? "bg-green-500/20 text-green-500 cursor-not-allowed"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    {savingToBuy ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : isInBnpl ? (
                                        <>
                                            <CheckCircle2 className="w-3 h-3" /> IN BUY PLAN
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-3 h-3" /> SAVE-TO-BUY
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="py-3 bg-white text-black font-black rounded-2xl text-xs hover:bg-white/90 active:scale-95 transition-all outline-none">
                                LOGIN TO BUY
                            </button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <button className="py-3 bg-white/10 text-white font-black rounded-2xl text-xs hover:bg-white/20 active:scale-95 transition-all outline-none flex items-center justify-center gap-1.5">
                                <Wallet className="w-3 h-3" /> LOGIN TO SAVE
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </div>
    );
}

