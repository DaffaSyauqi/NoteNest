import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event);
    const token = cookies.JWTtoken;

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized to update",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const newNote = await prisma.note.create({
      data: {
        text: "",
        userId: decodedToken.id,
      },
    });

    return newNote;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
