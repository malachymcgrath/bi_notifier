document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    // Refresh data every 5 minutes in background
    setInterval(fetchData, 5 * 60 * 1000);
});

let dashboardData = {};

async function fetchData() {
    try {
        const timestamp = new Date().getTime(); // prevent caching
        const res = await fetch(`dashboard.json?t=${timestamp}`);
        if (!res.ok) throw new Error("Dashboard data not found");
        
        const data = await res.json();
        updateUI(data);
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        document.getElementById('api-status-text').innerText = "Disconnected";
        document.getElementById('api-status-badge').classList.add('error');
    }
}

function updateUI(data) {
    dashboardData = data; // store globally for modal access

    // 1. Workflow Metrics (Graceful fallback)
    const newApps = data.workflow_status.new_applications;
    const awaitHr = data.workflow_status.awaiting_hr_induction;
    const awaitSite = data.workflow_status.awaiting_site_induction;

    document.getElementById('val-new-apps').innerText = Array.isArray(newApps) ? newApps.length : (newApps || 0);
    document.getElementById('val-awaiting-hr').innerText = Array.isArray(awaitHr) ? awaitHr.length : (awaitHr || 0);
    document.getElementById('val-awaiting-site').innerText = Array.isArray(awaitSite) ? awaitSite.length : (awaitSite || 0);

    // 2. Health Tags
    const apiBadge = document.getElementById('api-status-badge');
    const apiText = document.getElementById('api-status-text');
    if (data.system_health.api_status_ok) {
        apiBadge.classList.remove('error');
        apiText.innerText = "Connected";
    } else {
        apiBadge.classList.add('error');
        apiText.innerText = "Error";
    }

    const emailBadge = document.getElementById('email-status-badge');
    const emailText = document.getElementById('email-status-text');
    if (data.system_health.email_status_ok) {
        emailBadge.classList.remove('error');
        emailText.innerText = "Operational";
    } else {
        emailBadge.classList.add('error');
        emailText.innerText = "Failing";
    }

    document.getElementById('last-poll-time').innerText = formatDate(data.system_health.last_poll_time);

    // 3. Activity Lists
    renderList('recent-changes-list', data.recent_activity.field_changes, (item) => {
        return `
            <div class="activity-name">${item.volunteer_name}</div>
            <div class="activity-detail"><strong>${item.field_name}</strong>: <em>'${item.old_value || '(empty)'}'</em> &rarr; <em>'${item.new_value}'</em></div>
            <div class="activity-time">${formatDate(item.timestamp)}</div>
        `;
    });

    renderList('recent-forms-list', data.recent_activity.form_submissions, (item) => {
        return `
            <div class="activity-name">${item.volunteer_name}</div>
            <div class="activity-detail">Submitted <strong>${item.field_name}</strong></div>
            <div class="activity-time">${formatDate(item.timestamp)}</div>
        `;
    });
}

function renderList(elementId, items, templateFn) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    
    if (!items || items.length === 0) {
        el.innerHTML = '<li><span class="activity-detail">No recent activity found.</span></li>';
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = templateFn(item);
        el.appendChild(li);
    });
}

function formatDate(isoString) {
    if (!isoString) return "--/--/----";
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ──────────────────────────────────────────────
// Modal Interaction Logic
// ──────────────────────────────────────────────

document.getElementById('card-new-apps')?.addEventListener('click', () => {
    openModal("New Applications", dashboardData?.workflow_status?.new_applications);
});
document.getElementById('card-awaiting-hr')?.addEventListener('click', () => {
    openModal("Awaiting HR Induction", dashboardData?.workflow_status?.awaiting_hr_induction);
});
document.getElementById('card-awaiting-site')?.addEventListener('click', () => {
    openModal("Awaiting Site Induction", dashboardData?.workflow_status?.awaiting_site_induction);
});

document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('users-modal').classList.remove('active');
});

// Close when clicking outside of modal content
document.getElementById('users-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('users-modal')) {
        document.getElementById('users-modal').classList.remove('active');
    }
});

function openModal(title, namesArray) {
    document.getElementById('modal-title').innerText = title;
    const listEl = document.getElementById('modal-list');
    listEl.innerHTML = '';
    
    if (!Array.isArray(namesArray) || namesArray.length === 0) {
        listEl.innerHTML = '<li><span class="activity-detail" style="color: #94a3b8;">No volunteers found in this status (or backend updating...).</span></li>';
    } else {
        namesArray.forEach(name => {
            const li = document.createElement('li');
            // Adding a simple profile-like icon dot
            li.innerHTML = `<span style="display:inline-block; width:8px; height:8px; background:#3b82f6; border-radius:50%; margin-right:10px;"></span> ${name}`;
            listEl.appendChild(li);
        });
    }
    
    document.getElementById('users-modal').classList.add('active');
}
