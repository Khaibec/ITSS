/**
 * Script to fix password hashes in database
 * 
 * This script will hash passwords properly using bcrypt
 * and update them in the database.
 * 
 * Usage:
 *   npx ts-node be/scripts/fix-passwords.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting password fix...\n');

  // Define the actual passwords (plain text) for each user
  // These are the passwords users will use to login
  const userPasswords = {
    'a.nguyen@example.com': 'password123',  // Password gốc cho user này
    'b.tran@example.com': 'password123',
    'taro.yamada@example.jp': 'password123',
    'hanako.suzuki@example.jp': 'password123',
  };

  console.log('📝 Updating password hashes...\n');

  for (const [email, plainPassword] of Object.entries(userPasswords)) {
    try {
      // Hash password với bcrypt
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      // Update user trong database
      const user = await prisma.users.update({
        where: { email },
        data: { password_hash: hashedPassword },
      });

      console.log(`✅ Updated password for: ${email}`);
      console.log(`   Plain password: ${plainPassword}`);
      console.log(`   Hashed: ${hashedPassword.substring(0, 30)}...\n`);
    } catch (error) {
      console.error(`❌ Error updating ${email}:`, error);
    }
  }

  console.log('✨ Password fix completed!\n');
  console.log('📋 Login credentials:');
  console.log('   Email: a.nguyen@example.com');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

