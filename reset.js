const { getConnection, oracledb } = require('./db');

async function resetDatabase() {
  let connection;
  try {
    connection = await getConnection();
    console.log("Connected to Database. Starting reset process...");

    // Array of tables in order of dependencies (child to parent)
    const tables = [
      'Payment',
      'Ticket',
      'Schedule',
      'Sponsor',
      'Staff',
      'Event',
      'Participant',
      'Organizer',
      'Venue'
    ];

    for (let table of tables) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`✅ Emptied table: ${table}`);
      } catch (err) {
        console.error(`❌ Failed to empty table ${table}:`, err.message);
      }
    }

    // Commit changes
    await connection.commit();
    console.log("🎉 Database has been completely reset!");

  } catch (err) {
    console.error("Error connecting to database:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

resetDatabase();
