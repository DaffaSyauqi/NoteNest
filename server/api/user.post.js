import prisma from "~/lib/prisma";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!validator.isEmail(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email address",
      });
    }

    if (
      !validator.isStrongPassword(body.password, {
        minLength: 8,
        minLowercase: 0,
        minUppercase: 0,
        minNumbers: 0,
        minSymbols: 0,
      })
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        salt: salt,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    setCookie(event, "JWTtoken", token);

    return {
      data: "User created successfully",
    };
  } catch (error) {
    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        statusMessage: "Email already exists",
      });
    }

    throw error;
  }
});
