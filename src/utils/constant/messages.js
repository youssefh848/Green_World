const generateMessage = (entity) => ({
  alreadyExist: `${entity} already exist`,
  notExist: `${entity} not found`,
  created: `${entity} created successfully`,
  failToCreate: `Failed to create ${entity}`,
  updated: `${entity} updated successfully`,
  failToUpdate: `Failed to update ${entity}`,
  deleted: `${entity} deleted successfully`,
  failToDelete: `Failed to delete ${entity}`,
  fetchedSuccessfully: `${entity} fetched successfully`,
  failToFetch: `Failed to fetch ${entity}`,
});

export const messages = {
  file: { required: "file is required" },
  user: {
    ...generateMessage("user"),
    verified: "user verified successfully",
    invalidCredntiols: "invalid credentials",
    notVerified: "Your account is not verified. Please check your email and click the verification link to activate your account.",
    invalidToken: "invalid token",
    loginSuccessfully: "login successfully",
    unauthorized: "unauthorized to access this API",
    invalidPassword: "invalid password",
    passwordUpdated: "password updated successfully",
    invalidOTP: "invalid OTP",
    failToUpdatePassword: "failed to update password",
    noAccountsFound: "no accounts found",
    otpSent: "OTP sent successfully",
    cannotDeletAdmin: "Cannot delete an admin account!",
    otpVerified: "OTP verified successfully, you can now login with your credentials",
  },
  plant: {
    ...generateMessage("plant"),
  },
};
