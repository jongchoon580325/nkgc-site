import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            username: string;
            position: string;
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        username: string;
        position: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        username: string;
        position: string;
    }
}
