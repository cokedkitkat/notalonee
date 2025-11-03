// lib/firestoreHelpers.ts
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Deterministic 1:1 chat id so (A,B) and (B,A) map to same chat.
 * Example: getChatId("uid2","uid10") => "uid10_uid2" (sorted)
 */
export function getChatId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("_");
}

/**
 * Create a chat doc if it doesn't exist. Returns chatId.
 * botPersonality is optional (string like 'funny') and stored on the chat for convenience.
 */
export async function createOrGetChat(
  uidA: string,
  uidB: string,
  botPersonality?: string | null,
  botProfile?: { name?: string; avatar?: string; status?: string } | null
): Promise<string> {
  const chatId = [uidA, uidB].sort().join("_");
  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      id: chatId,
      participants: [uidA, uidB],
      botPersonality: botPersonality || null,
      botProfile: botProfile || null,
      lastMessage: "",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  return chatId;
}


/**
 * Add a message to chats/{chatId}/messages and update parent chat lastMessage + updatedAt.
 * Adds `participants` + `readBy` for unread tracking.
 */
export async function addMessageToChat(
  chatId: string,
  senderUid: string,
  text: string
) {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error("Chat not found");
  }

  const chatData = chatSnap.data() as any;
  const participants: string[] = chatData.participants || [];

  const messagesCol = collection(chatRef, "messages");
  const msgRef = await addDoc(messagesCol, {
    senderUid,
    text,
    timestamp: serverTimestamp(),
    participants,
    readBy: [senderUid], // sender has already "read" their own message
  });

  await updateDoc(chatRef, {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });

  return msgRef.id;
}


/**
 * Get the other participant UID in a 1:1 chat
 */
export async function getOtherParticipantUid(chatId: string, myUid: string) {
  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  const participants: string[] = data.participants || [];
  return participants.find((p) => p !== myUid) || null;
}

/**
 * (Optional) List chats for a given user (ordered by updatedAt desc).
 * Useful for /chats/index.tsx UI.
 */
export async function listChatsForUser(uid: string, limitNum = 50) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
