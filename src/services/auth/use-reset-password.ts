export async function resetPassword(email: string, newPassword: string, confirmPassword: string) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword, confirmPassword }),
  });

  const data = await res.json();
  if (!res.ok || data.status === 0) {
    throw new Error(data.message || "Password reset failed");
  }

  return data;
}

export async function sendResetOtp(email: string) {
  const res = await fetch("/api/auth/reset-password/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok || data?.status !== 1) throw new Error(data?.message || "Failed to send OTP");
  return data;
}

export async function verifyResetOtp(email: string, otp: string) {
  const res = await fetch("/api/auth/reset-password/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok || data?.status !== 1) throw new Error(data?.message || "OTP verification failed");
  return data;
}
