import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const userExists = await User.findOne({ email: user.email });

          if (!userExists) {
            // This saves the Google user to your MongoDB the first time they log in
            await User.create({
              name: user.name,
              email: user.email,
              // No password needed for Google users
            });
          }
          return true; // Allow sign in
        } catch (error) {
          console.log("Error saving Google user:", error);
          return false;
        }
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };