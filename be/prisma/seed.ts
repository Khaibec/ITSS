/**
 * Prisma Seed Script
 * 
 * Chạy script này để import dữ liệu mẫu vào database
 * 
 * Usage:
 *   npx prisma db seed
 * 
 * Hoặc:
 *   npx ts-node prisma/seed.ts
 * 
 * Cần thêm vào package.json:
 *   "prisma": {
 *     "seed": "ts-node prisma/seed.ts"
 *   }
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear existing data (optional - uncomment if needed)
  // console.log('🗑️  Clearing existing data...');
  // await prisma.message_reads.deleteMany();
  // await prisma.message_analyses.deleteMany();
  // await prisma.message_reviews.deleteMany();
  // await prisma.messages.deleteMany();
  // await prisma.group_members.deleteMany();
  // await prisma.chat_groups.deleteMany();
  // await prisma.diary_views.deleteMany();
  // await prisma.learning_diaries.deleteMany();
  // await prisma.users.deleteMany();
  // console.log('✅ Data cleared\n');

  // 1. Create Users
  console.log('1️⃣ Creating users...');
  
  // Hash passwords properly using bcrypt
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('password123', 10);
  const password3 = await bcrypt.hash('password123', 10);
  const password4 = await bcrypt.hash('password123', 10);
  
    const user1 = await prisma.users.upsert({
      where: { email: 'yorifuji.kiyoshi@example.com' },
      update: {},
      create: {
        name: 'Yorifuji Kiyoshi',
        nationality: 'Japanese',
        email: 'yorifuji.kiyoshi@example.com',
        password_hash: password1,
        login_provider: 'local',
      },
    });

    const user2 = await prisma.users.upsert({
      where: { email: 'le.sang.hiec@example.com' },
      update: {},
      create: {
        name: 'Lê Sang Hiếc',
        nationality: 'Vietnamese',
        email: 'le.sang.hiec@example.com',
        password_hash: password2,
        login_provider: 'local',
      },
    });

    const user3 = await prisma.users.upsert({
      where: { email: 'ryo.kimura@example.com' },
      update: {},
      create: {
        name: 'Ryo Kimura',
        nationality: 'Japanese',
        email: 'ryo.kimura@example.com',
        password_hash: password3,
        login_provider: 'local',
      },
    });

    const user4 = await prisma.users.upsert({
      where: { email: 'nguyen.hong.diem@example.com' },
      update: {},
      create: {
        name: 'Nguyễn Hồng Diễm',
        nationality: 'Vietnamese',
        email: 'nguyen.hong.diem@example.com',
        password_hash: password4,
        login_provider: 'local',
      },
    });

  console.log(`✅ Created ${4} users\n`);

  // 2. Create Chat Groups
  console.log('2️⃣ Creating chat groups...');
    const group1 = await prisma.chat_groups.upsert({
      where: { group_id: 1 },
      update: {},
      create: {
        group_name: 'ITSS 七つの大罪',
        icon_url: 'https://ui-avatars.com/api/?name=ITSS&background=4F46E5&color=fff',
        created_by: user1.user_id,
      },
    });

    const group2 = await prisma.chat_groups.upsert({
      where: { group_id: 2 },
      update: {},
      create: {
        group_name: 'ITSS K67 火2',
        icon_url: 'https://ui-avatars.com/api/?name=ITSS+K67&background=EC4899&color=fff',
        created_by: user1.user_id,
      },
    });

    const group3 = await prisma.chat_groups.upsert({
      where: { group_id: 3 },
      update: {},
      create: {
        group_name: '開発チーム',
        icon_url: 'https://ui-avatars.com/api/?name=Dev+Team&background=10B981&color=fff',
        created_by: user2.user_id,
      },
    });

    const group4 = await prisma.chat_groups.upsert({
      where: { group_id: 4 },
      update: {},
      create: {
        group_name: 'ツボ草',
        icon_url: 'https://ui-avatars.com/api/?name=Tsubo+Kusa&background=F59E0B&color=fff',
        created_by: user3.user_id,
      },
    });

  console.log(`✅ Created ${2} groups\n`);

  // 3. Create Group Members
  console.log('3️⃣ Adding group members...');
    // Group 1 members: [1, 2]
    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group1.group_id,
          user_id: user1.user_id,
        },
      },
      update: {},
      create: {
        group_id: group1.group_id,
        user_id: user1.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group1.group_id,
          user_id: user2.user_id,
        },
      },
      update: {},
      create: {
        group_id: group1.group_id,
        user_id: user2.user_id,
      },
    });

    // Group 2 members: [1, 3, 4]
    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group2.group_id,
          user_id: user1.user_id,
        },
      },
      update: {},
      create: {
        group_id: group2.group_id,
        user_id: user1.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group2.group_id,
          user_id: user3.user_id,
        },
      },
      update: {},
      create: {
        group_id: group2.group_id,
        user_id: user3.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group2.group_id,
          user_id: user4.user_id,
        },
      },
      update: {},
      create: {
        group_id: group2.group_id,
        user_id: user4.user_id,
      },
    });

    // Group 3 members: [2, 3, 4]
    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group3.group_id,
          user_id: user2.user_id,
        },
      },
      update: {},
      create: {
        group_id: group3.group_id,
        user_id: user2.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group3.group_id,
          user_id: user3.user_id,
        },
      },
      update: {},
      create: {
        group_id: group3.group_id,
        user_id: user3.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group3.group_id,
          user_id: user4.user_id,
        },
      },
      update: {},
      create: {
        group_id: group3.group_id,
        user_id: user4.user_id,
      },
    });

    // Group 4 members: [1, 2, 3]
    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group4.group_id,
          user_id: user1.user_id,
        },
      },
      update: {},
      create: {
        group_id: group4.group_id,
        user_id: user1.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group4.group_id,
          user_id: user2.user_id,
        },
      },
      update: {},
      create: {
        group_id: group4.group_id,
        user_id: user2.user_id,
      },
    });

    await prisma.group_members.upsert({
      where: {
        group_id_user_id: {
          group_id: group4.group_id,
          user_id: user3.user_id,
        },
      },
      update: {},
      create: {
        group_id: group4.group_id,
        user_id: user3.user_id,
      },
    });

    console.log(`✅ Added group members\n`);

  // 4. Create Messages
  console.log('4️⃣ Creating messages...');
  const message1 = await prisma.messages.create({
    data: {
      group_id: group1.group_id,
      sender_id: user1.user_id,
      content: 'Xin chào mọi người!',
    },
  });

  const message2 = await prisma.messages.create({
    data: {
      group_id: group1.group_id,
      sender_id: user3.user_id,
      content: 'こんにちは、皆さん！',
    },
  });

  const message3 = await prisma.messages.create({
    data: {
      group_id: group1.group_id,
      sender_id: user2.user_id,
      content: 'Hôm nay chúng ta có họp không?',
    },
  });

  const message4 = await prisma.messages.create({
    data: {
      group_id: group2.group_id,
      sender_id: user1.user_id,
      content: 'Project sắp tới deadline rồi.',
    },
  });

  const message5 = await prisma.messages.create({
    data: {
      group_id: group2.group_id,
      sender_id: user3.user_id,
      content: '了解しました。進捗報告をお願いします。',
    },
  });

  console.log(`✅ Created ${5} messages\n`);

  // 5. Create Message Reads
  console.log('5️⃣ Creating message reads...');
  const reads = [
    { message_id: message1.message_id, user_id: user1.user_id },
    { message_id: message1.message_id, user_id: user2.user_id },
    { message_id: message1.message_id, user_id: user3.user_id },
    { message_id: message2.message_id, user_id: user1.user_id },
    { message_id: message2.message_id, user_id: user3.user_id },
    { message_id: message2.message_id, user_id: user4.user_id },
    { message_id: message3.message_id, user_id: user1.user_id },
    { message_id: message3.message_id, user_id: user2.user_id },
    { message_id: message3.message_id, user_id: user3.user_id },
    { message_id: message4.message_id, user_id: user1.user_id },
    { message_id: message4.message_id, user_id: user3.user_id },
    { message_id: message5.message_id, user_id: user1.user_id },
    { message_id: message5.message_id, user_id: user3.user_id },
  ];

  for (const read of reads) {
    await prisma.message_reads.upsert({
      where: {
        message_id_user_id: {
          message_id: read.message_id,
          user_id: read.user_id,
        },
      },
      update: {},
      create: read,
    });
  }

  console.log(`✅ Created ${reads.length} message reads\n`);

  // 6. Create Message Reviews (optional)
  console.log('6️⃣ Creating message reviews...');
  await prisma.message_reviews.create({
    data: {
      user_id: user2.user_id,
      original_content: 'Hôm nay chúng ta có họp không?',
      suggestion: 'Câu hỏi nên lịch sự hơn: "Mọi người có thể họp hôm nay không?"',
      warning_message: 'Không quá nghiêm trọng',
      status: 'warning',
    },
  });

  await prisma.message_reviews.create({
    data: {
      user_id: user3.user_id,
      original_content: '了解しました。進捗報告をお願いします。',
      status: 'no_issue',
    },
  });

  console.log(`✅ Created ${2} message reviews\n`);

  // 7. Create Message Analyses (optional)
  console.log('7️⃣ Creating message analyses...');
  await prisma.message_analyses.create({
    data: {
      message_id: message1.message_id,
      analyzed_by_ai: true,
      meaning_summary: 'Chào hỏi mọi người trong nhóm',
      vocab_notes: 'Xin chào: greeting',
      cultural_notes: 'Thể hiện thân thiện',
      similar_examples: 'こんにちは、皆さん！',
    },
  });

  await prisma.message_analyses.create({
    data: {
      message_id: message2.message_id,
      analyzed_by_ai: true,
      meaning_summary: 'Xin chào bằng tiếng Nhật',
      vocab_notes: 'こんにちは: greeting',
      cultural_notes: 'Thân mật, lịch sự',
      similar_examples: 'Xin chào mọi người!',
    },
  });

  console.log(`✅ Created ${2} message analyses\n`);

  // 8. Create Learning Diaries (optional)
  console.log('8️⃣ Creating learning diaries...');
  const diary1 = await prisma.learning_diaries.create({
    data: {
      user_id: user1.user_id,
      title: 'Học cách chào hỏi bằng tiếng Nhật',
      situation: 'Tin nhắn "こんにちは、皆さん！" từ Taro',
      learning_content: 'Học cách dùng câu chào thân thiện, so sánh với "Xin chào mọi người!"',
    },
  });

  const diary2 = await prisma.learning_diaries.create({
    data: {
      user_id: user2.user_id,
      title: 'Cách diễn đạt lịch sự',
      situation: 'Tin nhắn "Hôm nay chúng ta có họp không?"',
      learning_content: 'Câu hỏi có thể lịch sự hơn: "Mọi người có thể họp hôm nay không?"',
    },
  });

  console.log(`✅ Created ${2} learning diaries\n`);

  // 9. Create Diary Views (optional)
  console.log('9️⃣ Creating diary views...');
  await prisma.diary_views.create({
    data: {
      diary_id: diary1.diary_id,
      user_id: user1.user_id,
    },
  });

  await prisma.diary_views.create({
    data: {
      diary_id: diary1.diary_id,
      user_id: user2.user_id,
    },
  });

  await prisma.diary_views.create({
    data: {
      diary_id: diary2.diary_id,
      user_id: user2.user_id,
    },
  });

  await prisma.diary_views.create({
    data: {
      diary_id: diary2.diary_id,
      user_id: user1.user_id,
    },
  });

  console.log(`✅ Created ${4} diary views\n`);

  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${4}`);
  console.log(`   - Groups: ${2}`);
  console.log(`   - Group Members: ${6}`);
  console.log(`   - Messages: ${5}`);
  console.log(`   - Message Reads: ${reads.length}`);
  console.log(`   - Message Reviews: ${2}`);
  console.log(`   - Message Analyses: ${2}`);
  console.log(`   - Learning Diaries: ${2}`);
  console.log(`   - Diary Views: ${4}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


