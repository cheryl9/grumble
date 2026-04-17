require('../config/loadEnv');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const fs = require('fs');
const readline = require('readline');

/**
 * Interactive Admin Creator Script
 * Creates a new admin account in the database
 * 
 * Usage: node scripts/createAdmin.js
 */

const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
const pipedAnswers = isInteractive
  ? []
  : fs.readFileSync(0, 'utf8').split(/\r?\n/);
let answerIndex = 0;

const rl = isInteractive
  ? readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  : null;

// Helper to ask questions
const question = (query) => {
  if (!isInteractive) {
    const answer = pipedAnswers[answerIndex] ?? '';
    answerIndex += 1;
    return Promise.resolve(answer);
  }

  return new Promise((resolve) => rl.question(query, resolve));
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

async function createAdmin() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║    Grumble Admin Account Creator      ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Check database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Check if admins table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Error: "admins" table does not exist!');
      console.log('Please run the migration first:');
      console.log('  psql -U postgres -d grumble -f migrations/004_create_admin_tables.sql\n');
      rl.close();
      process.exit(1);
    }

    // Get admin details
    const username = await question('Admin username (min 3 characters): ');
    if (username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      rl.close();
      process.exit(1);
    }

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.error(`❌ Username "${username}" already exists!`);
      rl.close();
      process.exit(1);
    }

    const email = await question('Admin email: ');
    if (!isValidEmail(email)) {
      console.error('❌ Invalid email format');
      rl.close();
      process.exit(1);
    }

    // Check if email already exists
    const existingEmail = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      console.error(`❌ Email "${email}" already exists!`);
      rl.close();
      process.exit(1);
    }

    const password = await question('Admin password (min 8 chars, include upper, lower, number, special): ');
    if (!isStrongPassword(password)) {
      console.error('❌ Password must be at least 8 characters with uppercase, lowercase, number, and special character (!@#$%^&*)');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      rl.close();
      process.exit(1);
    }

    const fullName = await question('Full name: ');
    if (!fullName.trim()) {
      console.error('❌ Full name is required');
      rl.close();
      process.exit(1);
    }

    const role = await question('Role (admin/superadmin) [default: admin]: ');
    const adminRole = role.toLowerCase() === 'superadmin' ? 'superadmin' : 'admin';

    // Hash password
    console.log('\n🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert admin
    console.log('💾 Creating admin account...');
    const result = await pool.query(
      `INSERT INTO admins (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash, fullName, adminRole]
    );

    const newAdmin = result.rows[0];

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   ✅ Admin Created Successfully!       ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:         ${newAdmin.id}`);
    console.log(`Username:   ${newAdmin.username}`);
    console.log(`Email:      ${newAdmin.email}`);
    console.log(`Full Name:  ${fullName}`);
    console.log(`Role:       ${newAdmin.role}`);
    console.log(`Created:    ${newAdmin.created_at}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔗 Access the admin panel at:');
    console.log('   Frontend: http://localhost:5173/admin/login');
    console.log('   Backend:  http://localhost:5001/api/admin\n');

    console.log('📝 Login credentials:');
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Password: (the one you just entered)\n`);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure PostgreSQL is running and DATABASE_URL in .env is correct');
    }
    process.exit(1);
  } finally {
    if (rl && !rl.closed) {
      rl.close();
    }
    await pool.end();
  }
}

// Run the script
createAdmin();
