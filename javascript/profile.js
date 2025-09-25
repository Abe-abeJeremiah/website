document.addEventListener('DOMContentLoaded', () => {
    const profileImage = document.getElementById('profileImage');
    const imageUpload = document.getElementById('imageUpload');
    const editImageBtn = document.getElementById('editImageBtn');
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');
    const editInfoBtn = document.getElementById('editInfoBtn');
    const editModal = document.getElementById('editModal');
    const closeButton = editModal.querySelector('.close-button');
    const nameInput = document.getElementById('nameInput');
    const bioInput = document.getElementById('bioInput');
    const saveInfoBtn = document.getElementById('saveInfoBtn');

    // Load saved data (if any)
    const savedName = localStorage.getItem('profileName');
    const savedBio = localStorage.getItem('profileBio');
    const savedImage = localStorage.getItem('profileImage');

    if (savedName) {
        profileName.textContent = savedName;
    }
    if (savedBio) {
        profileBio.textContent = savedBio;
    }
    if (savedImage) {
        profileImage.src = savedImage;
    }

    // Change Profile Picture
    editImageBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage.src = e.target.result;
                localStorage.setItem('profileImage', e.target.result); // Save to local storage
            };
            reader.readAsDataURL(file);
        }
    });

    // Edit Info Modal
    editInfoBtn.addEventListener('click', () => {
        editInfoBtn.classList.add('animate-click'); // Add animation class
        setTimeout(() => {
            editInfoBtn.classList.remove('animate-click'); // Remove class after animation
            nameInput.value = profileName.textContent;
            bioInput.value = profileBio.textContent;
            editModal.style.display = 'block';
        }, 300); // Match the animation duration
    });

    closeButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // Save Edited Info
    saveInfoBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        const newBio = bioInput.value.trim();

        if (newName) {
            profileName.textContent = newName;
            localStorage.setItem('profileName', newName); // Save to local storage
        }
        if (newBio) {
            profileBio.textContent = newBio;
            localStorage.setItem('profileBio', newBio); // Save to local storage
        }

        editModal.style.display = 'none';
    });
});