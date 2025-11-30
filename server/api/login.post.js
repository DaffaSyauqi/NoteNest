import prisma from "~/lib/prisma";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validasi email format
    if (!validator.isEmail(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email address",
      });
    }

    // Validasi password minimal 8 karakter
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

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    // Jika user tidak ditemukan, langsung throw error
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Email or password is incorrect",
      });
    }

    // Cek password yang dimasukkan dengan hash di database
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Password is incorrect",
      });
    }

    // Jika lolos validasi, buat JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // Set cookie token
    setCookie(event, "JWTtoken", token);

    return {
      data: "User logged in successfully",
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
