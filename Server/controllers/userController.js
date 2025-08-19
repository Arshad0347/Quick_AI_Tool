import sql from "../configs/db.js";

{/*-----------------Get User Creations----------------------- */}
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    const creations =
      await sql`SELECT * FROM creations WHERE user_id=${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

{/*-----------------Get Published Creations----------------------- */}
export const getPublishedCreations = async (req, res) => {
  try {
    const creations =
      await sql`SELECT * FROM creations WHERE publish=true ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

{/*-----------------Toggle Like Creation----------------------- */}
export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id=${id}`;
    if (!creation) {
      return res.json({ success: false, message: "No creation found." });
    }
    const currentLikes = creation.likes;
    const userIdStr = userId.toString();

    let updatedLikes;
    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Unliked.";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
    }

    const formattedArray = `{${updatedLikes.json(",")}}`;

    await sql`UPDATE creations SET likes=${formattedArray}::text[] WHERE id=${id}`;
    const creations = res.json({ success: true, creations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
