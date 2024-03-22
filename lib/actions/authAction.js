"use server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { User } from "@prisma/client";

import * as bcrypt from "bcrypt";
import {
  compileActivationTemplate,
  compilePassTemplate,
  sendMail,
} from "../mail";
import { signJwt, verifyJwt } from "../jwt";

export async function registerUser(user) {
  console.log(user);
  const result = await prisma.user.create({
    data: {
      ...user,
      password: await bcrypt.hash(user.password, 10),
    },
  });

  const jwtUserId = signJwt({
    id: result.id,
  });
  const activationUrl = `${process.env.NEXTAUTH_URL}/auth/activation/${jwtUserId}`;

  const body = compileActivationTemplate(user.name, activationUrl);

  await sendMail({ to: user.email, subject: "Activate your account", body });
  return result;
}

export const activateUser = async (jwtUserID) => {
  const payload = verifyJwt(jwtUserID);
  const userId = payload?.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) return "userNotExist";
  if (user.emailVerified) return "alreadyActivated";
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      emailVerified: new Date(),
    },
  });
  return "success";
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  const jwtUserId = signJwt({
    id: user.id,
  });
  if (!user) throw new Error("User does not exist");

  const resetPassUrl = `${process.env.NEXTAUTH_URL}/auth/resetPassword/${jwtUserId}`;

  const body = compilePassTemplate(user.name, resetPassUrl);
  const result = sendMail({
    to: user.email,
    subject: "Reset your password",
    body,
  });
  return result;
};

export const resetPassword = async (jwtUserId, password) => {
  const payload = verifyJwt(jwtUserId);
  if (!payload) return "userNotExist";
  const userId = payload.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) return "userNotExist";

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: await bcrypt.hash(password, 10),
    },
  });
  if (result) return "success";
  else throw new Error("Something went wrong!");
};
