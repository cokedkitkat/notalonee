// scripts/backfillBotProfiles.ts
import admin from "firebase-admin";
import { readFileSync } from "fs";

// Init Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function backfillBotProfiles() {
  console.log("Starting backfill...");

  const chatsSnap = await db.collection("chats").get();
  let updated = 0;

  for (const chatDoc of chatsSnap.docs) {
    const chatData = chatDoc.data();

    if (chatData.botProfile) continue;

    const participants: string[] = chatData.participants || [];
    if (!participants.length) continue;

    let chosenProfile: { name?: string; avatar?: string; status?: string } | null = null;

    for (const p of participants) {
      const userSnap = await db.collection("users").doc(p).get();
      if (!userSnap.exists) continue;

      const u = userSnap.data() || {};
      if (u.isBot) {
        chosenProfile = {
          name: u.name || "Companion",
          avatar: u.avatar || "/logo.png",
          status: u.status || "online",
        };
        break;
      }
      if (!chosenProfile && (u.name || u.avatar)) {
        chosenProfile = {
          name: u.name || "Companion",
          avatar: u.avatar || "/logo.png",
          status: u.status || "offline",
        };
      }
    }

    if (chosenProfile) {
      await chatDoc.ref.update({
        botProfile: chosenProfile,
      });
      console.log(`✅ Updated chat ${chatDoc.id} with botProfile`);
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} chats.`);
}

backfillBotProfiles().catch((err) => {
  console.error("Error:", err);
});
