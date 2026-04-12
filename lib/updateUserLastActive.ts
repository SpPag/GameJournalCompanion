import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";

function getStartOfUtcDay(date = new Date()) {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
}

export async function updateUserLastActive(userId: string) {
    try {
        await dbConnect();

        const todayUtc = getStartOfUtcDay();

        await User.findOneAndUpdate(
            {
                _id: userId,
                $or: [
                    { lastActive: { $lt: todayUtc } },
                    { lastActive: { $exists: false } }
                ]
            },
            {
                $set: { lastActive: todayUtc }
            }
        );
    } catch (error) {
        // Never break main logic because of this
        console.error("Failed to update lastActive:", error);
    }
}