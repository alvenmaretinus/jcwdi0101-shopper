export function getVerificationTemplate(url: string) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Our App!</h2>
        <p>Please click the button below to verify your account:</p>
        <a href="${url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If the button doesn't work, copy this link: ${url}</p>
      </div>
    `;
}
