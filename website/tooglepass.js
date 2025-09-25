
function togglePassword(fieldId, iconDiv) {
  const field = document.getElementById(fieldId);
  const isHidden = field.type === 'password';
  field.type = isHidden ? 'text' : 'password';

  iconDiv.classList.toggle('showing', isHidden);
}

