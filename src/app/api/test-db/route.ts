import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";

export async function GET() {
  // 1. Get session
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  // 2. Connect
  await dbConnect();

  // 3. Find user by email and return forbidden if not valid AND admin
  const dbUser = await User.findOne({ email: session.user.email });

  if (!dbUser || !dbUser.isAdmin) {
    return NextResponse.json({ status: "forbidden" }, { status: 403 });
  }

  // 4. Try an operation: get user count (or empty array)
  const count = await User.countDocuments();
  const users = await User.find();

  return NextResponse.json({
    status: "ok",
    userCount: count,
    users: users,
  });
}