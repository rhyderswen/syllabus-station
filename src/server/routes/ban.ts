import express from "express";

import { prismaGlobal } from "~/sharedDb";

let router = express.Router();

router.patch("/ban", async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized.");
  }

  try {
    const user = await prismaGlobal.user.findUnique({
      where: {
        id: (req.user as any).netId,
      },
    });

    if (!user || !user.isAdmin) {
      return res.status(401).send("Unauthorized.");
    }

    await prismaGlobal.user.update({
      where: {
        id: req.query.bannedUser as string,
      },

      data: {
        isBanned: true,
      },
    });

    res.send("User successfully banned.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

export default router;
