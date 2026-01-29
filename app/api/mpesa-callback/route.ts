import { NextRequest, NextResponse } from "next/server";

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

            // Send SMS Notifications using Africa's Talking
            try {
                const AT_USERNAME = process.env.AT_USERNAME || "sandbox";
                const AT_API_KEY = process.env.AT_API_KEY;

                if (AT_API_KEY) {
                    const africastalking = require('africastalking')({
                        apiKey: AT_API_KEY,
                        username: AT_USERNAME
                    });
                    const sms = africastalking.SMS;

                    // Send to Buyer
                    const buyerMessage = `Payment Received! confirmed. ${mpesaReceiptNumber} Confirmed. Ksh${amount} paid to Retail Nexus. Date: ${transactionDate}. Thank you!`;
                    await sms.send({
                        to: [phoneNumber],
                        message: buyerMessage,
                        from: process.env.AT_SENDER_ID
                    });
                    console.log("✅ SMS sent to buyer:", phoneNumber);

                    // Send to Vendor (Using a fixed number for now or extracting from somewhere if possible)
                    // Since we don't have the vendor ID link here easily without DB lookup, 
                    // we'll skip or send to a designated notification number if configured
                    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
                    if (adminPhone) {
                        const vendorMessage = `New Payment: ${mpesaReceiptNumber} Received Ksh${amount} from ${phoneNumber}.`;
                        await sms.send({
                            to: [adminPhone],
                            message: vendorMessage,
                            from: process.env.AT_SENDER_ID
                        });
                        console.log("✅ SMS sent to vendor/admin:", adminPhone);
                    }
                } else {
                    console.log("⚠️ Africa's Talking API Key not found, skipping SMS.");
                }
            } catch (smsError) {
                console.error("❌ Error sending SMS:", smsError);
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
