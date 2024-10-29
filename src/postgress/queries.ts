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