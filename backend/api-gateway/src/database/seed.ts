/**
 * Database Seeder
 * Seeds initial data for development and testing
 */

import * as bcrypt from 'bcrypt';
import { initializePostgreSQL, query, closeDatabases } from './connection';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Initialize PostgreSQL
    await initializePostgreSQL();

    // Check if data already exists
    const existingOrgs = await query('SELECT COUNT(*) as count FROM organizations');
    if (parseInt(existingOrgs[0].count) > 0) {
      console.log('⏭️  Database already seeded. Skipping...');
      return;
    }

    console.log('📝 Seeding organizations...');
    
    // Seed organization
    const orgResult = await query(`
      INSERT INTO organizations (name, slug)
      VALUES ('NinjaIT Demo Organization', 'ninjait-demo')
      RETURNING id
    `);
    const orgId = orgResult[0].id;
    console.log(`✅ Created organization: ${orgId}\n`);

    console.log('📝 Seeding roles...');

    // Seed roles
    const adminRoleResult = await query(`
      INSERT INTO roles (organization_id, name, permissions)
      VALUES ($1, 'Administrator', $2)
      RETURNING id
    `, [orgId, JSON.stringify({
      'devices.view': true,
      'devices.create': true,
      'devices.edit': true,
      'devices.delete': true,
      'alerts.view': true,
      'alerts.manage': true,
      'scripts.view': true,
      'scripts.execute': true,
      'scripts.manage': true,
      'users.view': true,
      'users.manage': true,
      'roles.view': true,
      'roles.manage': true,
      'reports.view': true,
      'reports.create': true,
      'settings.view': true,
      'settings.manage': true,
    })]);
    const adminRoleId = adminRoleResult[0].id;

    const technicianRoleResult = await query(`
      INSERT INTO roles (organization_id, name, permissions)
      VALUES ($1, 'Technician', $2)
      RETURNING id
    `, [orgId, JSON.stringify({
      'devices.view': true,
      'devices.edit': true,
      'alerts.view': true,
      'scripts.view': true,
      'scripts.execute': true,
      'reports.view': true,
    })]);
    const technicianRoleId = technicianRoleResult[0].id;

    await query(`
      INSERT INTO roles (organization_id, name, permissions)
      VALUES ($1, 'Viewer', $2)
    `, [orgId, JSON.stringify({
      'devices.view': true,
      'alerts.view': true,
      'scripts.view': true,
      'reports.view': true,
    })]);

    console.log('✅ Created 3 roles\n');

    console.log('📝 Seeding users...');

    // Seed admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUserResult = await query(`
      INSERT INTO users (organization_id, email, password_hash, first_name, last_name, is_active)
      VALUES ($1, 'admin@demo.com', $2, 'Admin', 'User', true)
      RETURNING id
    `, [orgId, adminPasswordHash]);
    const adminUserId = adminUserResult[0].id;

    // Assign admin role
    await query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
    `, [adminUserId, adminRoleId]);

    // Seed technician user
    const techPasswordHash = await bcrypt.hash('tech123', 10);
    const techUserResult = await query(`
      INSERT INTO users (organization_id, email, password_hash, first_name, last_name, is_active)
      VALUES ($1, 'technician@demo.com', $2, 'John', 'Technician', true)
      RETURNING id
    `, [orgId, techPasswordHash]);
    const techUserId = techUserResult[0].id;

    // Assign technician role
    await query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
    `, [techUserId, technicianRoleId]);

    console.log('✅ Created 2 users\n');

    console.log('📝 Seeding devices...');

    // Seed sample devices
    await query(`
      INSERT INTO devices (organization_id, agent_id, name, device_type, os_type, os_version, cpu_info, ram_gb, disk_gb, status, tags)
      VALUES 
        ($1, uuid_generate_v4(), 'Server-Prod-001', 'server', 'Linux', 'Ubuntu 22.04', 'Intel Xeon', 32, 500, 'online', ARRAY['production', 'web-server']),
        ($1, uuid_generate_v4(), 'Server-Prod-002', 'server', 'Linux', 'Ubuntu 22.04', 'Intel Xeon', 64, 1000, 'online', ARRAY['production', 'database']),
        ($1, uuid_generate_v4(), 'Workstation-001', 'workstation', 'Windows', '11 Pro', 'Intel Core i7', 16, 512, 'online', ARRAY['office', 'development']),
        ($1, uuid_generate_v4(), 'Workstation-002', 'workstation', 'Windows', '11 Pro', 'Intel Core i5', 8, 256, 'offline', ARRAY['office']),
        ($1, uuid_generate_v4(), 'Mac-Studio-001', 'workstation', 'macOS', 'Sonoma 14.1', 'Apple M2 Max', 32, 512, 'online', ARRAY['design', 'office'])
    `, [orgId]);

    console.log('✅ Created 5 sample devices\n');

    console.log('📝 Seeding scripts...');

    // Seed sample scripts
    await query(`
      INSERT INTO scripts (organization_id, name, description, script_content, script_type, created_by)
      VALUES 
        ($1, 'System Health Check', 'Comprehensive system health check', 'Get-ComputerInfo | Select-Object CsName, OsName, OsVersion', 'powershell', $2),
        ($1, 'Disk Cleanup', 'Clean temporary files and free up disk space', 'cleanmgr /sagerun:1', 'batch', $2),
        ($1, 'Update Package List', 'Update apt package list', 'apt-get update -y', 'bash', $2)
    `, [orgId, adminUserId]);

    console.log('✅ Created 3 sample scripts\n');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Seed Data Summary:');
    console.log('   - Organization: ninjait-demo');
    console.log('   - Admin: admin@demo.com / admin123');
    console.log('   - Technician: technician@demo.com / tech123');
    console.log('   - Devices: 5');
    console.log('   - Scripts: 3');
    console.log('   - Roles: 3 (Administrator, Technician, Viewer)\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closeDatabases();
  }
}

// Run seeder
seedDatabase();

