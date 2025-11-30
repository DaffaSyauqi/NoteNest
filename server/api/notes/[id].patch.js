import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const id = await getRouterParam(event, "id");
    const cookies = parseCookies(event);
    const token = cookies.JWTtoken;

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized to update",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const noteTryingToUpdate = await prisma.note.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!noteTryingToUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found",
      });
    }

    if (noteTryingToUpdate.userId !== decodedToken.id) {
      throw createError({
        statusCode: 403,
        statusMessage: "You are not authorized to update this note",
      });
    }

    await prisma.note.update({
      where: {
        id: Number(id),
      },
      data: {
        text: body.updatedNote,
      },
    });
  } catch (error) {
    console.error("Error reading body:", error);
  }
});
