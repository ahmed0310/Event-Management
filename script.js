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
// 🔹 LOAD DASHBOARD DATA
// ===============================
function loadDashboard(){

    fetch("http://localhost:3000/dashboard")
    .then(res => res.json())
    .then(data => {

        const cards = document.querySelectorAll('.card h3');

        if(cards.length >= 5){
            cards[0].innerText = data.events;
            cards[1].innerText = data.tickets;
            cards[2].innerText = data.sponsors;
            cards[3].innerText = data.staff;
            cards[4].innerText = data.participants;
        }
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