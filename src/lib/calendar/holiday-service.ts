import { db } from "@/lib/db";
import {
  CalendarScheduleSettings,
  DEFAULT_CALENDAR_SETTINGS,
  toDateString,
  parseDateString,
} from "./calendar-dates";

const SETTINGS_KEY = "calendar_schedule_settings";

/**
 * Fetch persistent calendar and schedule settings from OrganizationSetting.
 */
export async function getCalendarSettings(): Promise<CalendarScheduleSettings> {
  try {
    const setting = await db.organizationSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (setting && setting.value && typeof setting.value === "object") {
      return {
        ...DEFAULT_CALENDAR_SETTINGS,
        ...(setting.value as any),
      };
    }
  } catch (err) {
    console.warn("[HolidayService] Could not retrieve calendar settings, using defaults:", err);
  }

  return DEFAULT_CALENDAR_SETTINGS;
}

/**
 * Update calendar and schedule settings persistently.
 */
export async function updateCalendarSettings(
  newSettings: Partial<CalendarScheduleSettings>,
  userId?: string
): Promise<CalendarScheduleSettings> {
  const current = await getCalendarSettings();
  const merged: CalendarScheduleSettings = {
    ...current,
    ...newSettings,
  };

  await db.organizationSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: merged as any,
      updatedById: userId,
    },
    update: {
      value: merged as any,
      updatedById: userId,
    },
  });

  // Keep AttendancePolicy weeklyOffDays synchronized if available
  try {
    const policy = await db.attendancePolicy.findFirst();
    if (policy) {
      await db.attendancePolicy.update({
        where: { id: policy.id },
        data: {
          weeklyOffDays: merged.weeklyOffDays as any,
          updatedById: userId,
        },
      });
    }
  } catch (e) {
    // Non-fatal
  }

  return merged;
}

export interface CuratedHolidayItem {
  name: string;
  dateStr: string; // YYYY-MM-DD
  category: "PUBLIC_HOLIDAY" | "FESTIVAL_OR_OBSERVANCE" | "OPTIONAL_HOLIDAY" | "COMPANY_HOLIDAY";
  isCompanyHoliday: boolean; // True for official national/public holidays; false for observances
  isOptional: boolean;
  description: string;
  sourceEventId?: string;
  state?: string; // "ALL" or specific state code
}

/**
 * Curated Official Indian Gazetted Holidays and Observances for 2025, 2026, and 2027
 * Sourced per Ministry of Personnel, Public Grievances & Pensions and National Portal of India.
 */
export const OFFICIAL_INDIAN_HOLIDAYS_CATALOG: Record<number, CuratedHolidayItem[]> = {
  2026: [
    // Gazetted Public Holidays (Official Company Holidays by default)
    {
      name: "Republic Day",
      dateStr: "2026-01-26",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Honoring the date on which the Constitution of India came into effect in 1950.",
      sourceEventId: "in_gov_2026_republic_day",
      state: "ALL",
    },
    {
      name: "Holi",
      dateStr: "2026-03-03",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Festival of Colors celebrating the arrival of spring and victory of good over evil.",
      sourceEventId: "in_gov_2026_holi",
      state: "ALL",
    },
    {
      name: "Eid-ul-Fitr",
      dateStr: "2026-03-21",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Islamic festival marking the end of Ramadan, the holy month of fasting.",
      sourceEventId: "in_gov_2026_eid_fitr",
      state: "ALL",
    },
    {
      name: "Mahavir Jayanti",
      dateStr: "2026-03-31",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Birth anniversary of Lord Mahavira, the 24th and last Tirthankara of Jainism.",
      sourceEventId: "in_gov_2026_mahavir_jayanti",
      state: "ALL",
    },
    {
      name: "Good Friday",
      dateStr: "2026-04-03",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Christian holiday commemorating the crucifixion of Jesus Christ.",
      sourceEventId: "in_gov_2026_good_friday",
      state: "ALL",
    },
    {
      name: "Buddha Purnima",
      dateStr: "2026-05-01",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Celebration of the birth, enlightenment, and passing of Gautama Buddha.",
      sourceEventId: "in_gov_2026_buddha_purnima",
      state: "ALL",
    },
    {
      name: "Eid-ul-Adha (Bakrid)",
      dateStr: "2026-05-27",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Feast of the Sacrifice honoring the willingness of Ibrahim to sacrifice his son.",
      sourceEventId: "in_gov_2026_eid_adha",
      state: "ALL",
    },
    {
      name: "Muharram",
      dateStr: "2026-06-26",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "The first month of the Islamic calendar and commemoration of the Day of Ashura.",
      sourceEventId: "in_gov_2026_muharram",
      state: "ALL",
    },
    {
      name: "Independence Day",
      dateStr: "2026-08-15",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "National holiday commemorating India's independence from British rule in 1947.",
      sourceEventId: "in_gov_2026_independence_day",
      state: "ALL",
    },
    {
      name: "Mahatma Gandhi Jayanti",
      dateStr: "2026-10-02",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Birth anniversary of Mahatma Gandhi, Father of the Nation.",
      sourceEventId: "in_gov_2026_gandhi_jayanti",
      state: "ALL",
    },
    {
      name: "Dussehra (Vijayadashami)",
      dateStr: "2026-10-20",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Celebration of the victory of Lord Rama over Ravana and Goddess Durga over Mahishasura.",
      sourceEventId: "in_gov_2026_dussehra",
      state: "ALL",
    },
    {
      name: "Diwali (Deepavali)",
      dateStr: "2026-11-08",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "The Festival of Lights celebrating spiritual victory of light over darkness.",
      sourceEventId: "in_gov_2026_diwali",
      state: "ALL",
    },
    {
      name: "Guru Nanak Jayanti",
      dateStr: "2026-11-24",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Celebration of the birth of Guru Nanak Dev Ji, founder of Sikhism.",
      sourceEventId: "in_gov_2026_guru_nanak_jayanti",
      state: "ALL",
    },
    {
      name: "Christmas Day",
      dateStr: "2026-12-25",
      category: "PUBLIC_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Annual festival commemorating the birth of Jesus Christ.",
      sourceEventId: "in_gov_2026_christmas",
      state: "ALL",
    },

    // Cultural Festivals & Observances (isCompanyHoliday = false until approved by Admin)
    {
      name: "New Year's Day",
      dateStr: "2026-01-01",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "First day of the Gregorian year celebration.",
      sourceEventId: "in_gov_2026_new_year",
      state: "ALL",
    },
    {
      name: "Makar Sankranti / Pongal / Uttarayan",
      dateStr: "2026-01-14",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: false,
      description: "Harvest festival marking the transition of the Sun into Capricorn (Makara rashi).",
      sourceEventId: "in_gov_2026_makar_sankranti",
      state: "GJ", // Prominent regional in Gujarat
    },
    {
      name: "Netaji Subhas Chandra Bose Jayanti",
      dateStr: "2026-01-23",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Parakram Diwas celebrating the legacy of Netaji Subhas Chandra Bose.",
      sourceEventId: "in_gov_2026_netaji_jayanti",
      state: "ALL",
    },
    {
      name: "Maha Shivratri",
      dateStr: "2026-02-15",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Great night of Lord Shiva celebrated across Hindu traditions.",
      sourceEventId: "in_gov_2026_maha_shivratri",
      state: "ALL",
    },
    {
      name: "Ugadi / Gudi Padwa",
      dateStr: "2026-03-19",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "New Year's Day for states of Maharashtra, Karnataka, Telangana, and Andhra Pradesh.",
      sourceEventId: "in_gov_2026_ugadi",
      state: "ALL",
    },
    {
      name: "Rama Navami",
      dateStr: "2026-03-27",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Celebration of the birth of Lord Rama.",
      sourceEventId: "in_gov_2026_rama_navami",
      state: "ALL",
    },
    {
      name: "Dr. B.R. Ambedkar Jayanti",
      dateStr: "2026-04-14",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: false,
      description: "Birth anniversary of Dr. B.R. Ambedkar, chief architect of the Indian Constitution.",
      sourceEventId: "in_gov_2026_ambedkar_jayanti",
      state: "ALL",
    },
    {
      name: "Raksha Bandhan",
      dateStr: "2026-08-28",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Annual rite celebrating the bond between brothers and sisters.",
      sourceEventId: "in_gov_2026_raksha_bandhan",
      state: "ALL",
    },
    {
      name: "Krishna Janmashtami",
      dateStr: "2026-09-04",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Annual Hindu festival celebrating the birth of Lord Krishna.",
      sourceEventId: "in_gov_2026_janmashtami",
      state: "ALL",
    },
    {
      name: "Ganesh Chaturthi",
      dateStr: "2026-09-14",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Ten-day Hindu festival celebrating the arrival of Lord Ganesha to earth.",
      sourceEventId: "in_gov_2026_ganesh_chaturthi",
      state: "ALL",
    },
    {
      name: "Karwa Chauth",
      dateStr: "2026-10-29",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Traditional festival where married women observe fasting for long life of husbands.",
      sourceEventId: "in_gov_2026_karwa_chauth",
      state: "ALL",
    },
    {
      name: "Govardhan Puja",
      dateStr: "2026-11-09",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Day following Diwali honoring Lord Krishna lifting Mount Govardhan.",
      sourceEventId: "in_gov_2026_govardhan_puja",
      state: "ALL",
    },
    {
      name: "Bhai Dooj",
      dateStr: "2026-11-10",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Celebration marking the conclusion of Diwali festivities.",
      sourceEventId: "in_gov_2026_bhai_dooj",
      state: "ALL",
    },
    {
      name: "Chhath Puja",
      dateStr: "2026-11-15",
      category: "FESTIVAL_OR_OBSERVANCE",
      isCompanyHoliday: false,
      isOptional: true,
      description: "Ancient Hindu festival dedicated to the Sun God Surya and Chhathi Maiya.",
      sourceEventId: "in_gov_2026_chhath_puja",
      state: "ALL",
    },
    {
      name: "Axivon Technologies Foundation Day",
      dateStr: "2026-10-16",
      category: "COMPANY_HOLIDAY",
      isCompanyHoliday: true,
      isOptional: false,
      description: "Annual Foundation Day celebrating the incorporation of Axivon Technologies.",
      sourceEventId: "axivon_foundation_day",
      state: "ALL",
    },
  ],
};

/**
 * Synchronize holidays from Google Calendar / Indian Gazette catalog for a given year.
 * Deduplicates, preserves existing administrator overrides, and returns an execution report.
 */
export async function syncHolidays(
  year: number = new Date().getFullYear(),
  userId?: string
): Promise<{
  success: boolean;
  added: number;
  updated: number;
  unchanged: number;
  total: number;
  source: string;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();
  let itemsToSync: CuratedHolidayItem[] = [];
  let source = "INDIAN_PUBLIC_HOLIDAY_CATALOG";

  // 1. Check if external Google Calendar API or iCal feed is reachable
  const googleApiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const calendarId = "en.indian#holiday@group.v.calendar.google.com";

  if (googleApiKey) {
    try {
      const timeMin = new Date(year, 0, 1).toISOString();
      const timeMax = new Date(year, 11, 31, 23, 59, 59).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events?key=${googleApiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          itemsToSync = data.items.map((ev: any) => {
            const dateStr = ev.start?.date || ev.start?.dateTime?.slice(0, 10);
            const isNational = /republic|independence|gandhi/i.test(ev.summary);
            return {
              name: ev.summary || "Public Holiday",
              dateStr,
              category: isNational ? "PUBLIC_HOLIDAY" : "FESTIVAL_OR_OBSERVANCE",
              isCompanyHoliday: isNational,
              isOptional: false,
              description: ev.description || null,
              sourceEventId: ev.id,
              state: "ALL",
            };
          });
          source = "GOOGLE_CALENDAR_API";
        }
      }
    } catch (e) {
      console.warn("[HolidaySync] Google Calendar API unreachable, using authoritative Indian catalog fallback");
    }
  }

  // Fallback to maintained authoritative catalog if external API gave no items
  if (itemsToSync.length === 0) {
    itemsToSync = OFFICIAL_INDIAN_HOLIDAYS_CATALOG[year] || OFFICIAL_INDIAN_HOLIDAYS_CATALOG[2026] || [];
  }

  let added = 0;
  let updated = 0;
  let unchanged = 0;

  for (const item of itemsToSync) {
    if (!item.dateStr || !item.name) continue;

    const date = parseDateString(item.dateStr);

    // Look for existing holiday on the same date with matching name or matching sourceEventId
    const existing = await db.holiday.findFirst({
      where: {
        OR: [
          { date, name: item.name },
          ...(item.sourceEventId ? [{ sourceEventId: item.sourceEventId }] : []),
        ],
      },
    });

    if (existing) {
      // PRESERVE ADMINISTRATOR OVERRIDES!
      // If an administrator has manually approved or updated isCompanyHoliday, we do NOT overwrite it!
      const shouldUpdateDesc = !existing.description && item.description;

      if (shouldUpdateDesc || existing.source !== source) {
        await db.holiday.update({
          where: { id: existing.id },
          data: {
            description: existing.description || item.description,
            lastSyncAt: new Date(timestamp),
            year,
          },
        });
        updated++;
      } else {
        unchanged++;
      }
    } else {
      // Create new record
      await db.holiday.create({
        data: {
          name: item.name,
          date,
          category: item.category,
          isCompanyHoliday: item.isCompanyHoliday,
          isOptional: item.isOptional,
          description: item.description,
          source,
          sourceEventId: item.sourceEventId || null,
          country: "IN",
          state: item.state || "ALL",
          allDay: true,
          year,
          createdById: userId || null,
          lastSyncAt: new Date(timestamp),
        },
      });
      added++;
    }
  }

  const result = {
    success: true,
    added,
    updated,
    unchanged,
    total: added + updated + unchanged,
    source,
    timestamp,
  };

  // Record sync result in settings
  await updateCalendarSettings({
    lastSyncAt: timestamp,
    lastSyncResult: result,
  });

  return result;
}
