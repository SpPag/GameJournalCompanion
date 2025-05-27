import "next-auth"; //  This imports the types and modules from the next-auth package so that TypeScript knows how to extend (augment) them. I'm not importing NextAuth for use in the code. It just ensures the type definitions are loaded.

declare module "next-auth" { //  This begins a TypeScript module augmentation block for next-auth. It allows us to extend the types of Session and User without modifying the original package
  interface Session { // By default, the Session object returned by useSession() or in server-side auth helpers only contains name, email and image. I'm extending it to include id and username
    user: {
      id: string;
      email: string;
      username: string;
      isAdmin: boolean;
    };
  }

  interface User { // simiraly to Session, the default User object that is used in the authorize() callback and session creation contains only id, name, email and image. I'm extending it to include username
    id: string;
    email: string;
    username?: string; // I need to make this optional to avoid a TypeScript error in route.ts. MongoDB-adapter doesn't have a username field, whereas nextAuth does. Note that OAuth providers such as Google don't have a username field, so if I were to allow login with providers other than the Credential Provider, there would simply not be a username field in the returned user object
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" { // This begins a TypeScript module augmentation block for the JWT token. It allows us to extend the types of the JWT token without modifying the original package
  interface JWT { // This is used in the callbacks part of the route.ts file for nextAuth purposes. By default, it contains the email property, among many others, but I'm extending it to include id and username
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
  }
}
