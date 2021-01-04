import * as functions from "firebase-functions";
import admin, { db } from "../config/fbConfig";

import { getGithubUsername } from "../utils";
import { User } from "../types";

// cloud function to create user profile upon signin for the first time
export const createUser = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  const payload: User = {
    name: user.displayName || null,
    email: user.email || null,
    roles: ["user"],
    uid: user.uid
  };
  // If provider is GitHub, and user has no public name, use username for name
  if (user.providerData[0].providerId === "github.com" && !user.displayName) {
    payload.name = await getGithubUsername(user.providerData[0].uid);
  }
  return await db
    .collection("users")
    .doc(user.uid)
    .set(payload);
});

// cloud function to delete user metadata on auth delete
export const deleteUser = functions.auth.user().onDelete(async (user: any) => {
  return await db
    .collection("users")
    .doc(user.uid)
    .delete();
});