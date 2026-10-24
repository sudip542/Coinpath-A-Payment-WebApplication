import Cookies from 'js-cookie';

const cookiePrefix = "ikoncloud_next_";

export interface CookieSessionOptionsProps {
  maxAge?: number,
  expires?: Date
}

export function setCookieSession(
  sessionName: string,
  data: string,
  options?: CookieSessionOptionsProps
) {
  // js-cookie only supports 'expires' (in days or Date)
  let expires: number | Date | undefined = options?.expires;
  if (!expires && options?.maxAge) {
    // Convert maxAge (seconds) to days for js-cookie
    expires = options.maxAge / 86400;
  }
  Cookies.set(cookiePrefix + sessionName, data, {
    httpOnly: false,
    sameSite: "lax",
    expires
  });
}

export function getCookieSession(
  sessionName: string
): string | undefined {
  const cookie = Cookies.get(cookiePrefix + sessionName);
  return cookie;
}

export function clearCookieSession(sessionName: string) {
  Cookies.remove(cookiePrefix + sessionName);
}

export async function clearAllCookieSession() {
  // const cookieStore = await cookies();
  // cookieStore.getAll().forEach((cookie) => {
  //   if (cookie.name.startsWith(cookiePrefix)) {
  //     cookieStore.delete(cookie.name);
  //   }
  // });

}
