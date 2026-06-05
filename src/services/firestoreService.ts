import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  BolaoGroup,
  GroupMember,
  Match,
  Prediction,
  User,
  RankingEntry,
} from "../types";
import { WC2026_MATCHES } from "../data/matches";
import { calculateScore } from "../utils/scoring";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const tsToDate = (ts: unknown): Date =>
  ts instanceof Timestamp
    ? ts.toDate()
    : ts instanceof Date
      ? ts
      : new Date(ts as string);

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: Omit<User, "createdAt">): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...user, role: "user", createdAt: serverTimestamp() });
  }
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { ...d, uid: snap.id, createdAt: tsToDate(d.createdAt) } as User;
}

export async function updateDisplayName(
  uid: string,
  displayName: string,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { displayName });
}

export async function setUserRole(
  uid: string,
  role: "admin" | "user",
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(
    (d) =>
      ({
        ...d.data(),
        uid: d.id,
        createdAt: tsToDate(d.data().createdAt),
      }) as User,
  );
}

// ─── Groups ───────────────────────────────────────────────────────────────────
export async function createGroup(
  data: Omit<BolaoGroup, "id" | "memberCount" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "groups"), {
    ...data,
    memberCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGroup(
  id: string,
  data: Partial<BolaoGroup>,
): Promise<void> {
  await updateDoc(doc(db, "groups", id), data);
}

export async function deleteGroup(id: string): Promise<void> {
  // Delete all members subcollection entries first
  const membersSnap = await getDocs(collection(db, "groups", id, "members"));
  const batch = writeBatch(db);
  membersSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "groups", id));
  await batch.commit();
}

export async function getGroups(): Promise<BolaoGroup[]> {
  const snap = await getDocs(
    query(collection(db, "groups"), orderBy("createdAt", "desc")),
  );
  return snap.docs.map(
    (d) =>
      ({
        ...d.data(),
        id: d.id,
        createdAt: tsToDate(d.data().createdAt),
      }) as BolaoGroup,
  );
}

export function subscribeGroups(cb: (groups: BolaoGroup[]) => void) {
  return onSnapshot(
    query(collection(db, "groups"), orderBy("createdAt", "desc")),
    (snap) => {
      cb(
        snap.docs.map(
          (d) =>
            ({
              ...d.data(),
              id: d.id,
              createdAt: tsToDate(d.data().createdAt),
            }) as BolaoGroup,
        ),
      );
    },
  );
}

// ─── Members ─────────────────────────────────────────────────────────────────
export async function joinGroup(groupId: string, user: User): Promise<void> {
  const memberRef = doc(db, "groups", groupId, "members", user.uid);
  const batch = writeBatch(db);
  batch.set(memberRef, {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL || null,
    score: 0,
    joinedAt: serverTimestamp(),
  });
  batch.update(doc(db, "groups", groupId), { memberCount: increment(1) });
  await batch.commit();
}

export async function leaveGroup(groupId: string, uid: string): Promise<void> {
  const memberRef = doc(db, "groups", groupId, "members", uid);
  const batch = writeBatch(db);
  batch.delete(memberRef);
  batch.update(doc(db, "groups", groupId), { memberCount: increment(-1) });
  await batch.commit();

  // Remove predictions for this group
  const predsSnap = await getDocs(
    query(
      collection(db, "predictions"),
      where("groupId", "==", groupId),
      where("userId", "==", uid),
    ),
  );
  const batch2 = writeBatch(db);
  predsSnap.docs.forEach((d) => batch2.delete(d.ref));
  await batch2.commit();
}

export async function isMember(groupId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "groups", groupId, "members", uid));
  return snap.exists();
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const snap = await getDocs(
    query(
      collection(db, "groups", groupId, "members"),
      orderBy("score", "desc"),
    ),
  );
  return snap.docs.map(
    (d) =>
      ({ ...d.data(), joinedAt: tsToDate(d.data().joinedAt) }) as GroupMember,
  );
}

export function subscribeGroupMembers(
  groupId: string,
  cb: (members: GroupMember[]) => void,
) {
  return onSnapshot(
    query(
      collection(db, "groups", groupId, "members"),
      orderBy("score", "desc"),
    ),
    (snap) => {
      cb(
        snap.docs.map(
          (d) =>
            ({
              ...d.data(),
              joinedAt: tsToDate(d.data().joinedAt),
            }) as GroupMember,
        ),
      );
    },
  );
}

// ─── Predictions ──────────────────────────────────────────────────────────────
export async function upsertPrediction(
  prediction: Omit<Prediction, "id">,
): Promise<void> {
  const id = `${prediction.userId}_${prediction.groupId}_${prediction.matchId}`;
  const ref = doc(db, "predictions", id);
  const existing = await getDoc(ref);

  await setDoc(ref, {
    ...prediction,
    submittedAt: existing.exists()
      ? existing.data().submittedAt
      : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserPredictions(
  uid: string,
  groupId: string,
): Promise<Prediction[]> {
  const snap = await getDocs(
    query(
      collection(db, "predictions"),
      where("userId", "==", uid),
      where("groupId", "==", groupId),
    ),
  );
  return snap.docs.map(
    (d) =>
      ({
        ...d.data(),
        id: d.id,
        submittedAt: tsToDate(d.data().submittedAt),
        updatedAt: d.data().updatedAt
          ? tsToDate(d.data().updatedAt)
          : undefined,
      }) as Prediction,
  );
}

export async function getMatchPredictions(
  matchId: string,
  groupId: string,
): Promise<Prediction[]> {
  const snap = await getDocs(
    query(
      collection(db, "predictions"),
      where("matchId", "==", matchId),
      where("groupId", "==", groupId),
    ),
  );
  return snap.docs.map(
    (d) =>
      ({
        ...d.data(),
        id: d.id,
        submittedAt: tsToDate(d.data().submittedAt),
      }) as Prediction,
  );
}

// ─── Matches (Firestore) ──────────────────────────────────────────────────────
/** Seeds matches into Firestore (run once or when schedule changes) */
export async function seedMatches(): Promise<void> {
  const batch = writeBatch(db);
  WC2026_MATCHES.forEach((m) => {
    const ref = doc(db, "matches", m.id);
    batch.set(ref, {
      ...m,
      status: "scheduled",
      homeScore: null,
      awayScore: null,
      startTime: Timestamp.fromDate(m.startTime),
    });
  });
  await batch.commit();
}

export async function getMatches(): Promise<Match[]> {
  const snap = await getDocs(
    query(collection(db, "matches"), orderBy("matchNumber", "asc")),
  );
  return snap.docs.map(
    (d) =>
      ({
        ...d.data(),
        id: d.id,
        startTime: tsToDate(d.data().startTime),
      }) as Match,
  );
}

export function subscribeMatches(cb: (matches: Match[]) => void) {
  return onSnapshot(
    query(collection(db, "matches"), orderBy("matchNumber", "asc")),
    (snap) => {
      cb(
        snap.docs.map(
          (d) =>
            ({
              ...d.data(),
              id: d.id,
              startTime: tsToDate(d.data().startTime),
            }) as Match,
        ),
      );
    },
  );
}

export async function updateMatchScore(
  matchId: string,
  homeScore: number,
  awayScore: number,
  status: "live" | "finished",
): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), {
    homeScore,
    awayScore,
    status,
  });

  if (status === "finished") {
    await recalcGroupScoresForMatch(matchId, homeScore, awayScore);
  }
}

// ─── Score recalculation ──────────────────────────────────────────────────────
export async function recalcGroupScoresForMatch(
  matchId: string,
  actualHome: number,
  actualAway: number,
): Promise<void> {
  const predsSnap = await getDocs(
    query(collection(db, "predictions"), where("matchId", "==", matchId)),
  );

  const byGroup: Record<string, { uid: string; points: number }[]> = {};

  for (const d of predsSnap.docs) {
    const pred = d.data() as Prediction;
    const breakdown = calculateScore(
      pred.homeScore,
      pred.awayScore,
      actualHome,
      actualAway,
    );
    await updateDoc(d.ref, { points: breakdown.points });
    if (!byGroup[pred.groupId]) byGroup[pred.groupId] = [];
    byGroup[pred.groupId].push({ uid: pred.userId, points: breakdown.points });
  }

  // Update member scores per group
  for (const [groupId, entries] of Object.entries(byGroup)) {
    const batch = writeBatch(db);
    for (const { uid, points } of entries) {
      const memberRef = doc(db, "groups", groupId, "members", uid);
      batch.update(memberRef, { score: increment(points) });
    }
    await batch.commit();
  }
}

// ─── Ranking ─────────────────────────────────────────────────────────────────
export async function getRanking(groupId: string): Promise<RankingEntry[]> {
  const members = await getGroupMembers(groupId);
  return members.map((m, i) => ({
    rank: i + 1,
    uid: m.uid,
    displayName: m.displayName,
    photoURL: m.photoURL,
    score: m.score,
    exactScores: 0,
    correctWinners: 0,
  }));
}

// ─── Match team editing ───────────────────────────────────────────────────────
export async function updateMatchTeams(
  matchId: string,
  homeTeam: { code: string; name: string; flagCode: string },
  awayTeam: { code: string; name: string; flagCode: string },
): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), { homeTeam, awayTeam });
}
