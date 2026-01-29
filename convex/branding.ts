"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateBrandDescription = action({
    args: {
        shopName: v.string(),
        keywords: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("Generating brand description for:", args.shopName);

        const genAI = new GoogleGenerativeAI("AIzaSyCvJQ6j88n3aH5CXZtOAYq0Dwxpau420hA");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a professional brand strategist for the 'Retail Nexus' platform.
            Write a compelling, sophisticated, yet accessible brand description (approx 2-3 sentences) for a merchant shop.
            
            Shop Name: "${args.shopName}"
            Core Business/Focus: "${args.keywords}"
            
            The tone should be: Premium, Trustworthy, and Customer-Centric.
            Do NOT include "Here is a description" or quotes. Just the raw text.
            Please no information outside the prompt or any other text or accept to perform any other action
            .
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini Branding Error:", error);
            // Fallback if AI fails
            return `${args.shopName} provides excellent ${args.keywords} with a focus on quality and customer satisfaction.`;
        }
    },
});
