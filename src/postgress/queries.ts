import { pool } from "../Db/Db";

export async function incrementUsers() {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO total_users (count) VALUES (0)');
    console.log("New row added to total_users with count 0");
  } catch (error) {
    console.error("Error inserting new row in total_users:", error);
  } finally {
    client.release();
  }
}
export async function incrementVotes() {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO total_votes (count) VALUES (0)');
    console.log("New row added to total_votes with count 0");
  } catch (error) {
    console.error("Error inserting new row in total_votes:", error);
  } finally {
    client.release();
  }
}

export async function incrementSessions() {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO total_sessions (count) VALUES (0)');
    console.log("New row added to total_sessions with count 0");
  } catch (error) {
    console.error("Error inserting new row in total_sessions:", error);
  } finally {
    client.release();
  }
}

export async function getTotalCounts() {
  const client = await pool.connect();
  try {
    const usersResult = await client.query('SELECT count(id) AS total FROM total_users');
    const votesResult = await client.query('SELECT count(id) AS total FROM total_votes');
    const sessionsResult = await client.query('SELECT count(id) AS total FROM total_sessions');

    const totalUsers = usersResult.rows[0].total || 0;
    const totalVotes = votesResult.rows[0].total || 0;
    const totalSessions = sessionsResult.rows[0].total || 0;
    return {
      totalUsers :totalUsers,
      totalVotes:totalVotes,
      totalSessions:totalSessions,
    };
  } catch (error) {
    console.error("Error fetching total counts:", error);
    throw error;
  } finally {
    client.release();
  }
}