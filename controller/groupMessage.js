import { createGroupMessage } from "../services/groupMessage.js";

export const createMessage = async (data) => {
  try {
    const { id, userId, message, userName } = data;
    const groupMessage = await createGroupMessage(
      id,
      userId,
      message,
      userName
    );
    return groupMessage;
  } catch (error) {
    return error;
  }
};
