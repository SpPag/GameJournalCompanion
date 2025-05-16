import { NextResponse } from 'next/server';
import dbConnect from '@/../lib/mongoose';
import { model, models } from 'mongoose';
import { UserSchema } from '@/../lib/models/User';
import type { IUser } from '@/../lib/models/User';

const User = models.User || model<IUser>('User', UserSchema);

export async function GET() {
  await dbConnect();

  try {
    const newUser = await User.create({
      email: 'testuser2@example.com',
      username: 'testuser',
      password: 'securepassword123', // You’ll hash this later in real logic!
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
