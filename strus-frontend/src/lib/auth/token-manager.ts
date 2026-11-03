export const tokenManager = {
  getAccessToken: () => sessionStorage.getItem("strus_access_token"),
  getRefreshToken: () => sessionStorage.getItem("strus_refresh_token"),
  setTokens: (accessToken: string, refreshToken: string) => {
    sessionStorage.setItem("strus_access_token", accessToken);
    sessionStorage.setItem("strus_refresh_token", refreshToken);
  },
  clearTokens: () => {
    sessionStorage.removeItem("strus_access_token");
    sessionStorage.removeItem("strus_refresh_token");
  }
};
