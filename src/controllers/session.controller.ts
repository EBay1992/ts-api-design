import { NextFunction, Request, Response } from "express";
import {
  createSession,
  findSession,
  updateSession,
} from "../services/session.service";
import { validatePassword } from "../services/user.service";
import { signJwt } from "../utils/jwt.util";
import config from "config";

export const createUserSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //* validate the user's session
  const { email, password } = req.body;
  let user = await validatePassword({ email, password });

  if (!user) return res.status(401).send("Invalid email or password");

  //* create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  //* create a access token
  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get<string>("accessTokenTtl") } // 15 minutes,
  );

  //* create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get<string>("refreshTokenTtl") } // 1 years,
  );

  //* create access & refresh token
  return res.json({ accessToken, refreshToken });
};

export const getUserSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.user._id;

  const sessions = await findSession({ user: userId, valid: true });

  return res.send(sessions);
};

export const deleteSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = res.locals.user.session;
  res.locals.user = null;

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({ accessToken: null, refreshToken: null });
};
