import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  PrismaClient,
  PostStatus,
  Role,
  UserStatus,
} from "../src/generated/prisma/client";

import {
  KL_TOWER_EVENT_2026,
  SEED_OBJECTS,
  SEED_PAGES,
  SEED_POSTS,
} from "./seed-content";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@basemalaya.club";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, status: UserStatus.APPROVED },
    create: {
      email: adminEmail,
      name: "Club Admin",
      hashedPassword: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
      country: "Malaysia",
      showInMembersDirectory: false,
    },
  });

  console.log(`✓ Admin: ${admin.email}`);

  for (const page of SEED_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { title: page.title, body: page.body },
      create: page,
    });
    console.log(`✓ Page: /${page.slug}`);
  }

  const objectBySlug = new Map<string, string>();

  for (const obj of SEED_OBJECTS) {
    const record = await prisma.baseObject.upsert({
      where: { slug: obj.slug },
      update: {
        name: obj.name,
        type: obj.type,
        description: obj.description,
        heightMeters: obj.heightMeters,
        city: obj.city,
        latitude: obj.latitude,
        longitude: obj.longitude,
        isActive: true,
      },
      create: { ...obj, isActive: true },
    });
    objectBySlug.set(obj.slug, record.id);
    console.log(`✓ Object: ${obj.name}`);
  }

  for (const post of SEED_POSTS) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        type: post.type,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        ...post,
        status: PostStatus.PUBLISHED,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
    console.log(`✓ Post: ${post.slug}`);
  }

  const klObjectId = objectBySlug.get(KL_TOWER_EVENT_2026.objectSlug);
  if (!klObjectId) {
    throw new Error(`Object not found: ${KL_TOWER_EVENT_2026.objectSlug}`);
  }

  const { objectSlug: _objectSlug, ...eventData } = KL_TOWER_EVENT_2026;

  await prisma.event.upsert({
    where: { slug: KL_TOWER_EVENT_2026.slug },
    update: {
      ...eventData,
      objectId: klObjectId,
    },
    create: {
      ...eventData,
      objectId: klObjectId,
      createdById: admin.id,
    },
  });

  console.log(`✓ Event: ${KL_TOWER_EVENT_2026.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
