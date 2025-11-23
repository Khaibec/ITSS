/**
 * Script để seed data từ mockData.js vào database
 *
 * Usage:
 *   cd be
 *   npx ts-node scripts/seed-from-mockdata.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Data từ mockData.js
const mockUsers = [
  {
    user_id: 1,
    name: 'Yorifuji Kiyoshi',
    nationality: 'Japanese',
    email: 'yorifuji.kiyoshi@example.com', // Tạo email từ name
    password: 'password123',
  },
  {
    user_id: 2,
    name: 'Lê Sang Hiếc',
    nationality: 'Vietnamese',
    email: 'le.sang.hiec@example.com',
    password: 'password123',
  },
  {
    user_id: 3,
    name: 'Ryo Kimura',
    nationality: 'Japanese',
    email: 'ryo.kimura@example.com',
    password: 'password123',
  },
  {
    user_id: 4,
    name: 'Nguyễn Hồng Diễm',
    nationality: 'Vietnamese',
    email: 'nguyen.hong.diem@example.com',
    password: 'password123',
  },
];

const mockGroups = [
  {
    group_id: 1,
    group_name: 'ITSS 七つの大罪',
    icon_url:
      'https://ui-avatars.com/api/?name=ITSS&background=4F46E5&color=fff',
    members: [1, 2],
  },
  {
    group_id: 2,
    group_name: 'ITSS K67 火2',
    icon_url:
      'https://ui-avatars.com/api/?name=ITSS+K67&background=EC4899&color=fff',
    members: [1, 3, 4],
  },
  {
    group_id: 3,
    group_name: '開発チーム',
    icon_url:
      'https://ui-avatars.com/api/?name=Dev+Team&background=10B981&color=fff',
    members: [2, 3, 4],
  },
  {
    group_id: 4,
    group_name: 'ツボ草',
    icon_url:
      'https://ui-avatars.com/api/?name=Tsubo+Kusa&background=F59E0B&color=fff',
    members: [1, 2, 3],
  },
];

const mockMessages = {
  1: [
    {
      group_id: 1,
      sender_id: 1,
      content: 'おはようございます。今日の会議は10時からですね。',
      created_at: new Date('2025-11-22T08:30:00'),
    },
    {
      group_id: 1,
      sender_id: 2,
      content: 'はい、わかりました。資料を準備しています。',
      created_at: new Date('2025-11-22T08:35:00'),
    },
    {
      group_id: 1,
      sender_id: 1,
      content: 'ありがとうございます。よろしくお願いします。',
      created_at: new Date('2025-11-22T08:40:00'),
    },
  ],
  2: [
    {
      group_id: 2,
      sender_id: 3,
      content: '新しいデザイン案を共有しました。',
      created_at: new Date('2025-11-22T09:00:00'),
    },
    {
      group_id: 2,
      sender_id: 4,
      content: '確認しました。とても良いデザインですね！',
      created_at: new Date('2025-11-22T09:15:00'),
    },
  ],
  3: [
    {
      group_id: 3,
      sender_id: 2,
      content: 'APIの実装が完了しました。',
      created_at: new Date('2025-11-22T10:00:00'),
    },
  ],
  4: [], // Empty group
};

async function seedFromMockData() {
  try {
    console.log('🌱 Starting seed from mockData...\n');

    // 1. Create Users
    console.log('1️⃣ Creating users...');
    const createdUsers: any[] = [];
    for (const user of mockUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);

      const createdUser = await prisma.users.upsert({
        where: { user_id: user.user_id },
        update: {
          name: user.name,
          nationality: user.nationality,
          email: user.email,
          password_hash: passwordHash,
        },
        create: {
          user_id: user.user_id,
          name: user.name,
          nationality: user.nationality,
          email: user.email,
          password_hash: passwordHash,
          login_provider: 'local',
        },
      });

      createdUsers.push(createdUser);
      console.log(`   ✅ User ${user.user_id}: ${user.name} (${user.email})`);
    }
    console.log(`✅ Created/Updated ${createdUsers.length} users\n`);

    // 2. Create Groups
    console.log('2️⃣ Creating groups...');
    const createdGroups: any[] = [];
    for (const group of mockGroups) {
      const createdGroup = await prisma.chat_groups.upsert({
        where: { group_id: group.group_id },
        update: {
          group_name: group.group_name,
          icon_url: group.icon_url,
        },
        create: {
          group_id: group.group_id,
          group_name: group.group_name,
          icon_url: group.icon_url,
          created_by: group.members[0], // First member is creator
        },
      });

      createdGroups.push(createdGroup);
      console.log(`   ✅ Group ${group.group_id}: ${group.group_name}`);
    }
    console.log(`✅ Created/Updated ${createdGroups.length} groups\n`);

    // 3. Add Group Members
    console.log('3️⃣ Adding group members...');
    let totalMembers = 0;
    for (const group of mockGroups) {
      for (const userId of group.members) {
        try {
          await prisma.group_members.upsert({
            where: {
              group_id_user_id: {
                group_id: group.group_id,
                user_id: userId,
              },
            },
            update: {},
            create: {
              group_id: group.group_id,
              user_id: userId,
            },
          });
          totalMembers++;
          console.log(`   ✅ Added user ${userId} to group ${group.group_id}`);
        } catch (error) {
          console.warn(
            `   ⚠️  Failed to add user ${userId} to group ${group.group_id}: ${error.message}`,
          );
        }
      }
    }
    console.log(`✅ Added ${totalMembers} group members\n`);

    // 4. Create Messages
    console.log('4️⃣ Creating messages...');
    let totalMessages = 0;
    for (const [groupIdStr, messages] of Object.entries(mockMessages)) {
      const groupId = parseInt(groupIdStr);

      for (const message of messages) {
        try {
          await prisma.messages.create({
            data: {
              group_id: message.group_id,
              sender_id: message.sender_id,
              content: message.content,
              created_at: message.created_at,
            },
          });
          totalMessages++;
          console.log(
            `   ✅ Message in group ${groupId}: "${message.content.substring(0, 30)}..."`,
          );
        } catch (error) {
          console.warn(`   ⚠️  Failed to create message: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${totalMessages} messages\n`);

    console.log('✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Groups: ${createdGroups.length}`);
    console.log(`   - Group Members: ${totalMembers}`);
    console.log(`   - Messages: ${totalMessages}\n`);

    console.log('🔑 Login Credentials:');
    mockUsers.forEach((user) => {
      console.log(`   - ${user.email} / ${user.password}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedFromMockData();
