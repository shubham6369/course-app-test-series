import prisma from '@/lib/prisma';
import { SetupClient } from './setup-client';

export const dynamic = 'force-dynamic';

export default async function AdminSetupPage() {
  const brandingSettings = await prisma.setting.findMany({
    where: { category: 'branding' },
  });

  const config: Record<string, string> = {
    app_name: 'Webphiser Education System',
    tagline: 'Premier Computer-Based Testing & Learning Platform for NEET & JEE',
    logo_url: 'https://edu.d3vx.in/assets/logo.png',
    brand_color: '#09214b',
    brand_accent: '#e0a028',
    brand_dark: '#061432',
    brand_canvas: '#040e22',
  };

  brandingSettings.forEach((s) => {
    config[s.key] = s.value;
  });

  return <SetupClient initialConfig={config} />;
}
