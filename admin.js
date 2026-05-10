const ADMIN_PASSWORD = "admin"; // Simple hardcoded password for demonstration

function checkLogin() {
    const pwd = document.getElementById('adminPassword').value;
    if (pwd === ADMIN_PASSWORD) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadAdminData();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function loadAdminData() {
    loadVenues();
    loadOrganizers();
    loadBookings();
    loadAnalyticsEvents();
    loadVenuesForOccupancy();
    loadEventsForBulkTickets();
}

function loadVenues() {
    fetch("http://localhost:3000/venues")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('eventVenue');
            select.innerHTML = '<option value="">Select Venue</option>';
            data.forEach(v => {
                select.innerHTML += `<option value="${v.venue_id}">${v.venue_name}</option>`;
            });
        })
        .catch(err => console.error(err));
}

function loadOrganizers() {
    fetch("http://localhost:3000/organizers")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('eventOrganizer');
            select.innerHTML = '<option value="">Select Organizer</option>';
            data.forEach(o => {
                select.innerHTML += `<option value="${o.organizer_id}">${o.organizer_name}</option>`;
            });
        })
        .catch(err => console.error(err));
}

function loadBookings() {
    fetch("http://localhost:3000/admin/bookings")
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('bookingsTableBody');
            tbody.innerHTML = '';
            data.forEach(b => {
                tbody.innerHTML += `
                    <tr>
                        <td>${b.ticket_id}</td>
                        <td>${b.participant_name}</td>
                        <td>${b.participant_email}</td>
                        <td>${b.event_name}</td>
                        <td>${b.event_date}</td>
                        <td>${b.ticket_type}</td>
                        <td>${b.price} PKR</td>
                        <td>${b.booking_date}</td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error(err));
}

document.getElementById('addEventForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const data = {
        event_name: document.getElementById('eventName').value,
        event_date: document.getElementById('eventDate').value,
        event_time: document.getElementById('eventTime').value,
        event_type: document.getElementById('eventType').value,
        budget: document.getElementById('eventBudget').value,
        venue_id: document.getElementById('eventVenue').value,
        organizer_id: document.getElementById('eventOrganizer').value
    };

    fetch("http://localhost:3000/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        document.getElementById('eventMessage').innerText = "✅ " + response.message;
        document.getElementById('addEventForm').reset();
    })
    .catch(err => {
        console.error(err);
        document.getElementById('eventMessage').innerText = "❌ Failed to create event.";
        document.getElementById('eventMessage').style.color = "red";
    });
});

// ===============================
// PHASE 4: PL/SQL FRONTEND INTEGRATION
// ===============================

// 1. REGISTER PARTICIPANT (PL/SQL Procedure: procRegisterParticipant)
document.getElementById('registerParticipantForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const data = {
        fullName: document.getElementById('participantName').value,
        gender: document.getElementById('participantGender').value,
        email: document.getElementById('participantEmail').value,
        phone: document.getElementById('participantPhone').value,
        address: document.getElementById('participantAddress').value
    };

    fetch("http://localhost:3000/plsql/registerParticipant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if(response.success) {
            document.getElementById('participantMessage').innerText = "✅ " + response.message;
            document.getElementById('participantMessage').style.color = "green";
            document.getElementById('registerParticipantForm').reset();
        } else {
            throw new Error(response.error);
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('participantMessage').innerText = "❌ " + err.message;
        document.getElementById('participantMessage').style.color = "red";
    });
});

// 2. LOAD EVENTS FOR ANALYTICS
function loadAnalyticsEvents() {
    fetch("http://localhost:3000/events")
    .then(res => res.json())
    .then(events => {
        const select = document.getElementById('analyticsEventSelect');
        select.innerHTML = '<option value="">Select an Event</option>';
        events.forEach(e => {
            select.innerHTML += `<option value="${e.event_id}">${e.event_name}</option>`;
        });
    })
    .catch(err => console.error(err));
}

// 3. LOAD EVENT ANALYTICS (PL/SQL Functions: fnCalculateTotalEventRevenue, fnGetEventOrganizerName)
function loadEventAnalytics() {
    const eventId = document.getElementById('analyticsEventSelect').value;
    if(!eventId) {
        alert('Please select an event');
        return;
    }

    fetch(`http://localhost:3000/admin/plsql/eventSummary/${eventId}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('analyticsEventName').innerText = data.eventName;
        document.getElementById('eventBudgetDisplay').innerText = `PKR ${data.budget.toLocaleString()}`;
        document.getElementById('eventRevenueDisplay').innerText = `PKR ${data.revenue.toLocaleString()}`;
        document.getElementById('eventProfitDisplay').innerText = `PKR ${data.profit.toLocaleString()}`;
        document.getElementById('eventMarginDisplay').innerText = `${((data.profit / data.revenue) * 100).toFixed(2)}%`;
        document.getElementById('analyticsContainer').style.display = 'block';
    })
    .catch(err => {
        console.error(err);
        alert('Error loading analytics');
    });
}

// 4. LOAD VENUES FOR OCCUPANCY REPORT
function loadVenuesForOccupancy() {
    fetch("http://localhost:3000/venues")
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('venueSelect');
        select.innerHTML = '<option value="">Select a Venue</option>';
        data.forEach(v => {
            select.innerHTML += `<option value="${v.venue_id}">${v.venue_name}</option>`;
        });
    })
    .catch(err => console.error(err));
}

// 5. LOAD VENUE OCCUPANCY (PL/SQL Cursor-based Procedure)
function loadVenueOccupancy() {
    const venueId = document.getElementById('venueSelect').value;
    if(!venueId) {
        alert('Please select a venue');
        return;
    }

    fetch(`http://localhost:3000/admin/plsql/venueOccupancy/${venueId}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('venueNameDisplay').innerText = data.venue.venueName;
        document.getElementById('venueDetailsDisplay').innerText = 
            `Capacity: ${data.venue.capacity} | Location: ${data.venue.location}`;
        
        const tbody = document.getElementById('occupancyTableBody');
        tbody.innerHTML = '';
        
        if(data.events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding: 10px; text-align: center;">No events at this venue</td></tr>';
        } else {
            data.events.forEach(event => {
                tbody.innerHTML += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${event.eventName}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${event.eventDate}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${event.attendees}</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: #e91e63; font-weight: bold;">${event.occupancyRate}</td>
                    </tr>
                `;
            });
        }
        document.getElementById('occupancyContainer').style.display = 'block';
    })
    .catch(err => {
        console.error(err);
        alert('Error loading occupancy report');
    });
}

// 6. LOAD EVENTS FOR BULK TICKET GENERATION
function loadEventsForBulkTickets() {
    fetch("http://localhost:3000/events")
    .then(res => res.json())
    .then(events => {
        const select = document.getElementById('bulkEventSelect');
        select.innerHTML = '<option value="">Select an Event</option>';
        events.forEach(e => {
            select.innerHTML += `<option value="${e.event_id}">${e.event_name}</option>`;
        });
    })
    .catch(err => console.error(err));
}

// 7. BULK TICKET GENERATION (PL/SQL Package Procedure)
document.getElementById('bulkTicketForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const data = {
        eventId: document.getElementById('bulkEventSelect').value,
        ticketType: document.getElementById('bulkTicketType').value,
        price: document.getElementById('bulkTicketPrice').value,
        quantity: document.getElementById('bulkQuantity').value
    };

    fetch("http://localhost:3000/admin/plsql/bulkTicketGeneration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        document.getElementById('bulkTicketMessage').innerText = "✅ " + response.message;
        document.getElementById('bulkTicketMessage').style.color = "green";
        document.getElementById('bulkTicketForm').reset();
    })
    .catch(err => {
        console.error(err);
        document.getElementById('bulkTicketMessage').innerText = "❌ Failed to generate tickets.";
        document.getElementById('bulkTicketMessage').style.color = "red";
    });
});

// 8. CHECK PARTICIPANT TICKETS (PL/SQL Function: fnGetParticipantTicketCount)
function checkParticipantTickets() {
    const participantId = document.getElementById('participantCheckId').value;
    if(!participantId) {
        alert('Please enter a Participant ID');
        return;
    }

    fetch(`http://localhost:3000/plsql/participantTickets/${participantId}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('ticketCountResult').innerText = data.ticketCount;
        document.getElementById('participantResultName').innerText = `Participant ID: ${data.participantId}`;
        document.getElementById('participantTicketsResult').style.display = 'block';
    })
    .catch(err => {
        console.error(err);
        alert('Error checking participant tickets');
    });
}
