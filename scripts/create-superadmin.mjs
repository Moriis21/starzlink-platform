import { createClient } from "@insforge/sdk";

const insforge = createClient({
  baseUrl: "https://8qn72bza.us-east.insforge.app",
  anonKey: "ik_6d6c0108a931deb33707cad6a802a9ed",
});

const EMAIL = "morrisldorleyjr21@gmail.com";
const PASSWORD = "Mathematics@2026";
const FULL_NAME = "Morris L. Dorley Jr";

async function createSuperAdmin() {
  console.log("Creating super admin account...");

  // Step 1: Sign up
  const { data: signupData, error: signupError } = await insforge.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    name: FULL_NAME,
  });

  if (signupError && !signupError.message?.includes("already")) {
    console.error("Signup error:", signupError.message);
    // Try to proceed — user may already exist
  } else if (signupData?.user) {
    console.log("✓ Account created:", signupData.user.id);
  } else {
    console.log("Account may already exist, proceeding...");
  }

  // Step 2: Sign in to get the user ID
  const { data: loginData, error: loginError } = await insforge.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (loginError) {
    console.error("Login error:", loginError.message);
    process.exit(1);
  }

  const userId = loginData?.user?.id;
  console.log("✓ Logged in. User ID:", userId);

  if (!userId) {
    console.error("Could not get user ID");
    process.exit(1);
  }

  // Step 3: Upsert profile with super_admin role
  const { data: profileData, error: profileError } = await insforge.database
    .from("profiles")
    .upsert([{
      id: userId,
      full_name: FULL_NAME,
      role: "super_admin",
      user_type: "professional",
    }], { onConflict: "id" })
    .select();

  if (profileError) {
    console.error("Profile error:", profileError.message);
    process.exit(1);
  }

  console.log("✓ Profile set to super_admin");
  console.log("");
  console.log("===================================");
  console.log("Super Admin Created Successfully!");
  console.log("===================================");
  console.log("Email:    ", EMAIL);
  console.log("Password: ", PASSWORD);
  console.log("Role:      super_admin");
  console.log("Admin URL: http://localhost:3000/admin");
  console.log("===================================");

  process.exit(0);
}

createSuperAdmin().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
