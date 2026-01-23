export function getResetPasswordTemplate(url: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${url}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If the button doesn't work, copy this link: ${url}</p>
    </div>
  `;
}
