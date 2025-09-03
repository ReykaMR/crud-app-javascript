const API_URL = 'http://localhost:3000/api/users';

const userForm = document.getElementById('userForm');
const userTable = document.getElementById('userTable');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const submitSpinner = document.getElementById('submitSpinner');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

document.addEventListener('DOMContentLoaded', initApp);
userForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);

nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);
phoneInput.addEventListener('input', validatePhone);

function initApp() {
    loadUsers();
}

function validateName() {
    const value = nameInput.value.trim();

    if (value.length < 2) {
        nameInput.classList.add('is-invalid');
        nameInput.classList.remove('is-valid');
        return false;
    } else {
        nameInput.classList.remove('is-invalid');
        nameInput.classList.add('is-valid');
        return true;
    }
}

function validateEmail() {
    const value = emailInput.value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        return false;
    } else {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
        return true;
    }
}

function validatePhone() {
    const value = phoneInput.value.trim();

    if (value === '') {
        phoneInput.classList.remove('is-invalid');
        phoneInput.classList.remove('is-valid');
        return true;
    }

    const phonePattern = /^[0-9]{10,15}$/;

    if (!phonePattern.test(value)) {
        phoneInput.classList.add('is-invalid');
        phoneInput.classList.remove('is-valid');
        return false;
    } else {
        phoneInput.classList.remove('is-invalid');
        phoneInput.classList.add('is-valid');
        return true;
    }
}

function validateForm() {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    return isNameValid && isEmailValid && isPhoneValid;
}

function showButtonLoading() {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
}

function hideButtonLoading() {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
}

function showLoading(message = 'Memproses...') {
    Swal.fire({
        title: message,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function hideLoading() {
    Swal.close();
}

async function loadUsers() {
    try {
        userTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Memuat data...</span>
                    </div>
                    <p class="mt-2">Memuat data pengguna</p>
                </td>
            </tr>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();

        userTable.innerHTML = '';

        if (users.length === 0) {
            userTable.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center py-4">
                                <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                                <p class="mt-2">Tidak ada data pengguna</p>
                                <button class="btn btn-sm btn-primary mt-2" onclick="resetForm()">
                                    <i class="bi bi-plus-circle"></i> Tambah Pengguna
                                </button>
                            </td>
                        </tr>
                    `;
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${escapeHtml(user.name)}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>${user.phone ? escapeHtml(user.phone) : '-'}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                            <button class="btn btn-sm btn-warning btn-action" onclick="editUser(${user.id})">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="deleteUser(${user.id})">
                                <i class="bi bi-trash"></i> Hapus
                            </button>
                        </td>
                    `;
            userTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        userTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-danger">
                            <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                            <p class="mt-2">Gagal memuat data pengguna</p>
                            <button class="btn btn-sm btn-primary mt-2" onclick="loadUsers()">
                                <i class="bi bi-arrow-clockwise"></i> Coba Lagi
                            </button>
                        </td>
                    </tr>
                `;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        Swal.fire({
            icon: 'error',
            title: 'Data tidak valid',
            text: 'Harap periksa kembali data yang Anda masukkan',
            showConfirmButton: true
        });
        return;
    }

    const userId = document.getElementById('userId').value;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const userData = { name, email, phone: phone || null };

    try {
        showButtonLoading();

        let response;
        let url = API_URL;
        let method = 'POST';

        if (userId) {
            url = `${API_URL}/${userId}`;
            method = 'PUT';
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: `Pengguna berhasil ${userId ? 'diperbarui' : 'ditambahkan'}`,
                showConfirmButton: true,
                timer: 3000
            });

            resetForm();
            loadUsers();
        } else {
            throw new Error(data.error || 'Terjadi kesalahan');
        }
    } catch (error) {
        console.error('Error saving user:', error);

        let errorMessage = 'Gagal menyimpan data pengguna';

        if (error.message.includes('Email already exists')) {
            errorMessage = 'Email sudah digunakan oleh pengguna lain';
        } else if (error.message) {
            errorMessage = error.message;
        }

        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            showConfirmButton: true
        });
    } finally {
        hideButtonLoading();
    }
}

async function editUser(id) {
    try {
        showLoading('Memuat data pengguna...');

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();

        document.getElementById('userId').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';

        validateName();
        validateEmail();
        validatePhone();

        formTitle.textContent = 'Edit Pengguna';
        cancelBtn.classList.remove('d-none');

        userForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

        hideLoading();
    } catch (error) {
        console.error('Error loading user for edit:', error);
        hideLoading();

        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal memuat data pengguna untuk diedit',
            showConfirmButton: true
        });
    }
}

async function deleteUser(id) {
    try {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            showLoading('Menghapus pengguna...');

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Pengguna berhasil dihapus.',
                    showConfirmButton: true,
                    timer: 3000
                });

                loadUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal menghapus pengguna');
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        hideLoading();

        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Gagal menghapus pengguna',
            showConfirmButton: true
        });
    }
}

function resetForm() {
    userForm.reset();
    document.getElementById('userId').value = '';
    formTitle.textContent = 'Tambah Pengguna Baru';
    cancelBtn.classList.add('d-none');

    nameInput.classList.remove('is-invalid', 'is-valid');
    emailInput.classList.remove('is-invalid', 'is-valid');
    phoneInput.classList.remove('is-invalid', 'is-valid');

    document.getElementById('name').focus();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}