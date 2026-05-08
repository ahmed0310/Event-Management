const express = require('express');
const cors = require('cors');
const { getConnection, oracledb } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===============================
// GET DASHBOARD
// ===============================
app.get('/dashboard', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const eventsResult = await connection.execute('SELECT COUNT(*) AS count FROM Event');
    const ticketsResult = await connection.execute('SELECT COUNT(*) AS count FROM Ticket');
    const sponsorsResult = await connection.execute('SELECT COUNT(*) AS count FROM Sponsor');
    const staffResult = await connection.execute('SELECT COUNT(*) AS count FROM Staff');
    const participantsResult = await connection.execute('SELECT COUNT(*) AS count FROM Participant');

    res.json({
      events: eventsResult.rows[0][0],
      tickets: ticketsResult.rows[0][0],
      sponsors: sponsorsResult.rows[0][0],
      staff: staffResult.rows[0][0],
      participants: participantsResult.rows[0][0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ===============================
// GET EVENTS
// ===============================
app.get('/events', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 
         event_id, 
         event_name, 
         TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date,
         event_time,
         venue_name,
         location,
         event_type,
         budget
       FROM vw_event_details 
       ORDER BY event_date ASC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    // Explicitly lowercase all keys before sending to frontend
    const lowerCaseRows = result.rows.map(row => {
      const newRow = {};
      for (let key in row) {
        newRow[key.toLowerCase()] = row[key];
      }
      return newRow;
    });

    res.json(lowerCaseRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ===============================
// POST BOOKING
// ===============================
app.get('/test', (req, res) => res.send('Server running!'));

app.post('/booking', async (req, res) => {
  const { name, email, phone, event, ticketType, tickets, paymentMethod } = req.body;
  let connection;

  try {
    connection = await getConnection();

    // 1. Get Event ID
    const eventRes = await connection.execute(
      `SELECT event_id FROM Event WHERE event_name = :eventName`,
      [event]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventId = eventRes.rows[0][0];

    // 2. Handle Participant
    let participantId;
    const partRes = await connection.execute(
      `SELECT participant_id FROM Participant WHERE email = :email`,
      [email]
    );

    if (partRes.rows.length > 0) {
      participantId = partRes.rows[0][0];
    } else {
      // Get new Participant ID
      const newPartIdRes = await connection.execute(`SELECT NVL(MAX(participant_id), 0) + 1 FROM Participant`);
      participantId = newPartIdRes.rows[0][0];

      await connection.execute(
        `INSERT INTO Participant (participant_id, full_name, gender, email, phone_number, address)
         VALUES (:1, :2, :3, :4, :5, :6)`,
        [participantId, name, 'M', email, phone, 'Not Provided'] // Hardcoded gender/address as they aren't in the form
      );
    }

    // 3. Handle Tickets
    const numTickets = parseInt(tickets) || 1;
    const ticketPrice = ticketType.toUpperCase() === 'VIP' ? 5000 : 2000;

    for (let i = 0; i < numTickets; i++) {
      const newTicketIdRes = await connection.execute(`SELECT NVL(MAX(ticket_id), 0) + 1 FROM Ticket`);
      const ticketId = newTicketIdRes.rows[0][0];

      await connection.execute(
        `INSERT INTO Ticket (ticket_id, participant_id, event_id, ticket_type, price, booking_date)
         VALUES (:1, :2, :3, :4, :5, SYSDATE)`,
        [ticketId, participantId, eventId, ticketType, ticketPrice]
      );
    }

    // 4. Handle Payment
    const totalAmount = ticketPrice * numTickets;
    const newPayIdRes = await connection.execute(`SELECT NVL(MAX(payment_id), 0) + 1 FROM Payment`);
    const paymentId = newPayIdRes.rows[0][0];

    await connection.execute(
      `INSERT INTO Payment (payment_id, participant_id, amount, payment_method, payment_date, payment_status)
       VALUES (:1, :2, :3, :4, SYSDATE, :5)`,
      [paymentId, participantId, totalAmount, paymentMethod, 'Pending']
    );

    res.json({ message: 'Booking confirmed successfully!' });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ error: 'Database error while saving booking.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ===============================
// GET VENUES (For Admin Form)
// ===============================
app.get('/venues', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT venue_id, venue_name FROM Venue`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    const lowerCaseRows = result.rows.map(row => {
      const newRow = {};
      for (let key in row) newRow[key.toLowerCase()] = row[key];
      return newRow;
    });
    res.json(lowerCaseRows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) { try { await connection.close(); } catch(e){} }
  }
});

// ===============================
// GET ORGANIZERS (For Admin Form)
// ===============================
app.get('/organizers', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT organizer_id, organizer_name FROM Organizer`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    const lowerCaseRows = result.rows.map(row => {
      const newRow = {};
      for (let key in row) newRow[key.toLowerCase()] = row[key];
      return newRow;
    });
    res.json(lowerCaseRows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) { try { await connection.close(); } catch(e){} }
  }
});

// ===============================
// GET BOOKINGS (Admin View)
// ===============================
app.get('/admin/bookings', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`
      SELECT ticket_id, participant_name, participant_email, event_name, 
             TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date, ticket_type, price, 
             TO_CHAR(booking_date, 'YYYY-MM-DD') AS booking_date
      FROM vw_ticket_bookings
      ORDER BY ticket_id DESC
    `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    const lowerCaseRows = result.rows.map(row => {
      const newRow = {};
      for (let key in row) newRow[key.toLowerCase()] = row[key];
      return newRow;
    });
    res.json(lowerCaseRows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) { try { await connection.close(); } catch(e){} }
  }
});

// ===============================
// POST NEW EVENT (Admin Panel)
// ===============================
app.post('/admin/events', async (req, res) => {
  const { event_name, event_date, event_time, event_type, budget, venue_id, organizer_id } = req.body;
  let connection;
  try {
    connection = await getConnection();
    
    const newIdRes = await connection.execute(`SELECT NVL(MAX(event_id), 0) + 1 FROM Event`);
    const eventId = newIdRes.rows[0][0];

    await connection.execute(
      `INSERT INTO Event (event_id, event_name, event_date, event_time, event_type, budget, venue_id, organizer_id)
       VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6, :7, :8)`,
      [eventId, event_name, event_date, event_time, event_type, budget, venue_id, organizer_id]
    );

    res.json({ message: 'Event created successfully!' });
  } catch (err) {
    console.error('Add Event Error:', err);
    res.status(500).json({ error: 'Database error while saving event.' });
  } finally {
    if (connection) { try { await connection.close(); } catch(e){} }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
