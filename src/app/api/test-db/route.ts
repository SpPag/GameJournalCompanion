import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";

export async function GET() {
  // 1. Connect
  await dbConnect();

  // 2. Try an operation: get user count (or empty array)
  const count = await User.countDocuments();
  const sample = await User.find().limit(1);

  return NextResponse.json({
    status:  "ok",
    userCount: count,
    sampleUser: sample[0] || null,
  });
}