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
