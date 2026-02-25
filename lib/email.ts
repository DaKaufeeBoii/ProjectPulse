import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? 'ProjectPulse <onboarding@resend.dev>';

export async function sendVerificationEmail(to: string, code: string, name: string) {
    if (!process.env.RESEND_API_KEY) {
        // Fallback: log to console if no API key set
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📬  ProjectPulse — Email Verification');
        console.log(`   To: ${to}`);
        console.log(`   Code: ${code}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return;
    }

    await resend.emails.send({
        from: FROM,
        to,
        subject: 'Your ProjectPulse verification code',
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Project<span style="color:#7c6aff;">Pulse</span></span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#fff;font-size:18px;font-weight:600;margin:0 0 8px;">Hi ${name} 👋</p>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 32px;line-height:1.6;">
                Thanks for signing up! Use the code below to verify your email address.
              </p>
              <!-- Code box -->
              <div style="background:#1a1a28;border:1px solid rgba(124,106,255,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Verification Code</p>
                <span style="font-size:40px;font-weight:700;color:#7c6aff;letter-spacing:8px;">${code}</span>
              </div>
              <p style="color:rgba(255,255,255,0.35);font-size:13px;margin:0;">
                This code expires in 24 hours. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">ProjectPulse · AI-Powered Project Management</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
}
