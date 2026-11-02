import prisma from '@/lib/prisma';
import { SettingsClient } from './settings-client';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settingsList = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settingsList.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return <SettingsClient initialSettings={settingsMap} />;
}
