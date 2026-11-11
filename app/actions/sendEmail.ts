
"use server";

import nodemailer from "nodemailer";

type SendEmailResult = {
  success: boolean;
  message: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

export async function sendEmail(
  formData: FormData
): Promise<SendEmailResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const isAccepted = formData.get("privacy-accept") === "on";

  // Honeypot
  if (formData.get("website")) {
    return {
      success: false,
      message: "Form gönderilemedi.",
    };
  }

  // SERVER-SIDE VALIDATION
  if (
    name.length < 2 ||
    name.length > 120 ||
    message.length < 10 ||
    message.length > 5000 ||
    !isAccepted
  ) {
    return {
      success: false,
      message: "Lütfen form alanlarını kontrol ediniz.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(email) ||
    email.length > 254
  ) {
    return {
      success: false,
      message: "Geçerli bir e-posta adresi giriniz.",
    };
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    CONTACT_EMAIL,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !CONTACT_EMAIL
  ) {
    console.error("SMTP settings are missing.");

    return {
      success: false,
      message: "E-posta servisi şu anda kullanılamıyor.",
    };
  }

  const port = Number(SMTP_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return {
      success: false,
      message: "E-posta yapılandırması geçersiz.",
    };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: {
        name: "RDM Hukuk Web Sitesi",
        address: SMTP_USER,
      },

      to: CONTACT_EMAIL,

      replyTo: {
        name,
        address: email,
      },

      subject: "Yeni İletişim Talebi",

      text: [
        "RDM Hukuk web sitesinden yeni iletişim talebi",
        "",
        `Ad Soyad: ${name}`,
        `E-posta: ${email}`,
        "",
        "Mesaj:",
        message,
      ].join("\n"),

      html: `
        <!DOCTYPE html>
        <html lang="tr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport"
                  content="width=device-width, initial-scale=1" />
          </head>

          <body style="
            margin:0;
            padding:30px 15px;
            background-color:#f6f6f6;
            font-family:Arial,Helvetica,sans-serif;
          ">
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              style="
                width:100%;
                max-width:600px;
                margin:0 auto;
                background:#ffffff;
                border-collapse:collapse;
              "
            >
              <tr>
                <td style="
                  background:#152741;
                  padding:28px;
                  text-align:center;
                ">
                  <h1 style="
                    color:#EFB059;
                    font-size:24px;
                    margin:0;
                  ">
                    RDM HUKUK
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px;">
                  <h2 style="
                    color:#152741;
                    font-size:20px;
                    margin:0 0 20px;
                  ">
                    Yeni İletişim Talebi
                  </h2>

                  <p style="color:#738595;">
                    Web sitesinden yeni bir iletişim
                    formu gönderildi.
                  </p>

                  <hr style="
                    border:0;
                    border-top:1px solid #dddddd;
                    margin:20px 0;
                  " />

                  <p>
                    <strong>Ad Soyad:</strong><br />
                    ${safeName}
                  </p>

                  <p>
                    <strong>E-posta:</strong><br />
                    ${safeEmail}
                  </p>

                  <p>
                    <strong>Mesaj:</strong>
                  </p>

                  <div style="
                    background:#F8FAFD;
                    padding:15px;
                    border-left:3px solid #EFB059;
                    color:#152741;
                    line-height:1.6;
                    overflow-wrap:anywhere;
                  ">
                    ${safeMessage}
                  </div>
                </td>
              </tr>

              <tr>
                <td style="
                  background:#8D9CA5;
                  padding:15px;
                  text-align:center;
                  font-size:12px;
                  color:#152741;
                ">
                  RDM Hukuk Bürosu
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (info.accepted.length === 0) {
      return {
        success: false,
        message: "E-posta sunucusu mesajı kabul etmedi.",
      };
    }

    return {
      success: true,
      message: "Mesajınız başarıyla gönderildi.",
    };
  } catch (error) {
    console.error("SMTP send error:", error);

    return {
      success: false,
      message:
        "Mesajınız gönderilemedi. Lütfen tekrar deneyiniz.",
    };
  }
}
