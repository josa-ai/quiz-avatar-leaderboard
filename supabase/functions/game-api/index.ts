import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const allowedOrigins = [
  "https://quiz-avatar-leaderboard.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const corsOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-app-token",
  };
}

let _currentCorsHeaders: Record<string, string> = {};

function respond(body: Record<string, unknown>, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ..._currentCorsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

// PBKDF2 password hashing using Web Crypto API
const PBKDF2_ITERATIONS = 600000;

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${toHex(salt.buffer)}:${toHex(hashBuffer)}`;
}

async function verifyPassword(
  password: string,
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (storedHash.startsWith("pbkdf2:")) {
    const [, iterStr, saltHex, expectedHash] = storedHash.split(":");
    const salt = fromHex(saltHex);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: parseInt(iterStr), hash: "SHA-256" },
      keyMaterial,
      256
    );
    return { valid: toHex(hashBuffer) === expectedHash, needsRehash: false };
  }

  // Legacy SHA-256 format: saltHex:hashHex
  const [saltHex, expectedHash] = storedHash.split(":");
  const data = new TextEncoder().encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return { valid: toHex(hashBuffer) === expectedHash, needsRehash: true };
}

// ─── JWT helpers (HMAC-SHA256) ──────────────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signJWT(
  payload: { userId: string; exp: number },
  secret: string
): Promise<string> {
  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  );
  const body = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${header}.${body}`)
  );
  return `${header}.${body}.${base64UrlEncode(new Uint8Array(sig))}`;
}

async function verifyJWT(
  token: string,
  secret: string
): Promise<{ userId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await getHmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(parts[1]))
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

// ─── Rate limiting (in-memory, resets on cold start) ────────────────────────

const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  // GC expired entries
  for (const [k, v] of rateLimitMap) {
    if (v.resetAt <= now) rateLimitMap.delete(k);
  }
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  entry.count++;
  if (entry.count > maxAttempts) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

// ─── Input validation helpers ───────────────────────────────────────────────

function validateString(val: unknown, name: string, maxLen: number): string {
  if (typeof val !== "string") throw new Error(`${name} must be a string`);
  const trimmed = val.trim();
  if (trimmed.length === 0) throw new Error(`${name} is required`);
  if (trimmed.length > maxLen) throw new Error(`${name} exceeds max length of ${maxLen}`);
  return trimmed;
}

function validateEmail(val: unknown): string {
  const email = validateString(val, "email", 255);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
  return email;
}

function validateChallengeCode(val: unknown): string {
  const code = validateString(val, "challengeCode", 6);
  if (!/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(code.toUpperCase())) {
    throw new Error("Invalid challenge code format");
  }
  return code.toUpperCase();
}

function validateMembers(val: unknown): { id: string; name: string }[] {
  if (!Array.isArray(val)) throw new Error("members must be an array");
  if (val.length > 10) throw new Error("Maximum 10 members allowed");
  return val.map((m, i) => {
    if (!m || typeof m.id !== "string" || typeof m.name !== "string") {
      throw new Error(`Invalid member at index ${i}`);
    }
    return { id: m.id.slice(0, 100), name: m.name.slice(0, 100), avatar: typeof m.avatar === "string" ? m.avatar.slice(0, 500) : "" };
  });
}

function validateRoundResults(val: unknown): { round: number; score: number; details: string }[] {
  if (!Array.isArray(val)) throw new Error("roundResults must be an array");
  if (val.length > 10) throw new Error("Maximum 10 round results allowed");
  return val.map((r, i) => {
    if (!r || typeof r.round !== "number" || typeof r.score !== "number") {
      throw new Error(`Invalid round result at index ${i}`);
    }
    return { round: r.round, score: r.score, details: typeof r.details === "string" ? r.details.slice(0, 500) : "" };
  });
}

function mapUserRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    avatar: row.avatar || "",
    points: row.total_points || 0,
    rank: row.current_rank || 999,
    gamesPlayed: row.games_played || 0,
    wins: row.games_won || 0,
  };
}

Deno.serve(async (req) => {
  _currentCorsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: _currentCorsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, data } = await req.json();

    // ─── Auth guard ────────────────────────────────────────────
    const publicActions = new Set(["login", "register", "getLeaderboard"]);
    let authUserId: string | null = null;

    if (!publicActions.has(action)) {
      const token = req.headers.get("x-app-token") || null;
      if (!token) {
        return respond({ error: "Authentication required" }, 401);
      }
      const claims = await verifyJWT(token, serviceRoleKey);
      if (!claims) {
        return respond({ error: "Invalid or expired token" }, 401);
      }
      authUserId = claims.userId;
    }

    // ─── Rate limiting for login/register ──────────────────────
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (action === "login") {
      const rl = checkRateLimit(`login:${clientIp}`, 10, 15 * 60 * 1000);
      if (!rl.allowed) {
        return respond(
          { error: "Too many login attempts. Please try again later." },
          429,
          { "Retry-After": String(rl.retryAfter) }
        );
      }
    }
    if (action === "register") {
      const rl = checkRateLimit(`register:${clientIp}`, 5, 60 * 60 * 1000);
      if (!rl.allowed) {
        return respond(
          { error: "Too many registration attempts. Please try again later." },
          429,
          { "Retry-After": String(rl.retryAfter) }
        );
      }
    }

    switch (action) {
      // ─── REGISTER ──────────────────────────────────────────────
      case "register": {
        let email: string, username: string, password: string;
        try {
          email = validateEmail(data.email);
          username = validateString(data.username, "username", 50);
          password = validateString(data.password, "password", 128);
          if (password.length < 8) throw new Error("Password must be at least 8 characters");
        } catch (e) {
          return respond({ error: e.message }, 400);
        }
        const avatar = typeof data.avatar === "string" ? data.avatar.slice(0, 500) : "";

        // Check existing user
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .or(`email.eq.${email},username.eq.${username}`)
          .limit(1);

        if (existing && existing.length > 0) {
          return respond({ error: "Email or username already taken" }, 409);
        }

        const passwordHash = await hashPassword(password);
        const { data: newUser, error: insertErr } = await supabase
          .from("users")
          .insert({
            email,
            username,
            password_hash: passwordHash,
            avatar,
          })
          .select()
          .single();

        if (insertErr) {
          return respond({ error: insertErr.message }, 500);
        }

        const regToken = await signJWT(
          { userId: newUser.id as string, exp: Math.floor(Date.now() / 1000) + 86400 },
          serviceRoleKey
        );
        return respond({ user: mapUserRow(newUser), token: regToken });
      }

      // ─── LOGIN ─────────────────────────────────────────────────
      case "login": {
        const email = typeof data.email === "string" ? data.email.trim() : "";
        const password = typeof data.password === "string" ? data.password : "";
        if (!email || !password) {
          return respond({ error: "Email and password are required" }, 400);
        }

        const { data: userRow, error: fetchErr } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (fetchErr || !userRow) {
          return respond({ error: "Invalid email or password" }, 401);
        }

        const { valid, needsRehash } = await verifyPassword(password, userRow.password_hash);
        if (!valid) {
          return respond({ error: "Invalid email or password" }, 401);
        }

        // Transparent migration: rehash legacy passwords with PBKDF2
        if (needsRehash) {
          const newHash = await hashPassword(password);
          await supabase
            .from("users")
            .update({ password_hash: newHash })
            .eq("id", userRow.id);
        }

        const loginToken = await signJWT(
          { userId: userRow.id as string, exp: Math.floor(Date.now() / 1000) + 86400 },
          serviceRoleKey
        );
        return respond({ user: mapUserRow(userRow), token: loginToken });
      }

      // ─── SAVE GAME SESSION ─────────────────────────────────────
      case "saveGameSession": {
        const { gameMode, totalScore, isWinner } = data;
        let validatedResults: { round: number; score: number; details: string }[];
        let validatedMembers: { id: string; name: string }[];
        try {
          validatedResults = data.roundResults ? validateRoundResults(data.roundResults) : [];
          validatedMembers = data.teamMembers ? validateMembers(data.teamMembers) : [];
        } catch (e) {
          return respond({ error: e.message }, 400);
        }

        // Insert game session
        const { error: sessionErr } = await supabase
          .from("game_sessions")
          .insert({
            user_id: authUserId,
            game_mode: gameMode,
            total_score: totalScore,
            round_results: validatedResults,
            is_winner: isWinner,
            team_members: validatedMembers,
          });

        if (sessionErr) {
          return respond({ error: sessionErr.message }, 500);
        }

        // Insert leaderboard entry
        await supabase.from("leaderboard_entries").insert({
          user_id: authUserId,
          score: totalScore,
          period: "all_time",
        });

        // Update user stats
        const { data: currentUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUserId)
          .single();

        if (currentUser) {
          const newPoints = (currentUser.total_points || 0) + totalScore;
          const newGamesPlayed = (currentUser.games_played || 0) + 1;
          const newGamesWon = (currentUser.games_won || 0) + (isWinner ? 1 : 0);

          await supabase
            .from("users")
            .update({
              total_points: newPoints,
              games_played: newGamesPlayed,
              games_won: newGamesWon,
            })
            .eq("id", authUserId);

          const updatedUser = {
            ...currentUser,
            total_points: newPoints,
            games_played: newGamesPlayed,
            games_won: newGamesWon,
          };

          return respond({
            session: { totalScore },
            pointsEarned: totalScore,
            user: mapUserRow(updatedUser),
          });
        }

        return respond({
          session: { totalScore },
          pointsEarned: totalScore,
        });
      }

      // ─── GET LEADERBOARD ───────────────────────────────────────
      case "getLeaderboard": {
        const { period = "all_time", limit = 100 } = data;

        let query = supabase
          .from("leaderboard_entries")
          .select("*, users(id, username, avatar, total_points, games_played, games_won, email)")
          .order("score", { ascending: false })
          .limit(limit);

        if (period === "weekly") {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte("created_at", weekAgo);
        } else if (period === "daily") {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          query = query.gte("created_at", dayAgo);
        }

        const { data: entries, error: leaderErr } = await query;

        if (leaderErr) {
          return respond({ error: leaderErr.message }, 500);
        }

        const leaderboard = (entries || []).map(
          (entry: Record<string, unknown>, index: number) => {
            const user = entry.users as Record<string, unknown> | null;
            return {
              rank: index + 1,
              user: user
                ? {
                    id: user.id,
                    username: user.username,
                    email: user.email || "",
                    avatar: user.avatar || "",
                    points: user.total_points || 0,
                    rank: index + 1,
                    gamesPlayed: user.games_played || 0,
                    wins: user.games_won || 0,
                  }
                : { id: "", username: "Unknown", email: "", avatar: "", points: 0, rank: index + 1, gamesPlayed: 0, wins: 0 },
              score: entry.score,
              date: entry.created_at,
            };
          }
        );

        return respond({ leaderboard });
      }

      // ─── GET USER STATS ────────────────────────────────────────
      case "getUserStats": {
        const { data: userRow } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUserId)
          .single();

        if (!userRow) {
          return respond({ error: "User not found" }, 404);
        }

        const { data: sessions } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("user_id", authUserId)
          .order("created_at", { ascending: false })
          .limit(10);

        const bestScore = (sessions || []).reduce(
          (max: number, s: Record<string, unknown>) =>
            Math.max(max, (s.total_score as number) || 0),
          0
        );

        return respond({
          user: mapUserRow(userRow),
          bestScore,
          recentGames: sessions || [],
        });
      }

      // ─── REDEEM PRIZE ──────────────────────────────────────────
      case "redeemPrize": {
        const { prizeId, prizeName, pointsCost } = data;

        const { data: userRow } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUserId)
          .single();

        if (!userRow) {
          return respond({ error: "User not found" }, 404);
        }

        if ((userRow.total_points || 0) < pointsCost) {
          return respond({ error: "Not enough points" }, 400);
        }

        await supabase.from("prize_redemptions").insert({
          user_id: authUserId,
          prize_id: prizeId,
          prize_name: prizeName,
          points_cost: pointsCost,
        });

        const newPoints = (userRow.total_points || 0) - pointsCost;
        await supabase
          .from("users")
          .update({ total_points: newPoints })
          .eq("id", authUserId);

        return respond({
          user: mapUserRow({ ...userRow, total_points: newPoints }),
        });
      }

      // ─── SAVE PRACTICE PROGRESS ────────────────────────────────
      case "savePracticeProgress": {
        const { subject, questionsAnswered, correctAnswers, timeSpent } = data;

        const { error: practiceErr } = await supabase
          .from("practice_progress")
          .insert({
            user_id: authUserId,
            subject,
            questions_answered: questionsAnswered,
            correct_answers: correctAnswers,
            time_spent: timeSpent,
          });

        if (practiceErr) {
          return respond({ error: practiceErr.message }, 500);
        }

        return respond({ success: true });
      }

      // ─── GET PRACTICE STATS ────────────────────────────────────
      case "getPracticeStats": {
        const { data: progress } = await supabase
          .from("practice_progress")
          .select("*")
          .eq("user_id", authUserId)
          .order("created_at", { ascending: false });

        const records = progress || [];
        const subjectStats: Record<string, { totalQuestions: number; totalCorrect: number; totalTime: number; sessions: number }> = {};

        for (const p of records) {
          const sub = p.subject as string;
          if (!subjectStats[sub]) {
            subjectStats[sub] = { totalQuestions: 0, totalCorrect: 0, totalTime: 0, sessions: 0 };
          }
          subjectStats[sub].totalQuestions += p.questions_answered || 0;
          subjectStats[sub].totalCorrect += p.correct_answers || 0;
          subjectStats[sub].totalTime += p.time_spent || 0;
          subjectStats[sub].sessions += 1;
        }

        return respond({ progress: records, subjectStats });
      }

      // ─── SAVE TEAM ─────────────────────────────────────────────
      case "saveTeam": {
        let teamName: string;
        let validatedMembers: { id: string; name: string }[];
        try {
          teamName = validateString(data.teamName, "teamName", 100);
          validatedMembers = data.members ? validateMembers(data.members) : [];
        } catch (e) {
          return respond({ error: e.message }, 400);
        }

        // Max 5 teams per user
        const { data: existingTeams } = await supabase
          .from("teams")
          .select("id")
          .eq("owner_id", authUserId);

        if (existingTeams && existingTeams.length >= 5) {
          return respond({ error: "Maximum 5 saved teams allowed" }, 400);
        }

        const { data: team, error: teamErr } = await supabase
          .from("teams")
          .insert({
            owner_id: authUserId,
            team_name: teamName,
            members: validatedMembers,
          })
          .select()
          .single();

        if (teamErr) return respond({ error: teamErr.message }, 500);
        return respond({ team });
      }

      // ─── GET TEAMS ────────────────────────────────────────────
      case "getTeams": {
        const { data: teams, error: teamsErr } = await supabase
          .from("teams")
          .select("*")
          .eq("owner_id", authUserId)
          .order("created_at", { ascending: false });

        if (teamsErr) return respond({ error: teamsErr.message }, 500);
        return respond({ teams: teams || [] });
      }

      // ─── UPDATE TEAM ──────────────────────────────────────────
      case "updateTeam": {
        const { teamId } = data;
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        try {
          if (data.teamName !== undefined) updates.team_name = validateString(data.teamName, "teamName", 100);
          if (data.members !== undefined) updates.members = validateMembers(data.members);
        } catch (e) {
          return respond({ error: e.message }, 400);
        }

        const { data: team, error: updateErr } = await supabase
          .from("teams")
          .update(updates)
          .eq("id", teamId)
          .eq("owner_id", authUserId)
          .select()
          .single();

        if (updateErr) return respond({ error: updateErr.message }, 500);
        return respond({ team });
      }

      // ─── DELETE TEAM ──────────────────────────────────────────
      case "deleteTeam": {
        const { teamId } = data;
        const { error: deleteErr } = await supabase
          .from("teams")
          .delete()
          .eq("id", teamId)
          .eq("owner_id", authUserId);

        if (deleteErr) return respond({ error: deleteErr.message }, 500);
        return respond({ success: true });
      }

      // ─── CREATE CHALLENGE ─────────────────────────────────────
      case "createChallenge": {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }
        const seed = Math.floor(Math.random() * 2147483647);

        const { data: challenge, error: challengeErr } = await supabase
          .from("challenges")
          .insert({
            challenge_code: code,
            challenger_id: authUserId,
            question_seed: seed,
            status: "pending",
          })
          .select()
          .single();

        if (challengeErr) return respond({ error: challengeErr.message }, 500);
        return respond({ challenge });
      }

      // ─── SUBMIT CHALLENGER SCORE ──────────────────────────────
      case "submitChallengerScore": {
        const { challengeId, score: chalScore } = data;
        let chalResults: { round: number; score: number; details: string }[];
        let chalMembers: { id: string; name: string }[];
        try {
          chalResults = data.roundResults ? validateRoundResults(data.roundResults) : [];
          chalMembers = data.teamMembers ? validateMembers(data.teamMembers) : [];
        } catch (e) {
          return respond({ error: e.message }, 400);
        }

        const { data: challenge, error: chalErr } = await supabase
          .from("challenges")
          .update({
            challenger_score: chalScore,
            challenger_round_results: chalResults,
            challenger_team_members: chalMembers,
            status: "active",
          })
          .eq("id", challengeId)
          .eq("challenger_id", authUserId)
          .select()
          .single();

        if (chalErr) return respond({ error: chalErr.message }, 500);
        return respond({ challenge });
      }

      // ─── JOIN CHALLENGE ───────────────────────────────────────
      case "joinChallenge": {
        let challengeCode: string;
        try {
          challengeCode = validateChallengeCode(data.challengeCode);
        } catch (e) {
          return respond({ error: e.message }, 400);
        }

        const { data: challenge, error: findErr } = await supabase
          .from("challenges")
          .select("*")
          .eq("challenge_code", challengeCode)
          .single();

        if (findErr || !challenge) {
          return respond({ error: "Challenge not found" }, 404);
        }

        if (challenge.status === "completed") {
          return respond({ error: "Challenge already completed" }, 400);
        }

        if (challenge.challenger_id === authUserId) {
          return respond({ error: "Cannot join your own challenge" }, 400);
        }

        if (challenge.opponent_id && challenge.opponent_id !== authUserId) {
          return respond({ error: "Challenge already has an opponent" }, 400);
        }

        const { data: updated, error: joinErr } = await supabase
          .from("challenges")
          .update({ opponent_id: authUserId })
          .eq("id", challenge.id)
          .select()
          .single();

        if (joinErr) return respond({ error: joinErr.message }, 500);
        return respond({ challenge: updated });
      }

      // ─── SUBMIT OPPONENT SCORE ────────────────────────────────
      case "submitOpponentScore": {
        const { challengeId: oppChalId, score: oppScore } = data;
        let oppResults: { round: number; score: number; details: string }[];
        let oppMembers: { id: string; name: string }[];
        try {
          oppResults = data.roundResults ? validateRoundResults(data.roundResults) : [];
          oppMembers = data.teamMembers ? validateMembers(data.teamMembers) : [];
        } catch (e) {
          return respond({ error: e.message }, 400);
        }

        const { data: challenge, error: oppErr } = await supabase
          .from("challenges")
          .update({
            opponent_score: oppScore,
            opponent_round_results: oppResults,
            opponent_team_members: oppMembers,
            status: "completed",
          })
          .eq("id", oppChalId)
          .eq("opponent_id", authUserId)
          .select()
          .single();

        if (oppErr) return respond({ error: oppErr.message }, 500);
        return respond({ challenge });
      }

      // ─── GET CHALLENGES ───────────────────────────────────────
      case "getChallenges": {
        const { data: challenges, error: listErr } = await supabase
          .from("challenges")
          .select("*, challenger:users!challenges_challenger_id_fkey(username, avatar), opponent:users!challenges_opponent_id_fkey(username, avatar)")
          .or(`challenger_id.eq.${authUserId},opponent_id.eq.${authUserId}`)
          .order("created_at", { ascending: false });

        if (listErr) return respond({ error: listErr.message }, 500);

        const mapped = (challenges || []).map((c: Record<string, unknown>) => {
          const challenger = c.challenger as Record<string, unknown> | null;
          const opponent = c.opponent as Record<string, unknown> | null;
          return {
            ...c,
            challenger_username: challenger?.username || "Unknown",
            opponent_username: opponent?.username || null,
            challenger: undefined,
            opponent: undefined,
          };
        });

        return respond({ challenges: mapped });
      }

      // ─── GET CHALLENGE ────────────────────────────────────────
      case "getChallenge": {
        const { challengeId: getChalId, challengeCode: getChalCode } = data;

        let query = supabase
          .from("challenges")
          .select("*, challenger:users!challenges_challenger_id_fkey(username, avatar), opponent:users!challenges_opponent_id_fkey(username, avatar)");

        if (getChalId) {
          query = query.eq("id", getChalId);
        } else if (getChalCode) {
          query = query.eq("challenge_code", getChalCode.toUpperCase());
        } else {
          return respond({ error: "challengeId or challengeCode required" }, 400);
        }

        const { data: challenge, error: getErr } = await query.single();
        if (getErr || !challenge) return respond({ error: "Challenge not found" }, 404);

        const challenger = challenge.challenger as Record<string, unknown> | null;
        const opponent = challenge.opponent as Record<string, unknown> | null;

        return respond({
          challenge: {
            ...challenge,
            challenger_username: challenger?.username || "Unknown",
            opponent_username: opponent?.username || null,
            challenger: undefined,
            opponent: undefined,
          },
        });
      }

      // ─── GET GAME HISTORY ─────────────────────────────────────
      case "getGameHistory": {
        const { limit: histLimit = 20, offset: histOffset = 0 } = data;

        const { data: sessions, error: histErr } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("user_id", authUserId)
          .order("created_at", { ascending: false })
          .range(histOffset, histOffset + histLimit - 1);

        if (histErr) return respond({ error: histErr.message }, 500);
        return respond({ sessions: sessions || [] });
      }

      // ─── UPDATE PROFILE ───────────────────────────────────────
      case "updateProfile": {
        const { avatar: newAvatar } = data;
        const updates: Record<string, unknown> = {};
        if (newAvatar !== undefined) updates.avatar = typeof newAvatar === "string" ? newAvatar.slice(0, 500) : "";

        const { data: userRow, error: profErr } = await supabase
          .from("users")
          .update(updates)
          .eq("id", authUserId)
          .select()
          .single();

        if (profErr) return respond({ error: profErr.message }, 500);
        return respond({ user: mapUserRow(userRow) });
      }

      default:
        return respond({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    console.error("Edge function error:", err);
    return respond({ error: err.message || "Internal server error" }, 500);
  }
});
