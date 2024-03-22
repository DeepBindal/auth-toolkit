import prisma from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import * as bcrypt from "bcrypt";
import NextAuth from "next-auth/next";

import { use } from "react";
import { Prisma, User } from "@prisma/client";

export const authOptions = {
  pages:{
    signIn : "/auth/signin"
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Your Email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!user) throw new Error("User name or password is not correct");

        // This is Naive Way of Comparing The Passwords
        // const isPassowrdCorrect = credentials?.password === user.password;
        if (!credentials?.password)
          throw new Error("Please Provide Your Password");
        const isPassowrdCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPassowrdCorrect)
          throw new Error("User name or password is not correct");

        if (!user.emailVerified)
          throw new Error("Please verify your email first!");
          
        const { password, ...userWithoutPass } = user;
        return userWithoutPass;
      },
    }),
  ],

  callbacks : {
    async jwt({token, user}){
      if(user) {token.user = user;}
      return token;
    },

    async session({token, session}){
      session.user = token.user;
      return session
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
