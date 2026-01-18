import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Email configuration from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USERNAME)

async def send_match_notification(
    recipient_email: str,
    recipient_name: str,
    pet_name: str,
    found_pet_image_url: Optional[str] = None,
    match_details: Optional[dict] = None
) -> bool:
    """
    Send email notification to the owner of a lost pet when a match is found.
    
    Args:
        recipient_email: Email of the person who reported the lost pet
        recipient_name: Name of the person who reported the lost pet
        pet_name: Name of the lost pet
        found_pet_image_url: URL of the found pet's image
        match_details: Additional match details (matched tags, location, etc.)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    
    # If email is not configured, log and return False
    if not EMAIL_USERNAME or not EMAIL_PASSWORD:
        print("⚠️ Email not configured (EMAIL_USERNAME/EMAIL_PASSWORD missing). Skipping email notification.")
        print(f"   Would send to: {recipient_email} for pet: {pet_name}")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🎉 Potential Match Found for {pet_name}!"
        msg['From'] = EMAIL_FROM
        msg['To'] = recipient_email
        
        # Build email body
        matched_tags = match_details.get('matched_tags', []) if match_details else []
        tags_text = ', '.join(matched_tags) if matched_tags else "multiple characteristics"
        
        # HTML email body
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4CAF50;">🎉 Great News, {recipient_name}!</h2>
              
              <p>We found a potential match for <strong>{pet_name}</strong>!</p>
              
              <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Match Details:</h3>
                <ul style="margin: 10px 0;">
                  <li><strong>Matched characteristics:</strong> {tags_text}</li>
                  {f"<li><strong>Found location:</strong> {match_details.get('location', 'N/A')}</li>" if match_details and match_details.get('location') else ""}
                </ul>
              </div>
              
              {f'<p><a href="{found_pet_image_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">View Found Pet Images</a></p>' if found_pet_image_url else ""}
              
              <p>Please log in to your PetFinder account to review the match and contact the finder.</p>
              
              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Best regards,<br>
                The PetFinder Team
              </p>
            </div>
          </body>
        </html>
        """
        
        # Plain text version
        text_body = f"""
        Great News, {recipient_name}!
        
        We found a potential match for {pet_name}!
        
        Match Details:
        - Matched characteristics: {tags_text}
        {f"- Found location: {match_details.get('location', 'N/A')}" if match_details and match_details.get('location') else ""}
        
        {f"View found pet images: {found_pet_image_url}" if found_pet_image_url else ""}
        
        Please log in to your PetFinder account to review the match and contact the finder.
        
        Best regards,
        The PetFinder Team
        """
        
        # Attach parts
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email using SMTP
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Match notification email sent to {recipient_email} for {pet_name}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email notification: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
