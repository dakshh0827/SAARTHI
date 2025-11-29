/*
 * =====================================================
 * backend/services/email.service.js (FIXED)
 * =====================================================
 */
import transporter from "../config/email.js";
import logger from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = transporter;
  }

  async sendOTP(to, otp, purpose = "verification") {
    // 1. DEV MODE: Always log OTP to console for easy testing
    if (process.env.NODE_ENV === "development") {
      logger.info("=================================================");
      logger.info(`[DEV MODE] Mock Sending Email`);
      logger.info(`To: ${to}`);
      logger.info(`Purpose: ${purpose}`);
      logger.info(`OTP: ${otp}`);
      logger.info("=================================================");

      // If we don't have a real transporter, return true to simulate success
      if (!this.transporter) return true;
    }

    // 2. CHECK TRANSPORTER
    if (!this.transporter) {
      logger.warn(
        `[EmailService] Email suppressed. No SMTP credentials configured.`
      );
      return false;
    }

    // 3. REAL EMAIL SENDING
    const subject =
      purpose === "login"
        ? "Your Login OTP - Saarthi"
        : "Verify your Email - Saarthi";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #4F46E5; letter-spacing: 5px; background: #EEF2FF; padding: 10px; text-align: center; border-radius: 8px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    // FIXED: Use the correct variable name from your .env
    const fromAddress =
      process.env.SMTP_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      "noreply@saarthi.com";

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html,
    };

    try {
      logger.info(`📧 Sending email from: ${fromAddress} to: ${to}`);
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error sending OTP email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendWelcomeEmail(to, name) {
    const fromAddress = process.env.SMTP_FROM_EMAIL || "noreply@saarthi.com";

    if (process.env.NODE_ENV === "development") {
      logger.info(`[DEV MODE] Welcome email simulated for ${to}`);
      if (!this.transporter) return true;
    }

    if (!this.transporter) return false;

    const mailOptions = {
      from: fromAddress,
      to,
      subject: "Welcome to Saarthi!",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>Welcome, ${name}!</h1>
          <p>Your email has been successfully verified.</p>
          <p>You can now access your dashboard.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error("Error sending welcome email:", error);
    }
  }
}

export default new EmailService();
