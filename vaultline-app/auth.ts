import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./src/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user repo" } },
    }),
    Credentials({
      credentials:{
        email:{},
        password:{},
      },

      authorize : async (Credentials) => {
        const email = Credentials?.email as string|undefined;
        const password = Credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await (prisma as any).user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password,user.password);
        if (!valid) return null;

        return {id:user.id, email:user.email, name: user.name};
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages:{
    signIn:"/login",
  },
  callbacks: {

    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as typeof session & { accessToken?: string }).accessToken =
          token.accessToken as string;
      }
      return session;
    },
  },
});