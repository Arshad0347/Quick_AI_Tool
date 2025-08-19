//Middleware to check userId and premiumPlan
import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error("Authentication middleware not properly configured");
    }

    const { userId, has } = await req.auth();

    if (!userId) {
      throw new Error("User ID not found");
    }

    const hasPremiumPlan = await has({ plan: "premium" });
    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan && user.privateMetadata?.free_usage !== undefined) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};
