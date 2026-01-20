import User from "@/models/User";
import { connectDB } from "../db";
import Admin from "@/models/Admin";
import { AppRole } from "../auth/roles";


export async function createUserFromAuth0(auth0User: any) {
  try {
    await connectDB();

    const auth0Id = auth0User?.sub;
    if (!auth0Id) return null;

    const user = await User.findOneAndUpdate(
      { auth_id: auth0Id },            // filter
      {
        $setOnInsert: {
          auth_id: auth0Id,
          email: auth0User.email ?? null,
          fullName: auth0User.name ?? "",
          picture: auth0User.picture ?? null,
          createdAt: new Date(),
        },
      },
      {
        new: true,     // return the document
        upsert: true,  // create if not exists
      }
    );

    return user;
  } catch (error) {
    console.error("Mongo error creating user:", error);
    return null;
  }
}
export async function createAdminFromAuth0(
  authAdmin: any,
  role: AppRole
) {
  try {
    await connectDB();

    const auth0Id = authAdmin?.sub;
    if (!auth0Id) return null;

    const admin = await Admin.findOneAndUpdate(
      { auth_id: auth0Id },
      {
        $setOnInsert: {
          auth_id: auth0Id,
          email: authAdmin.email ?? null,
          fullName: authAdmin.name ?? "",
          role: role.toUpperCase(),
          passwordHash: "",
          createdAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return admin;
  } catch (error) {
    console.error("Mongo error creating admin:", error);
    return null;
  }
}
