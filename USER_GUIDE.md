# Better Impact Notifier — Staff User Guide

Welcome! This system automatically monitors Better Impact for volunteer profile changes and sends you emails. It also updates the secure Volunteer Dashboard. This guide will help you understand how it works and how to manage it without needing to write or understand any code.

## 1. What does this system do?

The system runs on an automatic schedule (currently set to every 30 minutes). When it runs, it:
1. **Checks Better Impact:** Scans all active volunteers and looks at specific custom fields (Registration Form, Interview Outcome, HR Induction, Site Induction).
2. **Sends Immediate Alerts:** If a volunteer submits a Registration Form or completes an Induction step, the system immediately sends a notification email to the configured inbox.
3. **Sends a Daily Digest (8:00 AM):** Sends a single summary email of minor changes and lists any **Stalled Workflows** (e.g., someone submitted a form 5 days ago but hasn't had an interview outcome entered).
4. **Updates the Dashboard:** Refreshes the secure dashboard so you can see a live pipeline of where volunteers are in their onboarding journey.

## 2. Where does this system live?
The code and automation run on a cloud developer platform called **GitHub**. You do not need to run anything on your local computer; it operates entirely in the background 24/7.
- **Repository Location:** [GitHub](https://github.com/kiki286/bi_notifier).

## 3. How do I know if it's working?
- As long as you are receiving the automated emails, the system is working perfectly.
- You can also check your Volunteer Dashboard. In the **"System Health"** section at the bottom, it will show the time of the "Last Poll" (which should be within the last 30 minutes) and indicate if the API and Email systems are healthy.

## 4. How to manually check for updates right now
If you don't want to wait for the automatic 30-minute check, you can force the system to check immediately:
1. Open the GitHub Repository in your browser.
2. Click on the **Actions** tab at the top of the page.
3. On the left-hand menu, click the workflow named **Poll Better Impact**.
4. On the right side, click the **Run workflow** dropdown button, then click the green **Run workflow** button.
5. Wait about 30 seconds. If any changes occurred in Better Impact since the last check, you will receive an email.

## 5. Common Issues & How to Fix Them

### Issue: The Dashboard says the "API Status" or "Email Status" is failing, or emails have stopped arriving entirely.
**Possible Causes:**
1. **Better Impact Password Changed:** The Better Impact API uses "Basic Authentication," meaning it logs in with a username and password just like a human. If the Better Impact account used for this connection has its password changed or expires, the system is blocked. 
   - *Fix:* In GitHub go to *Settings -> Secrets and Variables -> Actions*, and update the `BI_API_PASSWORD` secret with the new password. If the script was using a personal account, you may want to create a generic "System" admin user in Better Impact to prevent this in the future!
2. **Email System Authentication Failure:** Emails are sent from the dedicated address `kwinana.volunteer.notifier@gmail.com` using a free Brevo service account tied to that same Gmail. If the SMTP key for Brevo expires, or the Gmail account is suspended, the system cannot send emails out.
   - *Fix:* Log into Brevo using `kwinana.volunteer.notifier@gmail.com`, generate a new SMTP key, go to GitHub *Settings -> Secrets and Variables -> Actions*, and update the `SMTP_PASSWORD` secret.
3. **GitHub Automation Paused:** If absolutely no code changes are made to the repository for 60 days, GitHub may temporarily pause the automated schedule.
   - *Fix:* Log into GitHub once every couple of months, go to the **Actions** tab. If you see a warning banner that workflows were disabled, simply click the "Enable workflow" button.

### Issue: The system is reporting a "Stalled Workflow", but we already advanced that volunteer!
**Possible Cause:**
The system bases its alerts on the **Custom Fields** in Better Impact. Even if you emailed or noted the volunteer elsewhere, if you forgot to update their "Supervisor Interview Outcome" dropdown or "HR Induction Date" field in Better Impact itself, the system will think they are still stuck.
- *Fix:* Go to the volunteer's Better Impact profile and verify the relevant date or outcome fields are properly filled out.

## 6. How do I change who receives the notification emails?
1. Log into GitHub and go to the repository.
2. Click **Settings** (the gear icon near the top right).
3. On the left menu, scroll down to **Secrets and variables** and click **Actions**.
4. Locate the `NOTIFY_EMAIL` variable and click the small pencil icon next to it.
5. Enter the new email address and save. The very next automated run will use this new address.

## 7. How to change which fields are monitored (Configuration)
If you add, delete, or rename Custom Fields in Better Impact (for example, if you change "Site Induction Date" to "OHS Form Date"), the system will stop tracking it unless you update the script's configuration.

1. Log into GitHub, go to the repository, and click on **`poll_better_impact.py`**.
2. Click the small pencil icon (Edit) in the top right corner of the file.
3. Near the top of the code (around line 40), you will see the **Configuration** section:
   ```python
   # Name of the custom field exactly as it appears in Better Impact
   HR_FIELD_NAME = "HR Induction Date"
   
   # Site Induction field — set to None to disable monitoring
   SITE_FIELD_NAME = "Site Induction Date"
   
   ...
   ```
4. Very carefully change the text inside the quotation marks to *perfectly match* the new name of the custom field in Better Impact. It is case-sensitive!
5. If you want to stop monitoring a specific pipeline step entirely, you can remove the quotation marks and set it to `None` like this: `SITE_FIELD_NAME = None`
6. Once you are done, click the green **Commit changes...** button at the top right, write a short message explaining what you changed, and commit directly to the `main` branch.

## 8. Additional Resources
- For more deep-dive or technical information about how Better Impact links its data, you can refer to their official documentation here: [Better Impact API Documentation](https://support.betterimpact.com/en/articles/9824270-api)
