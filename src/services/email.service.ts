import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendVerificationEmail(email: string, code: string) {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY non configurée');
      }

      console.log("Configuration de Resend:", {
        apiKeyExists: !!process.env.RESEND_API_KEY,
        emailTo: email,
        code: code
      });

      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Vérification de votre compte ImmoTogo',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bienvenue sur ImmoTogo !</h2>
            <p>Voici votre code de vérification :</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
              <strong>${code}</strong>
            </div>
            <p>Ce code expirera dans 15 minutes.</p>
            <p>Si vous n'avez pas créé de compte sur ImmoTogo, ignorez cet email.</p>
          </div>
        `
      });

      if (error) {
        console.error("Erreur Resend:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur détaillée d\'envoi d\'email:', error);
      return { success: false, error };
    }
  }
} 