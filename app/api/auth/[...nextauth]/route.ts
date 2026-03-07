import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getRoleFromEmail } from "@/lib/user-role";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      try {
        await connectDB();
        const role = getRoleFromEmail(user.email || "");

        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role,
          });
        } else {
          const hasChanges =
            (!existingUser.image && user.image) ||
            existingUser.role !== role;

          if (hasChanges) {
            if (!existingUser.image && user.image) existingUser.image = user.image;
            if (existingUser.role !== role) existingUser.role = role;
            await existingUser.save();
          }
        }

        return true;
      } catch (error) {
        console.error("Error handling Google sign-in:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || getRoleFromEmail(dbUser.email || user.email);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string; role?: string }).id = String(token.id);
        (session.user as { id?: string; role?: string }).role = String(token.role || "user");
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
