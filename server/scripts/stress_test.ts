import { fetch, FormData } from "node-fetch"; // Assuming node-fetch or native fetch
// Since we are in a TS environment without explicit node-fetch dep, we'll try to use native fetch if available (Node 18+)
// or we might need to install it. But let's try to write a script that uses 'http' or just assumes global fetch.

// Actually, to be safe and dependency-free, I'll use 'http' module or just assume 'fetch' is available (Node 18+).
// Given the environment is likely modern, I'll use global fetch.

const BASE_URL = "http://localhost:3000";
const EMAIL = "stress@test.com";
const PASSWORD = "password123";

async function run() {
  console.log("🚀 Starting Stress Test...");

  // 1. Register/Login
  console.log("1️⃣ Authenticating...");
  let token = "";
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data: any = await res.json();
    if (data.accessToken) token = data.accessToken;
    else throw new Error("No token in register");
  } catch (e) {
    // Try login
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data: any = await res.json();
    token = data.accessToken;
  }
  console.log("✅ Authenticated");

  // 2. Check Health
  console.log("2️⃣ Checking System Health...");
  const healthRes = await fetch(`${BASE_URL}/admin/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Health Status:", await healthRes.json());

  // 3. Upload File
  console.log("3️⃣ Uploading File...");
  const formData = new FormData();
  // Create a dummy file
  const fileContent = "This is a test file for RAID storage.";
  const blob = new Blob([fileContent], { type: "text/plain" });
  formData.append("file", blob, "test-raid.txt");

  const uploadRes = await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData: any = await uploadRes.json();
  console.log("Upload Result:", uploadData);
  const fileId = uploadData.id;

  // 4. Trigger Rebuild
  console.log("4️⃣ Triggering Rebuild...");
  const rebuildRes = await fetch(`${BASE_URL}/admin/rebuild`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Rebuild Result:", await rebuildRes.json());

  // 5. Delete File
  console.log("5️⃣ Deleting File...");
  await fetch(`${BASE_URL}/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("✅ File Deleted");

  console.log("🎉 Stress Test Complete!");
}

run().catch(console.error);
