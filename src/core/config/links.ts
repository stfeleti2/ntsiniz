import Constants from 'expo-constants';

export type PublicLinks = {
  appUrl: string;
  inviteUrlBase: string;
};

function readExtraString(key: string): string | undefined {
  const extra: any = (Constants as any)?.expoConfig?.extra ?? (Constants as any)?.manifest?.extra;
  const v = extra?.[key];
  return typeof v === 'string' && v.trim().length ? v.trim() : undefined;
}

/**
 * Public URLs used in share sheets and legal pages.
 * In production builds we fail fast if these are missing to avoid shipping broken links.
 */
export function getPublicLinks(): PublicLinks {
  const appUrl = readExtraString('publicAppUrl') ?? '';
  const inviteUrlBase = readExtraString('publicInviteUrlBase') ?? `${appUrl.replace(/\/$/, '')}/invite`;
  return { appUrl, inviteUrlBase };
}
