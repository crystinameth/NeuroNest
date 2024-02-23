import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings")                //   http://localhost:3000/settings

export async function GET() {
    try{
        const { userId } = auth();
        const user = await currentUser();

        if(!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userSubscription = await prismadb.userSubscription.findUnique({
            where: {
                userId
            }
        });

        if(userSubscription && userSubscription.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: settingsUrl,
            });

            return new NextResponse(JSON.stringify({ url: stripeSession.url }));
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "Companion Pro",
                            description: "Create Custom AI Companions",
                        },
                        unit_amount: 999,
                        recurring: {
                            interval: "month",
                        }
                    },
                    quantity: 1,
                }
            ],
            metadata: {             //metadata is v imp as , stripe will fireback a webhook to our api , and there we'll read the metadata and store it in our db
                userId
            }
        });

        return new NextResponse(JSON.stringify({ url: stripeSession.url }));

    } catch(error) {
        console.log("[STRIPE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}