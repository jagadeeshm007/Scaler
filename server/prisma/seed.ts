import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcrypt';
import { encrypt } from '../src/utils/encryption';

async function main() {
  console.log('Seeding database...');

  // 1. Pre-seed the bypass demo user
  const demoEmail = 'jagadeesh.m@deeptaai.com';
  const passwordHash = await bcrypt.hash('demo123!', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      full_name: 'Jagadeesh M',
      username: 'jagadeesh',
      password_hash: passwordHash,
      timezone: 'Asia/Kolkata',
    },
  });

  console.log(`Demo user created: ${demoUser.email}`);

  // 2. Pre-seed default schedule
  const defaultSchedule = await prisma.schedule.upsert({
    where: { id: 'seed-default-schedule' },
    update: {},
    create: {
      id: 'seed-default-schedule',
      user_id: demoUser.id,
      name: 'Working Hours',
      timezone: 'Asia/Kolkata',
      is_default: true,
      availability: {
        create: [1, 2, 3, 4, 5].map((day) => ({
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
        })),
      },
    },
  });

  console.log('Default schedule created.');

  // 3. Pre-seed event types
  await prisma.eventType.upsert({
    where: { user_id_slug: { user_id: demoUser.id, slug: 'testing' } },
    update: { is_hidden: true, is_active: false, duration_mins: 30, position: 0 },
    create: {
      user_id: demoUser.id,
      title: 'testing',
      slug: 'testing',
      description: 'A quick video meeting.',
      duration_mins: 30,
      location_type: 'CAL_VIDEO',
      is_hidden: true,
      is_active: false,
      position: 0,
    },
  });

  await prisma.eventType.upsert({
    where: { user_id_slug: { user_id: demoUser.id, slug: '15min' } },
    update: { duration_options: [15, 30, 60], position: 1 },
    create: {
      user_id: demoUser.id,
      title: '15 min meeting',
      slug: '15min',
      duration_mins: 15,
      duration_options: [15, 30, 60],
      location_type: 'GOOGLE_MEET',
      position: 1,
    },
  });

  await prisma.eventType.upsert({
    where: { user_id_slug: { user_id: demoUser.id, slug: '30min' } },
    update: { position: 2 },
    create: {
      user_id: demoUser.id,
      title: '30 min meeting',
      slug: '30min',
      duration_mins: 30,
      location_type: 'ZOOM',
      position: 2,
    },
  });

  await prisma.eventType.upsert({
    where: { user_id_slug: { user_id: demoUser.id, slug: 'secret' } },
    update: { is_hidden: true, is_active: false, position: 3 },
    create: {
      user_id: demoUser.id,
      title: 'Secret meeting',
      slug: 'secret',
      duration_mins: 15,
      location_type: 'GOOGLE_MEET',
      is_hidden: true,
      is_active: false,
      position: 3,
    },
  });

  console.log('Event types created.');

  // 4. Pre-seed Integrations (Apps)
  const googleApp = await prisma.app.upsert({
    where: { slug: 'google' },
    update: {},
    create: {
      name: 'Google Calendar & Meet',
      slug: 'google',
      description: 'Sync your Google Calendar and create Google Meet links.',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
      auth_type: 'OAUTH2',
      client_id_encrypted: encrypt('mock-google-client-id'),
      client_secret_encrypted: encrypt('mock-google-client-secret'),
      redirect_uri: 'http://localhost:4000/api/v1/integrations/google/callback',
      scopes: 'https://www.googleapis.com/auth/calendar.events',
      category: 'Calendar',
    },
  });

  const zoomApp = await prisma.app.upsert({
    where: { slug: 'zoom' },
    update: {},
    create: {
      name: 'Zoom Video',
      slug: 'zoom',
      description: 'Automatically create Zoom meetings for bookings.',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg',
      auth_type: 'OAUTH2',
      client_id_encrypted: encrypt('mock-zoom-client-id'),
      client_secret_encrypted: encrypt('mock-zoom-client-secret'),
      redirect_uri: 'http://localhost:4000/api/v1/integrations/zoom/callback',
      scopes: 'meeting:write',
      category: 'Video',
    },
  });

  console.log('Integration apps created.');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
