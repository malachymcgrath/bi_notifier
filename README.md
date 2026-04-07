# Better Impact — Induction Notification Script

Polls the Better Impact API every 30 minutes. When the **HR Induction Completed**
or **Site Induction Completed** custom field is filled in for a volunteer, an email
notification is automatically sent to the nominated supervisor.

Hosted free on GitHub Actions. No server required.

---

## Setup

### Step 1 — Create a private GitHub repository

Go to github.com → New repository → set it to **Private**.
Name it something like `kwinana-bi-notifier`.

Upload these files:
```
poll_better_impact.py
requirements.txt
.github/workflows/poll_better_impact.yml
```

### Step 2 — Create a Better Impact API key

In Better Impact: **Configuration → IT → API Keys → Create New Key**

- Give it a name (e.g. "Induction Notifier")
- Enable the **Volunteer** module
- Note down the username and password shown

### Step 3 — Add secrets to GitHub

In your GitHub repository go to **Settings → Secrets and variables → Actions → New repository secret**

Add each of the following:

| Secret name      | Value                                              |
|------------------|----------------------------------------------------|
| `BI_API_USERNAME`| Your Better Impact API key username                |
| `BI_API_PASSWORD`| Your Better Impact API key password                |
| `SMTP_HOST`      | Your mail server (e.g. `smtp.office365.com`)       |
| `SMTP_PORT`      | Usually `587` for TLS                              |
| `SMTP_USERNAME`  | The email address sending the notification         |
| `SMTP_PASSWORD`  | Password for that email address                    |
| `NOTIFY_EMAIL`   | Supervisor's email address to receive alerts       |

### Step 4 — Test it manually

Go to **Actions → Better Impact Induction Notifier → Run workflow**

Check the run log to confirm it connects to Better Impact and fetches profiles.
If there are no errors, the script is working.

### Step 5 — Verify the custom field names

Open `poll_better_impact.py` and confirm these two lines match the exact names
of your custom fields in Better Impact (case-insensitive, but spelling must match):

```python
HR_FIELD_NAME   = "HR Induction Completed"
SITE_FIELD_NAME = "Site Induction Completed"
```

To check field names in Better Impact: **Configuration → Custom Fields**

---

## How it works

1. Every 30 minutes GitHub Actions runs the script
2. The script fetches all volunteer profiles from Better Impact
3. It compares the current field values against `state.json` (the previous snapshot)
4. If HR Induction Completed or Site Induction Completed changed from empty to a date, an email is sent to the supervisor
5. The updated snapshot is committed back to the repo as `state.json`

---

## Adding more fields to monitor

Edit `poll_better_impact.py` and add field names to the `fields_to_monitor` list:

```python
fields_to_monitor = ["HR Induction Completed", "Site Induction Completed", "Interview Outcome"]
```

---

## Stopping the script

To pause notifications without deleting anything:
Go to **Actions → Better Impact Induction Notifier → ⋯ → Disable workflow**

---

## Microsoft 365 / Office API (optional)

If the City's IT policy requires sending email through the Microsoft Graph API
rather than SMTP, replace the `send_notification` function in `poll_better_impact.py`
with a Graph API call using a registered Azure AD application.
Contact the City's IT team for the client ID and tenant ID needed to set this up.
