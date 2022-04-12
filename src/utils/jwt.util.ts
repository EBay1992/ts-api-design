import jwt, { decode } from "jsonwebtoken";
import config from "config";

const publicKey = config.get<string>("accessTokenPublicKey");
const privateKey = config.get<string>("accessTokenPrivateKey");

export const signJwt = (
  object: Object,
  options?: jwt.SignOptions | undefined
) => {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, publicKey);

    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    return {
      valid: false,
      expired: "jwt expired" == e.message,
      decoded: null,
    };
  }
};
