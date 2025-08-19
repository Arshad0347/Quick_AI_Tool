import { neon } from "@neondatabase/serverless";

const sql = neon(`${process.env.DATABASE_URL}`); // Connect to the database

export default sql;
