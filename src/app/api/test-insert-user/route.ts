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
  } catch (error: unknown) { // originally error was of type any, but after installing ESlint and letting it use the recommended rules for TypeScript, it threw an error regarding that 'any'. So I changed it to unknown. The check below checks if the error is of type Error and if it is, it returns the error message. Otherwise, it returns a generic error message
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    else {
      return NextResponse.json({ success: false, error: "An unknown error occurred" });
    }
  }
}
