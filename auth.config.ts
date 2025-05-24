import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const { email, password } = credentials!;

        const user = await fetchUserByEmail(email);

        if (!user) {
          const newUser = await createNewUser(email, password);
          if (!newUser) {
            return null;
          }
          return newUser;
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }
        return user;
      },
    }),

    // Google Auth
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
