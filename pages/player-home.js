/* STORY 06 — Interface notation joueur (à implémenter) */
async function initPlayerHome(user) {
  document.getElementById('playerName').textContent = user.email;
  document.getElementById('mainContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>Module joueur — Story 06</p>
    </div>`;
}
