// pages/debug.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

export default function DebugPage() {
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((l) => [...l, s]);

  useEffect(() => {
    (async () => {
      push("debug: starting");

      const user = auth.currentUser;
      push("debug: auth.currentUser = " + JSON.stringify(user ? { uid: user.uid, email: user.email } : null));

      if (!user) {
        push("debug: not signed in — sign in first and reload /debug");
        return;
      }

      // show token presence
      try {
        const t = await user.getIdToken(false);
        push("debug: getIdToken ok, length=" + (t ? t.length : 0));
      } catch (e: any) {
        push("debug: getIdToken error: " + String(e));
      }

      // 1) Try query by UID (what rules expect)
      try {
        push("debug: running getDocs by UID (participants array-contains uid) ...");
        const qUid = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const snapUid = await getDocs(qUid);
        push(`debug: getDocs by UID succeeded — docs=${snapUid.size}`);
        if (!snapUid.empty) {
          const d = snapUid.docs[0].data();
          push("debug: sample doc (by UID): " + JSON.stringify(d));
        }
      } catch (e: any) {
        push("debug: getDocs by UID error: " + (e?.message || String(e)));
      }

      // 2) Try query by email (quick check if DB uses emails)
      try {
        push("debug: running getDocs by EMAIL (participants array-contains email) ...");
        const qEmail = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.email || ""),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const snapEmail = await getDocs(qEmail);
        push(`debug: getDocs by EMAIL succeeded — docs=${snapEmail.size}`);
        if (!snapEmail.empty) {
          const d = snapEmail.docs[0].data();
          push("debug: sample doc (by EMAIL): " + JSON.stringify(d));
        }
      } catch (e: any) {
        push("debug: getDocs by EMAIL error: " + (e?.message || String(e)));
      }

      // 3) Optionally fetch an individual chat doc by id you provide (manual test)
      // If you want to test a specific chat id, update chatId variable below:
      const chatId = ""; // <-- paste a chat doc id here if you want
      if (chatId) {
        try {
          push("debug: fetching chat doc " + chatId);
          const ref = doc(db, "chats", chatId);
          const s = await getDoc(ref);
          push("debug: chat doc exists=" + s.exists());
          if (s.exists()) push("debug: chat data: " + JSON.stringify(s.data()));
        } catch (e: any) {
          push("debug: getDoc chat error: " + (e?.message || String(e)));
        }
      }

      push("debug: finished tests");
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <h1 className="text-2xl mb-4">NOT ALONE — Debug</h1>
      <div className="mb-4 text-sm text-gray-400">
        Open console & check results below. Run while signed in.
      </div>
      <div className="bg-gray-900 rounded p-4">
        {log.map((l, i) => (
          <div key={i} className="text-xs py-1 border-b border-gray-800">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
