// ===============================
// 🔹 SCROLL TO EVENTS
// ===============================
function scrollToEvents() {
    document.getElementById('events').scrollIntoView({
        behavior: 'smooth'
    });
}


// ===============================
// 🔹 AUTO SELECT EVENT
// ===============================
function selectEvent(eventName) {

    document.getElementById('eventSelect').value = eventName;

    document.getElementById('booking').scrollIntoView({
        behavior: 'smooth'
    });
}


// ===============================
// 🔹 BOOKING FORM → DATABASE
// ===============================
document.getElementById('bookingForm')
.addEventListener('submit', function(e){

    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const email = document.querySelector('input[type="email"]').value;
    const phone = document.querySelector('input[type="tel"]').value;
    const eventName = document.getElementById('eventSelect').value;

    const selects = document.querySelectorAll('select');

    const ticketType = selects[2].value;
    const tickets = document.querySelector('input[type="number"]').value;
    const paymentMethod = selects[3].value;

    const data = {
        name: customerName,
        email: email,
        phone: phone,
        event: eventName,
        ticketType: ticketType,
        tickets: tickets,
        paymentMethod: paymentMethod
    };

    fetch("http://localhost:3000/booking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {

        document.getElementById('bookingMessage').innerHTML = `
        🎉 Booking Confirmed & Saved in Database 🎉
        <br><br>
        Customer: <b>${customerName}</b>
        <br>
        Event: <b>${eventName}</b>
        `;

        document.getElementById('bookingForm').reset();
    })
    .catch(err => {
        console.log(err);
        document.getElementById('bookingMessage').innerHTML =
        " Error saving booking";
    });
});


// ===============================
// 🔹 LOAD DASHBOARD DATA (with PL/SQL Functions)
// ===============================
function loadDashboard(){

    fetch("http://localhost:3000/dashboard")
    .then(res => res.json())
    .then(data => {

        document.getElementById('totalEvents').innerText = data.events;
        document.getElementById('ticketsSold').innerText = data.tickets;
        document.getElementById('totalSponsors').innerText = data.sponsors;
        document.getElementById('totalStaff').innerText = data.staff;
        document.getElementById('totalParticipants').innerText = data.participants;

        // Load event revenues using PL/SQL functions
        loadEventRevenues();
    })
    .catch(err => console.log(err));
}

// ===============================
// 🔹 LOAD EVENT REVENUES (PL/SQL Function: fnCalculateTotalEventRevenue)
// ===============================
function loadEventRevenues(){
    fetch("http://localhost:3000/events")
    .then(res => res.json())
    .then(events => {
        
        const tableBody = document.getElementById('revenueTableBody');
        tableBody.innerHTML = '';

        if(events.length === 0){
            tableBody.innerHTML = '<tr><td colspan="4" style="padding: 10px; text-align: center;">No events available</td></tr>';
            return;
        }

        // Load revenue for each event using PL/SQL function
        const revenuePromises = events.map(event => {
            return fetch(`http://localhost:3000/plsql/eventRevenue/${event.event_id}`)
                .then(res => res.json())
                .then(data => {
                    return {
                        eventId: event.event_id,
                        eventName: event.event_name,
                        organizerName: event.organizer_id || 'Unknown',
                        revenue: data.totalRevenue || 0,
                        ticketCount: 0
                    };
                })
                .catch(err => ({
                    eventId: event.event_id,
                    eventName: event.event_name,
                    organizerName: 'Unknown',
                    revenue: 0,
                    ticketCount: 0
                }));
        });

        Promise.all(revenuePromises)
        .then(revenues => {
            // Sort by revenue descending and take top 5
            revenues.sort((a, b) => b.revenue - a.revenue);
            
            revenues.slice(0, 5).forEach(rev => {
                tableBody.innerHTML += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${rev.eventName}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Event Org</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">PKR ${rev.revenue.toLocaleString()}</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">-</td>
                    </tr>
                `;
            });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}


// ===============================
// 🔹 OPTIONAL: LOAD EVENTS FROM DB
// (agar tum dynamic cards chahte ho)
// ===============================
function loadEventsFromDB(){

    fetch("http://localhost:3000/events")
    .then(res => res.json())
    .then(data => {

        const container = document.querySelector('.events-container');

        if(!container) return;

        container.innerHTML = "";

        data.forEach(e => {

            container.innerHTML += `
            <div class="event-card">
                <h3>${e.event_name}</h3>
                <p><b>Date:</b> ${e.event_date}</p>
                <p><b>Time:</b> ${e.event_time}</p>
                <p><b>Venue:</b> ${e.venue_name}</p>
                <p><b>City:</b> ${e.location}</p>
                <p><b>Type:</b> ${e.event_type}</p>
                <p><b>Budget:</b> ${e.budget}</p>
                <button onclick="selectEvent('${e.event_name}')">
                    Book Now
                </button>
            </div>
            `;
        });

    })
    .catch(err => console.log(err));
}


// ===============================
// 🔹 PAGE LOAD
// ===============================
window.onload = function(){

    loadDashboard();
    loadEventsFromDB();

};
