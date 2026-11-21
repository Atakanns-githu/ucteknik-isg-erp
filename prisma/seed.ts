import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_COMPANY_PROFILE } from "../src/lib/settings/config";
import { ensureOfficialTemplatesSeeded } from "../src/lib/template/seed-official-templates";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Sistem Yöneticisi";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenleri tanımlı olmalı (.env.local).");
  }
  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD en az 10 karakter olmalı.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: "ADMIN", active: true },
  });
  console.log(`Yönetici hazır: ${user.email}`);

  const profileJson = {
    ...DEFAULT_COMPANY_PROFILE,
    defaultApproverName: "",
  };
  await prisma.systemSetting.upsert({
    where: { key: "company_profile" },
    update: {},
    create: {
      key: "company_profile",
      value: profileJson,
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "automation_config" },
    update: {},
    create: {
      key: "automation_config",
      value: {
        reminderDaysBefore: [60, 30, 7],
        calibrationWarningDays: 30,
        katipWarningDays: 2,
        channels: ["EMAIL", "SMS"],
        autoSendCustomerReminders: true,
        autoCreateSalesTasks: true,
        attachSignedPdfOnPublish: true,
      },
    },
  });

  await ensureOfficialTemplatesSeeded(prisma);
  console.log("144 resmi rapor şablonu veritabanı ile senkronize edildi.");
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
