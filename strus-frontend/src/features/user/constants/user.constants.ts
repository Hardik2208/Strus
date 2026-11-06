export const USER_QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  search: (query: string) => ['user', 'search', query] as const,
  usernameAvailability: (username: string) =>
    ['user', 'username', username] as const,
};

export const AVATAR_CONSTRAINTS = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// ISO 3166-1 alpha-2 country codes.
const COUNTRY_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`.trim().split(/\s+/);

const countryNames = new Intl.DisplayNames(['en'], {
  type: 'region',
});

export const COUNTRY_OPTIONS = COUNTRY_CODES
  .map((code) => ({
    code,
    name: countryNames.of(code) ?? code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const intlWithTimeZones = Intl as typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

const FALLBACK_TIMEZONES = [
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'America/Toronto',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Kolkata',
  'Asia/Kuala_Lumpur',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Melbourne',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Paris',
  'Pacific/Auckland',
  'UTC',
];

const supportedTimezones =
  typeof intlWithTimeZones.supportedValuesOf === 'function'
    ? intlWithTimeZones.supportedValuesOf('timeZone')
    : FALLBACK_TIMEZONES;

export const TIMEZONE_OPTIONS = Array.from(
  new Set([...supportedTimezones, 'UTC', 'Asia/Kolkata']),
).sort((a, b) => a.localeCompare(b));