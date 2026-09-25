import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def _send_email(to_email: str, subject: str, html_content: str):
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning(f"SMTP Credentials not configured. Skipping email to {to_email}.")
        return

    from_email = settings.EMAILS_FROM_EMAIL or settings.SMTP_USERNAME

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email successfully sent to {to_email} via SMTP")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email} via SMTP: {e}")

def send_password_reset_email(email: str, token: str):
    reset_link = f"http://localhost:8090/reset-password?token={token}"
    subject = "Reset Your Password - Enterprise IMS"
    html_content = f"""
    <h2>Reset Your Password</h2>
    <p>You requested to reset your password.</p>
    <p>Click the link below to set a new password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    """
    _send_email(email, subject, html_content)

def send_ticket_assigned_email(agent_email: str, ticket_title: str):
    subject = "New Ticket Assigned - Enterprise IMS"
    html_content = f"""
    <h2>Ticket Assigned to You</h2>
    <p>You have been assigned to a new ticket:</p>
    <h3>{ticket_title}</h3>
    <p>Please log in to the IMS Support Portal to view the details and update the status.</p>
    <a href="http://localhost:8090/support/dashboard">View Dashboard</a>
    """
    _send_email(agent_email, subject, html_content)

def send_new_ticket_created_email(admin_email: str, ticket_title: str, staff_name: str):
    subject = "New Incident Raised - Enterprise IMS"
    html_content = f"""
    <h2>New Incident Raised</h2>
    <p>A new incident has been raised by <strong>{staff_name}</strong>.</p>
    <h3>{ticket_title}</h3>
    <p>Please log in to the IMS Admin Portal to triage and assign this ticket.</p>
    <a href="http://localhost:8090/admin/incidents">Manage Incidents</a>
    """
    _send_email(admin_email, subject, html_content)
