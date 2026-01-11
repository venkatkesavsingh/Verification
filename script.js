import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   FIREBASE CONFIG (SAME AS MAIN)
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCU1TXBS9i9gcgOWniTjop1iUKhFjgs07Q",
  authDomain: "registration-42a25.firebaseapp.com",
  projectId: "registration-42a25",
  storageBucket: "registration-42a25.firebasestorage.app",
  messagingSenderId: "610526207352",
  appId: "1:610526207352:web:957390860bc06b4bd33c8d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===============================
   UI ELEMENTS
=============================== */
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");

/* ===============================
   READ URL PARAMS
=============================== */
const params = new URLSearchParams(window.location.search);
let teamId = params.get("teamId");
let playerId = params.get("playerId");

if (typeof verifyTeamId !== "undefined" && typeof verifyPlayerId !== "undefined") {
  teamId = verifyTeamId;
  playerId = verifyPlayerId;
  console.log("Verification override active:", teamId, playerId);
}

/* ===============================
   VALIDATION
=============================== */
if (!teamId || !playerId) {
  statusEl.innerText = "Invalid Link";
  messageEl.innerText = "Verification link is incorrect.";
  throw new Error("Invalid verification link");
}

/* ===============================
   VERIFY PLAYER
=============================== */
(async () => {
  try {
    const teamRef = doc(db, "teams", teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      statusEl.innerText = "Team Not Found";
      messageEl.innerText = "This team does not exist.";
      return;
    }

    const teamData = teamSnap.data();

    if (!teamData.verificationOpen) {
      statusEl.innerText = "Verification Closed";
      messageEl.innerText = "Verification is no longer allowed.";
      return;
    }

    if (teamData.anyPlayerVerified === true) {
      statusEl.innerText = "Already Verified";
      messageEl.innerText = "This team is already verified.";
      return;
    }


    const playerRef = doc(db, "teams", teamId, "players", playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
      statusEl.innerText = "Player Not Found";
      messageEl.innerText = "This player does not exist.";
      return;
    }

    await updateDoc(playerRef, {
      verified: true,
      verifiedAt: serverTimestamp()
    });

    await updateDoc(teamRef, {
      anyPlayerVerified: true,
      verifiedBy: playerId,          // ✅ WHO verified
      verificationOpen: false,       // ✅ lock verification
      verifiedAt: serverTimestamp()  // ✅ optional but recommended
    });


    statusEl.innerText = "Verified Successfully ✅";
    messageEl.innerText = "You can close this page.";

  } catch (err) {
    console.error(err);
    statusEl.innerText = "Error";
    messageEl.innerText = "Something went wrong.";
  }
})();


