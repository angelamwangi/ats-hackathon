import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));

        // M-Pesa sends the result in Body.stkCallback
        const { Body } = body;

        if (!Body || !Body.stkCallback) {
            return NextResponse.json(
                { error: "Invalid callback format" },
                { status: 400 }
            );
        }

        const { stkCallback } = Body;
        const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

        // ResultCode 0 = success, anything else = failure
        if (ResultCode === 0) {
            // Payment successful
            console.log("✅ Payment successful:", CheckoutRequestID);

            // Extract payment details from CallbackMetadata
            let amount = 0;
            let mpesaReceiptNumber = "";
            let phoneNumber = "";
            let transactionDate = "";

            if (CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach((item: any) => {
                    switch (item.Name) {
                        case "Amount":
                            amount = item.Value;
                            break;
                        case "MpesaReceiptNumber":
                            mpesaReceiptNumber = item.Value;
                            break;
                        case "PhoneNumber":
                            phoneNumber = item.Value;
                            break;
                        case "TransactionDate":
                            transactionDate = item.Value;
                            break;
                    }
                });
            }

            console.log("Payment details:", {
                amount,
                mpesaReceiptNumber,
                phoneNumber,
                transactionDate,
                checkoutRequestID: CheckoutRequestID
            });

            // Call Convex mutation to handle the payment callback
            try {
                const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
                if (convexUrl) {
                    // We'll trigger the Convex mutation via HTTP API
                    // This requires the deployment URL and proper auth
                    // For now, we're logging - you may want to enhance this
                    console.log("Ready to update Convex with payment data");

                    // Alternative: Store in a temporary table or use webhooks
                    // The POS system can poll for payment confirmation
                }
            } catch (error) {
                console.error("Error calling Convex:", error);
            }

            // Send SMS Notifications using Africa's Talking via Convex
            try {
                const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
                if (convexUrl) {
                    const httpClient = new ConvexHttpClient(convexUrl);

                    // Send to Buyer
                    const buyerMessage = `Payment Received! confirmed. ${mpesaReceiptNumber} Confirmed. Ksh${amount} paid to Retail Nexus. Date: ${transactionDate}. Thank you!`;
                    await httpClient.action(api.notifications.sendSMS, {
                        to: [phoneNumber],
                        message: buyerMessage
                    });
                    console.log("✅ SMS action triggered for buyer:", phoneNumber);

                    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
                    if (adminPhone) {
                        const vendorMessage = `New Payment: ${mpesaReceiptNumber} Received Ksh${amount} from ${phoneNumber}.`;
                        await httpClient.action(api.notifications.sendSMS, {
                            to: [adminPhone],
                            message: vendorMessage
                        });
                        console.log("✅ SMS action triggered for vendor/admin:", adminPhone);
                    }
                } else {
                    console.log("⚠️ Convex URL not found, skipping SMS action.");
                }
            } catch (smsError) {
                console.error("❌ Error triggering SMS action:", smsError);
            }

            return NextResponse.json({
                ResultCode: 0,
                ResultDesc: "Callback processed successfully"
            });
        } else {
            // Payment failed or cancelled
            console.log("❌ Payment failed:", ResultDesc);

            return NextResponse.json({
                ResultCode: 1,
                ResultDesc: "Payment failed or cancelled"
            });
        }
    } catch (error) {
        console.error("Error processing M-Pesa callback:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Handle GET requests (for testing)
export async function GET() {
    return NextResponse.json({
        message: "M-Pesa callback endpoint is active",
        endpoint: "/api/mpesa-callback",
        method: "POST"
    });
}
