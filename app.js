function initData() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                name: "Иван Петров",
                phone: "+79991234567",
                password: "client123",
                role: "client",
                isVip: true,
                discount: 10,
                subscription: "active",
                bookingsCount: 5
            },
            {
                id: 2,
                name: "Алексей Смирнов",
                phone: "+79992345678",
                password: "instructor123",
                role: "instructor",
                specialization: ["parachute", "deltaplan"]
            },
            {
                id: 3,
                name: "Администратор",
                phone: "+79993456789",
                password: "admin123",
                role: "admin"
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('bookings')) {
        const defaultBookings = [
            {
                id: 1,
                clientId: 1,
                clientName: "Иван Петров",
                device: "parachute",
                deviceName: "Парашют",
                trainingType: "individual",
                location: "north",
                locationName: "Северная площадка",
                date: getFutureDate(1),
                time: "10:00",
                people: 1,
                payment: "day",
                status: "active",
                instructorId: 2,
                instructorName: "Алексей Смирнов",
                hours: 2
            },
            {
                id: 2,
                clientId: 1,
                clientName: "Иван Петров",
                device: "deltaplan",
                deviceName: "Дельтаплан",
                trainingType: "group",
                location: "south",
                locationName: "Южная площадка",
                date: getFutureDate(2),
                time: "14:00",
                people: 3,
                payment: "course",
                status: "active",
                instructorId: 2,
                instructorName: "Алексей Смирнов",
                hours: 3
            },
            {
                id: 3,
                clientId: 2,
                clientName: "Алексей Смирнов",
                device: "paraplan",
                deviceName: "Параплан",
                trainingType: "individual",
                location: "west",
                locationName: "Западная площадка",
                date: getFutureDate(3),
                time: "11:00",
                people: 1,
                payment: "month",
                status: "completed",
                instructorId: 2,
                instructorName: "Алексей Смирнов",
                hours: 2
            }
        ];
        localStorage.setItem('bookings', JSON.stringify(defaultBookings));
    }

    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}


function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}


function login() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('user-role').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u =>
        u.phone === phone &&
        u.password === password &&
        u.role === role
    );

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainInterface();
        showNotification('Успешный вход в систему!', 'success');
    } else {
        showNotification('Неверный телефон, пароль или роль!', 'error');
    }
}

function logout() {
    localStorage.setItem('currentUser', JSON.stringify(null));
    document.getElementById('login-section').classList.add('active');
    document.getElementById('main-interface').classList.remove('active');
    showNotification('Вы вышли из системы', 'success');
}

function showMainInterface() {
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('main-interface').classList.add('active');

    const user = JSON.parse(localStorage.getItem('currentUser'));

    document.getElementById('dashboard-name').textContent = user.name;
    document.getElementById('dashboard-status').textContent =
        user.subscription === 'active' ? 'активен' :
            user.subscription === 'frozen' ? 'заморожен' : 'истек';
    document.getElementById('dashboard-discount').textContent =
        user.discount ? `${user.discount}%` : '0%';

    document.querySelectorAll('.instructor-only').forEach(el => {
        el.style.display = user.role === 'instructor' ? 'block' : 'none';
    });
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = user.role === 'admin' ? 'block' : 'none';
    });

    const statusCard = document.getElementById('status-card-container');
    const freezeBtn = document.getElementById('freeze-btn');

    if (user.role !== 'client') {
        statusCard.style.display = 'none';
        freezeBtn.style.display = 'none';
    } else {
        statusCard.style.display = 'block';
        freezeBtn.style.display = 'block';
    }

    updateDashboard();
    loadRecentBookings();
}

function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(`${sectionId}-section`).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }


    switch (sectionId) {
        case 'dashboard':
            updateDashboard();
            loadRecentBookings();
            break;
        case 'bookings':
            setupBookingForm();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'instructor-schedule':
            loadInstructorSchedule();
            break;
        case 'users':
            loadUsers();
            break;
        case 'statistics':
            loadStatistics();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}


function updateDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    let userBookings = [];
    if (user.role === 'client') {
        userBookings = bookings.filter(b => b.clientId === user.id && b.status !== 'cancelled');
    } else if (user.role === 'instructor') {
        userBookings = bookings.filter(b => b.instructorId === user.id && b.status !== 'cancelled');
    } else {
        userBookings = bookings.filter(b => b.status !== 'cancelled');
    }

    const activeBookings = userBookings.filter(b => b.status === 'active');

    document.getElementById('dashboard-bookings').textContent = activeBookings.length;


    if (user.role === 'client') {
        document.getElementById('dashboard-name').textContent = user.name;
        document.getElementById('dashboard-status').textContent =
            user.subscription === 'active' ? 'активен' :
                user.subscription === 'frozen' ? 'заморожен' : 'истек';
        document.getElementById('dashboard-discount').textContent =
            user.isVip ? `${user.discount || 10}%` : '0%';
    }
}

let currentPage = 1;
const ITEMS_PER_PAGE = 5;
let currentFilter = {};
let currentSort = {};

function loadRecentBookings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    let userBookings = [];
    if (user.role === 'client') {
        userBookings = bookings.filter(b => b.clientId === user.id && b.status !== 'cancelled');
    } else if (user.role === 'instructor') {
        userBookings = bookings.filter(b => b.instructorId === user.id && b.status !== 'cancelled');
    } else {
        userBookings = bookings.filter(b => b.status !== 'cancelled');
    }


    userBookings = applyFilters(userBookings, currentFilter);

    userBookings = applySorting(userBookings, currentSort);

    const totalPages = Math.ceil(userBookings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageBookings = userBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const bookingsList = document.getElementById('bookings-list');
    bookingsList.innerHTML = '';

    pageBookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        bookingItem.innerHTML = `
            <div class="booking-info">
                <h4>${booking.deviceName}, ${booking.date} ${booking.time}</h4>
                <p class="booking-client">${booking.clientName}</p>
            </div>
            <div class="booking-actions">
                <button class="btn-small" onclick="showBookingDetails(${booking.id})">
                    Просмотр
                </button>
                ${user.role !== 'client' || booking.clientId === user.id ?
                `<button class="btn-small btn-cancel" onclick="cancelBooking(${booking.id})">
                        Отменить
                    </button>` : ''
            }
            </div>
        `;
        bookingsList.appendChild(bookingItem);
    });

    document.getElementById('page-info').textContent = `Страница ${currentPage} из ${totalPages}`;
}

function applyFilters(bookings, filter) {
    let filtered = [...bookings];

    if (filter.deviceType && filter.deviceType !== '') {
        filtered = filtered.filter(b => b.device === filter.deviceType);
    }

    if (filter.status && filter.status !== '') {
        filtered = filtered.filter(b => b.status === filter.status);
    }

    if (filter.dateFrom) {
        filtered = filtered.filter(b => b.date >= filter.dateFrom);
    }

    if (filter.dateTo) {
        filtered = filtered.filter(b => b.date <= filter.dateTo);
    }

    return filtered;
}

function applySorting(bookings, sort) {
    let sorted = [...bookings];

    if (!sort.by) {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        return sorted;
    }

    switch (sort.by) {
        case 'date':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-old':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'device':
            sorted.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
            break;
        case 'client':
            sorted.sort((a, b) => a.clientName.localeCompare(b.clientName));
            break;
    }

    return sorted;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadRecentBookings();
    }
}

function nextPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    let userBookings = [];
    if (user.role === 'client') {
        userBookings = bookings.filter(b => b.clientId === user.id && b.status !== 'cancelled');
    } else if (user.role === 'instructor') {
        userBookings = bookings.filter(b => b.instructorId === user.id && b.status !== 'cancelled');
    } else {
        userBookings = bookings.filter(b => b.status !== 'cancelled');
    }

    userBookings = applyFilters(userBookings, currentFilter);
    userBookings = applySorting(userBookings, currentSort);

    const totalPages = Math.ceil(userBookings.length / ITEMS_PER_PAGE);

    if (currentPage < totalPages) {
        currentPage++;
        loadRecentBookings();
    }
}

function filterBookings() {
    const searchTerm = document.getElementById('search-bookings').value.toLowerCase();
    const bookings = document.querySelectorAll('.booking-item');

    bookings.forEach(booking => {
        const text = booking.textContent.toLowerCase();
        booking.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

function showFilterModal() {
    document.getElementById('filter-device-type').value = currentFilter.deviceType || '';
    document.getElementById('filter-booking-status').value = currentFilter.status || '';
    document.getElementById('filter-date-from').value = currentFilter.dateFrom || '';
    document.getElementById('filter-date-to').value = currentFilter.dateTo || '';

    showModal('filter-modal');
}

function applyFilter() {
    currentFilter = {
        deviceType: document.getElementById('filter-device-type').value,
        status: document.getElementById('filter-booking-status').value,
        dateFrom: document.getElementById('filter-date-from').value,
        dateTo: document.getElementById('filter-date-to').value
    };

    currentPage = 1;
    loadRecentBookings();
    closeModal('filter-modal');
    showNotification('Фильтр применен', 'success');
}

function showSortModal() {
    document.getElementById('sort-by').value = currentSort.by || 'date';
    showModal('sort-modal');
}

function applySort() {
    currentSort = {
        by: document.getElementById('sort-by').value
    };

    currentPage = 1;
    loadRecentBookings();
    closeModal('sort-modal');
    showNotification('Сортировка применена', 'success');
}


function setupBookingForm() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const now = new Date();
    const minDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const dateInput = document.getElementById('booking-date');
    const timeInput = document.getElementById('booking-time');

    dateInput.min = minDate.toISOString().split('T')[0];


    if (!dateInput.value) {
        dateInput.value = dateInput.min;
    }


    if (!timeInput.value) {
        const hours = minDate.getHours().toString().padStart(2, '0');
        const minutes = '00';
        timeInput.value = `${hours}:${minutes}`;
    }

    const adminClientSelect = document.getElementById('admin-client-select');
    const clientSelect = document.getElementById('booking-client');

    if (user.role === 'admin') {
        adminClientSelect.style.display = 'block';

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const clients = users.filter(u => u.role === 'client');

        clientSelect.innerHTML = '<option value="">Выберите клиента</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.name} (${client.phone})`;
            clientSelect.appendChild(option);
        });
    } else {
        adminClientSelect.style.display = 'none';
    }
}

function saveBooking() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    const deviceType = document.getElementById('device-type').value;
    const trainingType = document.getElementById('training-type').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const people = parseInt(document.getElementById('people-count').value);

    if (!deviceType || !trainingType || !location || !date || !time) {
        showNotification('Заполните все обязательные поля!', 'error');
        return;
    }

    const bookingDateTime = new Date(`${date}T${time}`);
    const minDateTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);

    if (bookingDateTime < minDateTime) {
        showNotification('Бронирование возможно не раньше чем через 2 часа от текущего времени!', 'error');
        return;
    }

    let clientId, clientName;
    if (user.role === 'admin') {
        const clientSelect = document.getElementById('booking-client');
        const selectedClientId = parseInt(clientSelect.value);

        if (!selectedClientId) {
            showNotification('Выберите клиента для бронирования!', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const client = users.find(u => u.id === selectedClientId);

        if (!client) {
            showNotification('Выбранный клиент не найден!', 'error');
            return;
        }

        clientId = selectedClientId;
        clientName = client.name;
    } else {
        clientId = user.id;
        clientName = user.name;
    }

    const newBooking = {
        id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
        clientId: clientId,
        clientName: clientName,
        device: deviceType,
        deviceName: document.getElementById('device-type').selectedOptions[0].text,
        trainingType: trainingType,
        location: location,
        locationName: document.getElementById('location').selectedOptions[0].text,
        date: date,
        time: time,
        people: people,
        payment: document.querySelector('input[name="payment"]:checked').value,
        status: 'active',
        instructorId: 2,
        instructorName: "Алексей Смирнов",
        hours: trainingType === 'individual' ? 2 : 3
    };

    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    showNotification('Бронирование успешно создано!', 'success');
    clearBookingForm();
    updateDashboard();
    loadRecentBookings();
    showSection('dashboard');
}

function clearBookingForm() {
    document.getElementById('booking-form').reset();
    setupBookingForm();
}

function showBookingDetails(id) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.id === id);

    if (booking) {
        const detailsContent = document.getElementById('booking-details-content');
        detailsContent.innerHTML = `
            <div class="booking-detail">
                <strong>Устройство:</strong> ${booking.deviceName}
            </div>
            <div class="booking-detail">
                <strong>Дата и время:</strong> ${booking.date} ${booking.time}
            </div>
            <div class="booking-detail">
                <strong>Тип обучения:</strong> ${booking.trainingType === 'individual' ? 'Индивидуальное' : 'Групповое'}
            </div>
            <div class="booking-detail">
                <strong>Площадка:</strong> ${booking.locationName}
            </div>
            <div class="booking-detail">
                <strong>Количество человек:</strong> ${booking.people}
            </div>
            <div class="booking-detail">
                <strong>Клиент:</strong> ${booking.clientName}
            </div>
            <div class="booking-detail">
                <strong>Инструктор:</strong> ${booking.instructorName}
            </div>
            <div class="booking-detail">
                <strong>Статус:</strong> ${booking.status === 'active' ? 'Активно' : 'Отменено'}
            </div>
            <div class="booking-detail">
                <strong>Оплата:</strong> ${getPaymentType(booking.payment)}
            </div>
            <div class="form-buttons" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal('booking-details-modal')">
                    Закрыть
                </button>
            </div>
        `;

        showModal('booking-details-modal');
    }
}

function getPaymentType(payment) {
    switch (payment) {
        case 'course': return 'Весь курс';
        case 'month': return 'Месяц';
        case 'day': return 'Один день';
        case 'freeze': return 'Заморозить';
        default: return 'Не указано';
    }
}

function cancelBooking(id) {
    if (!confirm('Вы уверены, что хотите отменить это бронирование?')) {
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'cancelled';
        localStorage.setItem('bookings', JSON.stringify(bookings));

        showNotification('Бронирование отменено', 'success');
        loadRecentBookings();
        updateDashboard();

        if (document.getElementById('schedule-section').classList.contains('active')) {
            loadSchedule();
        }
    }
}


function loadSchedule() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    let filteredBookings = bookings.filter(b => b.status !== 'cancelled');

    if (user.role === 'client') {
        filteredBookings = filteredBookings.filter(b => b.clientId === user.id);
    }

    const scheduleBody = document.getElementById('schedule-body');
    scheduleBody.innerHTML = '';

    filteredBookings.forEach(booking => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-cell">${booking.clientName}</div>
            <div class="table-cell">${booking.deviceName}</div>
            <div class="table-cell">${booking.date} ${booking.time}</div>
            <div class="table-cell">${booking.locationName}</div>
            <div class="table-cell">
                <span class="${booking.status === 'active' ? 'status-confirmed' : 'status-pending'}">
                    ${booking.status === 'active' ? 'Подтверждено' : 'Завершено'}
                </span>
            </div>
            <div class="table-cell">
                <button class="btn-small" onclick="showBookingDetails(${booking.id})">
                    Просмотр
                </button>
                ${user.role === 'admin' || booking.clientId === user.id ?
                `<button class="btn-small btn-cancel" onclick="cancelBooking(${booking.id})">
                        Отменить
                    </button>` : ''
            }
            </div>
        `;
        scheduleBody.appendChild(row);
    });
}

function searchSchedule() {
    const searchTerm = document.getElementById('schedule-search').value.toLowerCase();
    const rows = document.querySelectorAll('#schedule-body .table-row');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? 'grid' : 'none';
    });
}

function showScheduleFilterModal() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const instructorSelect = document.getElementById('schedule-filter-instructor');
    instructorSelect.innerHTML = '<option value="">Все инструкторы</option>';

    if (user.role === 'admin') {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const instructors = users.filter(u => u.role === 'instructor');

        instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = instructor.name;
            instructorSelect.appendChild(option);
        });
    }

    showModal('schedule-filter-modal');
}

function applyScheduleFilter() {
    const device = document.getElementById('schedule-filter-device').value;
    const location = document.getElementById('schedule-filter-location').value;
    const instructorId = document.getElementById('schedule-filter-instructor').value;

    const rows = document.querySelectorAll('#schedule-body .table-row');

    rows.forEach(row => {
        let show = true;

        const deviceCell = row.querySelector('.table-cell:nth-child(2)');
        const locationCell = row.querySelector('.table-cell:nth-child(4)');

        if (device && device !== '') {
            const deviceText = deviceCell ? deviceCell.textContent.toLowerCase() : '';
            show = show && deviceText.includes(device.toLowerCase());
        }

        if (location && location !== '') {
            const locationText = locationCell ? locationCell.textContent.toLowerCase() : '';
            show = show && locationText.includes(location.toLowerCase());
        }


        row.style.display = show ? 'grid' : 'none';
    });

    closeModal('schedule-filter-modal');
    showNotification('Фильтр применен', 'success');
}

function showSortScheduleModal() {
    showModal('sort-schedule-modal');
}

function applyScheduleSort() {
    const sortBy = document.getElementById('sort-schedule-by').value;
    const scheduleBody = document.getElementById('schedule-body');
    const rows = Array.from(scheduleBody.children);

    rows.sort((a, b) => {
        const dateA = a.querySelector('.table-cell:nth-child(3)').textContent;
        const dateB = b.querySelector('.table-cell:nth-child(3)').textContent;

        switch (sortBy) {
            case 'date':
                return new Date(dateB) - new Date(dateA);
            case 'date-old':
                return new Date(dateA) - new Date(dateB);
            case 'device':
                const deviceA = a.querySelector('.table-cell:nth-child(2)').textContent;
                const deviceB = b.querySelector('.table-cell:nth-child(2)').textContent;
                return deviceA.localeCompare(deviceB);
            case 'client':
                const clientA = a.querySelector('.table-cell:nth-child(1)').textContent;
                const clientB = b.querySelector('.table-cell:nth-child(1)').textContent;
                return clientA.localeCompare(clientB);
            default:
                return 0;
        }
    });

    rows.forEach(row => scheduleBody.appendChild(row));

    closeModal('sort-schedule-modal');
    showNotification('Сортировка применена', 'success');
}

function loadInstructorSchedule() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    const instructorBookings = bookings.filter(b =>
        b.instructorId === user.id &&
        b.status !== 'cancelled'
    );

    const scheduleBody = document.getElementById('instructor-schedule-body');
    scheduleBody.innerHTML = '';

    instructorBookings.forEach(booking => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-cell">${booking.date}</div>
            <div class="table-cell">${booking.time}</div>
            <div class="table-cell">${booking.deviceName}</div>
            <div class="table-cell">${booking.clientName}</div>
            <div class="table-cell">${booking.trainingType === 'individual' ? 'Индивидуальное' : 'Групповое'}</div>
            <div class="table-cell">
                <button class="btn-small" onclick="showBookingDetails(${booking.id})">
                    Просмотр
                </button>
            </div>
        `;
        scheduleBody.appendChild(row);
    });
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersBody = document.getElementById('users-body');
    usersBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-cell">${user.name}</div>
            <div class="table-cell">${user.phone}</div>
            <div class="table-cell">
                ${user.role === 'client' ? 'Клиент' :
                user.role === 'instructor' ? 'Инструктор' : 'Администратор'}
            </div>
            <div class="table-cell">${user.isVip ? 'Да' : 'Нет'}</div>
            <div class="table-cell">${user.discount || 0}%</div>
            <div class="table-cell">
                ${user.role === 'client' ?
                `<button class="btn-small" onclick="editClient(${user.id})">
                        Редактировать
                    </button>` : ''
            }
                ${user.role !== 'admin' ?
                `<button class="btn-small btn-cancel" onclick="deleteUser(${user.id})">
                        Удалить
                    </button>` : ''
            }
            </div>
        `;
        usersBody.appendChild(row);
    });
}

function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const rows = document.querySelectorAll('#users-body .table-row');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? 'grid' : 'none';
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function showRegisterModal() {
    document.getElementById('register-name').value = '';
    document.getElementById('register-phone').value = '';
    document.getElementById('register-password').value = '';
    showModal('register-modal');
}

function registerUser() {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    if (!name || !phone || !password) {
        showNotification('Заполните все поля!', 'error');
        return;
    }

    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
        showNotification('Пользователь с таким телефоном уже существует!', 'error');
        return;
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: name,
        phone: phone,
        role: 'client',
        password: password,
        isVip: false,
        discount: 0,
        subscription: 'active',
        bookingsCount: 0
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    closeModal('register-modal');
    loadUsers();
    showNotification('Пользователь успешно зарегистрирован!', 'success');
}

function editClient(id) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const client = users.find(u => u.id === id && u.role === 'client');

    if (client) {
        document.getElementById('edit-client-id').value = client.id;
        document.getElementById('edit-client-name').value = client.name;
        document.getElementById('edit-client-phone').value = client.phone;
        document.getElementById('edit-client-vip').checked = client.isVip || false;
        document.getElementById('edit-client-discount').value = client.discount || 0;
        document.getElementById('edit-client-subscription').value = client.subscription || 'active';

        showModal('edit-client-modal');
    }
}

function saveClientEdit() {
    const clientId = parseInt(document.getElementById('edit-client-id').value);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const clientIndex = users.findIndex(u => u.id === clientId);

    if (clientIndex !== -1) {
        users[clientIndex].name = document.getElementById('edit-client-name').value;
        users[clientIndex].phone = document.getElementById('edit-client-phone').value;
        users[clientIndex].isVip = document.getElementById('edit-client-vip').checked;
        users[clientIndex].discount = parseInt(document.getElementById('edit-client-discount').value) || 0;
        users[clientIndex].subscription = document.getElementById('edit-client-subscription').value;

        localStorage.setItem('users', JSON.stringify(users));

        closeModal('edit-client-modal');
        loadUsers();
        showNotification('Данные клиента обновлены!', 'success');
    }
}

function deleteUser(id) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        showNotification('Пользователь удален!', 'success');
    }
}

function applyDiscount() {
    const type = document.getElementById('discount-type').value;
    const value = parseInt(document.getElementById('discount-value').value);

    const users = JSON.parse(localStorage.getItem('users')) || [];

    users.forEach(user => {
        if (user.role === 'client') {
            if ((type === 'vip' && user.isVip) || type === 'regular') {
                user.discount = value;
                if (value > 0) {
                    user.isVip = true;
                }
            }
        }
    });

    localStorage.setItem('users', JSON.stringify(users));
    showNotification(`Скидка ${value}% применена к ${type === 'vip' ? 'VIP-клиентам' : 'постоянным клиентам'}!`, 'success');
}


function loadStatistics() {
    const period = document.getElementById('stat-period').value;
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];


    const now = new Date();
    let startDate = new Date();

    switch (period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
    }

    const filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= startDate && bookingDate <= now && b.status !== 'cancelled';
    });

    const deviceHours = filteredBookings.reduce((sum, b) => sum + (b.hours || 0), 0);
    const instructorHours = filteredBookings.reduce((sum, b) => sum + (b.hours || 0), 0);
    const totalClients = new Set(filteredBookings.map(b => b.clientId)).size;
    const vipClients = users.filter(u => u.isVip && u.role === 'client').length;

    document.getElementById('stat-device-hours').textContent = deviceHours;
    document.getElementById('stat-instructor-hours').textContent = instructorHours;
    document.getElementById('stat-total-clients').textContent = totalClients;
    document.getElementById('stat-vip-clients').textContent = vipClients;
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (user) {
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-phone').value = user.phone;

        const subscriptionSection = document.getElementById('subscription-section');
        const freezeProfileBtn = document.getElementById('freeze-profile-btn');

        if (user.role === 'client') {
            subscriptionSection.style.display = 'block';
            freezeProfileBtn.style.display = 'block';
            document.getElementById('profile-subscription').value = user.subscription || 'active';
        } else {
            subscriptionSection.style.display = 'none';
            freezeProfileBtn.style.display = 'none';
        }
    }
}

function updateProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex].name = document.getElementById('profile-name').value;
        users[userIndex].phone = document.getElementById('profile-phone').value;

        if (user.role === 'client') {
            users[userIndex].subscription = document.getElementById('profile-subscription').value;
        }

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));

        showNotification('Профиль успешно обновлен!', 'success');
        updateDashboard();
    }
}

function freezeSubscription() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1 && user.role === 'client') {
        users[userIndex].subscription = 'frozen';
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));

        showNotification('Абонемент заморожен!', 'success');
        updateDashboard();
        loadProfile();
    }
}

window.onload = function () {
    initData();

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        showMainInterface();
    }

    setupBookingForm();

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
};