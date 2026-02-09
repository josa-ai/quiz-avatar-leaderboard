import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Simple password hashing using Web Crypto API (no bcrypt needed in Deno edge)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, expectedHash] = storedHash.split(":");
  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex === expectedHash;
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, data } = await req.json();

    switch (action) {
      // ─── REGISTER ──────────────────────────────────────────────
      case "register": {
        const { email, username, password, avatar } = data;
        if (!email || !username || !password) {
          return respond({ error: "Email, username and password are required" }, 400);
        }

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
            avatar: avatar || "",
          })
          .select()
          .single();

        if (insertErr) {
          return respond({ error: insertErr.message }, 500);
        }

        return respond({ user: mapUserRow(newUser) });
      }

      // ─── LOGIN ─────────────────────────────────────────────────
      case "login": {
        const { email, password } = data;
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

        const valid = await verifyPassword(password, userRow.password_hash);
        if (!valid) {
          return respond({ error: "Invalid email or password" }, 401);
        }

        return respond({ user: mapUserRow(userRow) });
      }

      // ─── SAVE GAME SESSION ─────────────────────────────────────
      case "saveGameSession": {
        const { userId, gameMode, totalScore, roundResults, isWinner, teamMembers } = data;

        // Insert game session
        const { error: sessionErr } = await supabase
          .from("game_sessions")
          .insert({
            user_id: userId,
            game_mode: gameMode,
            total_score: totalScore,
            round_results: roundResults,
            is_winner: isWinner,
            team_members: teamMembers || [],
          });

        if (sessionErr) {
          return respond({ error: sessionErr.message }, 500);
        }

        // Insert leaderboard entry
        await supabase.from("leaderboard_entries").insert({
          user_id: userId,
          score: totalScore,
          period: "all_time",
        });

        // Update user stats
        const { data: currentUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
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
            .eq("id", userId);

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
        const { userId } = data;

        const { data: userRow } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (!userRow) {
          return respond({ error: "User not found" }, 404);
        }

        const { data: sessions } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("user_id", userId)
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
        const { userId, prizeId, prizeName, pointsCost } = data;

        const { data: userRow } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (!userRow) {
          return respond({ error: "User not found" }, 404);
        }

        if ((userRow.total_points || 0) < pointsCost) {
          return respond({ error: "Not enough points" }, 400);
        }

        await supabase.from("prize_redemptions").insert({
          user_id: userId,
          prize_id: prizeId,
          prize_name: prizeName,
          points_cost: pointsCost,
        });

        const newPoints = (userRow.total_points || 0) - pointsCost;
        await supabase
          .from("users")
          .update({ total_points: newPoints })
          .eq("id", userId);

        return respond({
          user: mapUserRow({ ...userRow, total_points: newPoints }),
        });
      }

      // ─── SAVE PRACTICE PROGRESS ────────────────────────────────
      case "savePracticeProgress": {
        const { userId, subject, questionsAnswered, correctAnswers, timeSpent } = data;

        const { error: practiceErr } = await supabase
          .from("practice_progress")
          .insert({
            user_id: userId,
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
        const { userId } = data;

        const { data: progress } = await supabase
          .from("practice_progress")
          .select("*")
          .eq("user_id", userId)
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
        const { userId, teamName, members } = data;
        if (!userId || !teamName) {
          return respond({ error: "userId and teamName are required" }, 400);
        }

        // Max 5 teams per user
        const { data: existingTeams } = await supabase
          .from("teams")
          .select("id")
          .eq("owner_id", userId);

        if (existingTeams && existingTeams.length >= 5) {
          return respond({ error: "Maximum 5 saved teams allowed" }, 400);
        }

        const { data: team, error: teamErr } = await supabase
          .from("teams")
          .insert({
            owner_id: userId,
            team_name: teamName,
            members: members || [],
          })
          .select()
          .single();

        if (teamErr) return respond({ error: teamErr.message }, 500);
        return respond({ team });
      }

      // ─── GET TEAMS ────────────────────────────────────────────
      case "getTeams": {
        const { userId } = data;
        const { data: teams, error: teamsErr } = await supabase
          .from("teams")
          .select("*")
          .eq("owner_id", userId)
          .order("created_at", { ascending: false });

        if (teamsErr) return respond({ error: teamsErr.message }, 500);
        return respond({ teams: teams || [] });
      }

      // ─── UPDATE TEAM ──────────────────────────────────────────
      case "updateTeam": {
        const { teamId, teamName, members } = data;
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (teamName !== undefined) updates.team_name = teamName;
        if (members !== undefined) updates.members = members;

        const { data: team, error: updateErr } = await supabase
          .from("teams")
          .update(updates)
          .eq("id", teamId)
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
          .eq("id", teamId);

        if (deleteErr) return respond({ error: deleteErr.message }, 500);
        return respond({ success: true });
      }

      // ─── CREATE CHALLENGE ─────────────────────────────────────
      case "createChallenge": {
        const { challengerId } = data;
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
            challenger_id: challengerId,
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
        const { challengeId, score: chalScore, roundResults: chalResults, teamMembers: chalMembers } = data;

        const { data: challenge, error: chalErr } = await supabase
          .from("challenges")
          .update({
            challenger_score: chalScore,
            challenger_round_results: chalResults || [],
            challenger_team_members: chalMembers || [],
            status: "active",
          })
          .eq("id", challengeId)
          .select()
          .single();

        if (chalErr) return respond({ error: chalErr.message }, 500);
        return respond({ challenge });
      }

      // ─── JOIN CHALLENGE ───────────────────────────────────────
      case "joinChallenge": {
        const { challengeCode, opponentId } = data;

        const { data: challenge, error: findErr } = await supabase
          .from("challenges")
          .select("*")
          .eq("challenge_code", challengeCode.toUpperCase())
          .single();

        if (findErr || !challenge) {
          return respond({ error: "Challenge not found" }, 404);
        }

        if (challenge.status === "completed") {
          return respond({ error: "Challenge already completed" }, 400);
        }

        if (challenge.challenger_id === opponentId) {
          return respond({ error: "Cannot join your own challenge" }, 400);
        }

        if (challenge.opponent_id && challenge.opponent_id !== opponentId) {
          return respond({ error: "Challenge already has an opponent" }, 400);
        }

        const { data: updated, error: joinErr } = await supabase
          .from("challenges")
          .update({ opponent_id: opponentId })
          .eq("id", challenge.id)
          .select()
          .single();

        if (joinErr) return respond({ error: joinErr.message }, 500);
        return respond({ challenge: updated });
      }

      // ─── SUBMIT OPPONENT SCORE ────────────────────────────────
      case "submitOpponentScore": {
        const { challengeId: oppChalId, score: oppScore, roundResults: oppResults, teamMembers: oppMembers } = data;

        const { data: challenge, error: oppErr } = await supabase
          .from("challenges")
          .update({
            opponent_score: oppScore,
            opponent_round_results: oppResults || [],
            opponent_team_members: oppMembers || [],
            status: "completed",
          })
          .eq("id", oppChalId)
          .select()
          .single();

        if (oppErr) return respond({ error: oppErr.message }, 500);
        return respond({ challenge });
      }

      // ─── GET CHALLENGES ───────────────────────────────────────
      case "getChallenges": {
        const { userId: chalUserId } = data;

        const { data: challenges, error: listErr } = await supabase
          .from("challenges")
          .select("*, challenger:users!challenges_challenger_id_fkey(username, avatar), opponent:users!challenges_opponent_id_fkey(username, avatar)")
          .or(`challenger_id.eq.${chalUserId},opponent_id.eq.${chalUserId}`)
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
        const { userId: histUserId, limit: histLimit = 20, offset: histOffset = 0 } = data;

        const { data: sessions, error: histErr } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("user_id", histUserId)
          .order("created_at", { ascending: false })
          .range(histOffset, histOffset + histLimit - 1);

        if (histErr) return respond({ error: histErr.message }, 500);
        return respond({ sessions: sessions || [] });
      }

      // ─── UPDATE PROFILE ───────────────────────────────────────
      case "updateProfile": {
        const { userId: profUserId, avatar: newAvatar } = data;
        const updates: Record<string, unknown> = {};
        if (newAvatar !== undefined) updates.avatar = newAvatar;

        const { data: userRow, error: profErr } = await supabase
          .from("users")
          .update(updates)
          .eq("id", profUserId)
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
