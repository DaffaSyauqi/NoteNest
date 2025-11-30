import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event);
    const token = cookies.JWTtoken;

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized to access notes",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const notes = await prisma.note.findMany({
      where: {
        userId: decodedToken.id,
      },
    });

    return notes;
  } catch (error) {
    console.error("Error in API handler:", error);
  }
});
