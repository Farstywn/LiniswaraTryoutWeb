import fs from "fs";
import path from "path";
import mysql, {
  type Pool,
  type RowDataPacket,
  type ResultSetHeader,
} from "mysql2/promise";
import { buildSeedData } from "@/lib/seed-data";
import { isSubscriptionActive, toSafeUser } from "@/lib/auth";
import type {
  EducationLevel,
  PublicTryoutQuestion,
  QuestionUserAnswer,
  RedeemCode,
  SafeUser,
  StatementAnswer,
  TryoutAttempt,
  TryoutPackage,
  TryoutQuestion,
  TryoutSession,
  User,
  UserMaterialProgress,
  UserRedemption,
  VideoMaterial,
} from "@/types";

interface LocalStore {
  users: User[];
  redeemCodes: RedeemCode[];
  userRedemptions: UserRedemption[];
  materials: VideoMaterial[];
  materialProgress: UserMaterialProgress[];
  packages: TryoutPackage[];
  questions: TryoutQuestion[];
  attempts: TryoutAttempt[];
  tryoutSessions?: TryoutSession[];
}

const LOCAL_DATA_PATH = path.join(process.cwd(), "database", "local-data.json");

let mysqlPool: Pool | null = null;
let mysqlSchemaReady = false;
let dbMode: "mysql" | "local" | "uninitialized" = "uninitialized";
let lastDbCheckAt = 0;

function getMysqlConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "liniswara_tryout",
  };
}

async function tryInitMysql(): Promise<Pool | null> {
  const now = Date.now();
  if (dbMode === "mysql" && mysqlPool && mysqlSchemaReady) {
    return mysqlPool;
  }
  if (dbMode === "local" && now - lastDbCheckAt < 15000) {
    return null;
  }
  lastDbCheckAt = now;

  const cfg = getMysqlConfig();
  const createPool = () =>
    mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
    });

  try {
    if (!mysqlPool) {
      mysqlPool = createPool();
    }

    try {
      await mysqlPool.query("SELECT 1");
    } catch (connectErr) {
      const errCode = (connectErr as { code?: string })?.code;
      if (errCode === "ER_BAD_DB_ERROR") {
        await mysqlPool.end().catch(() => {});
        mysqlPool = null;

        // Hanya buat database otomatis (mis. di Laragon lokal) jika memang belum ada
        const bootstrapConn = await mysql.createConnection({
          host: cfg.host,
          port: cfg.port,
          user: cfg.user,
          password: cfg.password,
          connectTimeout: 5000,
        });
        try {
          await bootstrapConn.query(
            `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
          );
        } finally {
          await bootstrapConn.end().catch(() => {});
        }

        mysqlPool = createPool();
        await mysqlPool.query("SELECT 1");
      } else {
        throw connectErr;
      }
    }

    if (!mysqlSchemaReady) {
      await ensureMysqlSchemaAndSeed(mysqlPool);
      mysqlSchemaReady = true;
    }

    dbMode = "mysql";
    return mysqlPool;
  } catch (err) {
    if (mysqlPool) {
      await mysqlPool.end().catch(() => {});
      mysqlPool = null;
    }
    const errObj = err as { code?: string; message?: string } | undefined;
    console.error(
      "[Liniswara DB] Koneksi MySQL gagal, menggunakan fallback JSON lokal:",
      errObj?.code || errObj?.message || err
    );
    dbMode = "local";
    return null;
  }
}

async function ensureMysqlSchemaAndSeed(pool: Pool): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
      school VARCHAR(160) DEFAULT '',
      grade VARCHAR(60) DEFAULT 'SMA/MA',
      subscription_status ENUM('free', 'active') NOT NULL DEFAULT 'free',
      subscription_plan VARCHAR(120) DEFAULT NULL,
      subscription_expires_at DATETIME DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS redeem_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(64) NOT NULL UNIQUE,
      plan_name VARCHAR(120) NOT NULL,
      description VARCHAR(255) NOT NULL,
      duration_days INT NOT NULL DEFAULT 90,
      quota INT NOT NULL DEFAULT 100,
      used_count INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS user_redemptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      redeem_code_id INT NOT NULL,
      code VARCHAR(64) NOT NULL,
      plan_name VARCHAR(120) NOT NULL,
      redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (redeem_code_id) REFERENCES redeem_codes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS video_materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      category VARCHAR(80) NOT NULL,
      subject VARCHAR(100) NOT NULL,
      grade_level VARCHAR(60) NOT NULL,
      youtube_id VARCHAR(40) NOT NULL,
      duration VARCHAR(30) NOT NULL,
      summary TEXT NOT NULL,
      book_reference VARCHAR(180) NOT NULL,
      is_premium TINYINT(1) NOT NULL DEFAULT 1,
      order_num INT NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS user_material_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      material_id INT NOT NULL,
      completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_material (user_id, material_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES video_materials(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS tryout_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(180) NOT NULL,
      level VARCHAR(30) NOT NULL DEFAULT 'SMA/MA',
      subject VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      duration_minutes INT NOT NULL DEFAULT 30,
      question_count INT NOT NULL DEFAULT 10,
      is_premium TINYINT(1) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS tryout_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      package_id INT NOT NULL,
      question_number INT NOT NULL,
      topic VARCHAR(120) NOT NULL,
      stimulus TEXT NOT NULL,
      statement_1 TEXT NOT NULL,
      answer_1 TINYINT(1) NOT NULL,
      statement_2 TEXT NOT NULL,
      answer_2 TINYINT(1) NOT NULL,
      statement_3 TEXT NOT NULL,
      answer_3 TINYINT(1) NOT NULL,
      explanation TEXT NOT NULL,
      FOREIGN KEY (package_id) REFERENCES tryout_packages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS tryout_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      package_id INT NOT NULL,
      score DECIMAL(5,2) NOT NULL,
      correct_statements INT NOT NULL,
      total_statements INT NOT NULL,
      perfect_questions INT NOT NULL,
      answers_json LONGTEXT NOT NULL,
      duration_seconds INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES tryout_packages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS tryout_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      package_id INT NOT NULL,
      started_at_ms BIGINT NOT NULL,
      ends_at_ms BIGINT NOT NULL,
      total_seconds INT NOT NULL DEFAULT 1800,
      current_index INT NOT NULL DEFAULT 0,
      answers_json LONGTEXT NOT NULL,
      flagged_json LONGTEXT NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_package_session (user_id, package_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES tryout_packages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const sql of statements) {
    await pool.query(sql);
  }

  // Pastikan kolom level tersedia jika upgrade dari tabel versi awal
  try {
    await pool.query(
      "ALTER TABLE tryout_packages ADD COLUMN IF NOT EXISTS level VARCHAR(30) NOT NULL DEFAULT 'SMA/MA'"
    );
  } catch {
    // Abaikan jika sudah ada atau versi MySQL tidak mendukung IF NOT EXISTS pada ADD COLUMN
  }

  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS cnt FROM users"
  );
  if ((userRows[0]?.cnt ?? 0) === 0) {
    const seed = buildSeedData();

    for (const u of seed.users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, school, grade, subscription_status, subscription_plan, subscription_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          u.name,
          u.email,
          u.password_hash,
          u.role,
          u.school,
          u.grade,
          u.subscription_status,
          u.subscription_plan,
          u.subscription_expires_at
            ? toMysqlDatetime(u.subscription_expires_at)
            : null,
        ]
      );
    }

    for (const rc of seed.redeemCodes) {
      await pool.query(
        `INSERT INTO redeem_codes (id, code, plan_name, description, duration_days, quota, used_count, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rc.id,
          rc.code,
          rc.plan_name,
          rc.description,
          rc.duration_days,
          rc.quota,
          rc.used_count,
          rc.is_active ? 1 : 0,
        ]
      );
    }

    for (const m of seed.materials) {
      await pool.query(
        `INSERT INTO video_materials (id, title, category, subject, grade_level, youtube_id, duration, summary, book_reference, is_premium, order_num)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.title,
          m.category,
          m.subject,
          m.grade_level,
          m.youtube_id,
          m.duration,
          m.summary,
          m.book_reference,
          m.is_premium ? 1 : 0,
          m.order_num,
        ]
      );
    }

    for (const pkg of seed.packages) {
      await pool.query(
        `INSERT INTO tryout_packages (id, slug, title, level, subject, description, duration_minutes, question_count, is_premium)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pkg.id,
          pkg.slug,
          pkg.title,
          pkg.level,
          pkg.subject,
          pkg.description,
          pkg.duration_minutes,
          pkg.question_count,
          pkg.is_premium ? 1 : 0,
        ]
      );
    }

    // Batch insert 510 soal dalam kelompok 50 agar seed awal sangat cepat
    for (let i = 0; i < seed.questions.length; i += 50) {
      const chunk = seed.questions.slice(i, i + 50);
      const placeholders = chunk
        .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");
      const values: unknown[] = [];
      for (const q of chunk) {
        values.push(
          q.id,
          q.package_id,
          q.question_number,
          q.topic,
          q.stimulus,
          q.statement_1,
          q.answer_1 ? 1 : 0,
          q.statement_2,
          q.answer_2 ? 1 : 0,
          q.statement_3,
          q.answer_3 ? 1 : 0,
          q.explanation
        );
      }
      await pool.query(
        `INSERT INTO tryout_questions (id, package_id, question_number, topic, stimulus, statement_1, answer_1, statement_2, answer_2, statement_3, answer_3, explanation)
         VALUES ${placeholders}`,
        values
      );
    }
  } else {
    // Sinkronkan katalog lengkap (25 paket tryout, 510 soal B/S, 24 video bahasa Indonesia & 18 kode redeem) tanpa menghapus akun atau riwayat nilai
    const [pkgCntRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM tryout_packages"
    );
    const [matCntRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM video_materials"
    );
    const [qCntRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM tryout_questions"
    );
    const [foreignRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM video_materials WHERE youtube_id IN ('5MgBikgcWnY','WUvTyaaNkzM','aircAruvnKk','k5wB2w_f1vM','QpJ8H9rA2zI','ukzFI9rgwfU')"
    );
    if (
      Number(pkgCntRows[0]?.cnt ?? 0) < 25 ||
      Number(matCntRows[0]?.cnt ?? 0) < 24 ||
      Number(qCntRows[0]?.cnt ?? 0) < 500 ||
      Number(foreignRows[0]?.cnt ?? 0) > 0
    ) {
      const seed = buildSeedData();
      for (const rc of seed.redeemCodes) {
        await pool.query(
          `INSERT INTO redeem_codes (id, code, plan_name, description, duration_days, quota, used_count, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name), description = VALUES(description)`,
          [
            rc.id,
            rc.code,
            rc.plan_name,
            rc.description,
            rc.duration_days,
            rc.quota,
            rc.used_count,
            rc.is_active ? 1 : 0,
          ]
        );
      }
      for (const m of seed.materials) {
        await pool.query(
          `INSERT INTO video_materials (id, title, category, subject, grade_level, youtube_id, duration, summary, book_reference, is_premium, order_num)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title), category = VALUES(category), subject = VALUES(subject), grade_level = VALUES(grade_level), youtube_id = VALUES(youtube_id), duration = VALUES(duration), summary = VALUES(summary), book_reference = VALUES(book_reference), is_premium = VALUES(is_premium), order_num = VALUES(order_num)`,
          [
            m.id,
            m.title,
            m.category,
            m.subject,
            m.grade_level,
            m.youtube_id,
            m.duration,
            m.summary,
            m.book_reference,
            m.is_premium ? 1 : 0,
            m.order_num,
          ]
        );
      }
      for (const pkg of seed.packages) {
        await pool.query(
          `INSERT INTO tryout_packages (id, slug, title, level, subject, description, duration_minutes, question_count, is_premium)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE slug = VALUES(slug), title = VALUES(title), level = VALUES(level), subject = VALUES(subject), description = VALUES(description), duration_minutes = VALUES(duration_minutes), question_count = VALUES(question_count), is_premium = VALUES(is_premium)`,
          [
            pkg.id,
            pkg.slug,
            pkg.title,
            pkg.level,
            pkg.subject,
            pkg.description,
            pkg.duration_minutes,
            pkg.question_count,
            pkg.is_premium ? 1 : 0,
          ]
        );
      }
      for (let i = 0; i < seed.questions.length; i += 50) {
        const chunk = seed.questions.slice(i, i + 50);
        const placeholders = chunk
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .join(", ");
        const values: unknown[] = [];
        for (const q of chunk) {
          values.push(
            q.id,
            q.package_id,
            q.question_number,
            q.topic,
            q.stimulus,
            q.statement_1,
            q.answer_1 ? 1 : 0,
            q.statement_2,
            q.answer_2 ? 1 : 0,
            q.statement_3,
            q.answer_3 ? 1 : 0,
            q.explanation
          );
        }
        await pool.query(
          `INSERT INTO tryout_questions (id, package_id, question_number, topic, stimulus, statement_1, answer_1, statement_2, answer_2, statement_3, answer_3, explanation)
           VALUES ${placeholders}
           ON DUPLICATE KEY UPDATE package_id = VALUES(package_id), question_number = VALUES(question_number), topic = VALUES(topic), stimulus = VALUES(stimulus), statement_1 = VALUES(statement_1), answer_1 = VALUES(answer_1), statement_2 = VALUES(statement_2), answer_2 = VALUES(answer_2), statement_3 = VALUES(statement_3), answer_3 = VALUES(answer_3), explanation = VALUES(explanation)`,
          values
        );
      }
    }
  }
}

function toMysqlDatetime(isoString: string): string {
  return new Date(isoString).toISOString().slice(0, 19).replace("T", " ");
}

function readLocalStore(): LocalStore {
  const dir = path.dirname(LOCAL_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DATA_PATH)) {
    const seed = buildSeedData();
    const initial: LocalStore = {
      users: seed.users,
      redeemCodes: seed.redeemCodes,
      userRedemptions: [],
      materials: seed.materials,
      materialProgress: [],
      packages: seed.packages,
      questions: seed.questions,
      attempts: [],
    };
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  const raw = fs.readFileSync(LOCAL_DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as LocalStore;
  const hasForeignVideos = parsed.materials.some((m) =>
    ["5MgBikgcWnY", "WUvTyaaNkzM", "aircAruvnKk", "k5wB2w_f1vM", "QpJ8H9rA2zI", "ukzFI9rgwfU"].includes(m.youtube_id)
  );
  if (
    parsed.packages.length < 25 ||
    parsed.materials.length < 24 ||
    parsed.questions.length < 500 ||
    hasForeignVideos
  ) {
    const seed = buildSeedData();
    const rcById = new Map(seed.redeemCodes.map((c) => [c.id, c]));
    parsed.redeemCodes = parsed.redeemCodes.map((c) => rcById.get(c.id) || c);
    for (const sc of seed.redeemCodes) {
      if (!parsed.redeemCodes.some((c) => c.id === sc.id)) {
        parsed.redeemCodes.push(sc);
      }
    }
    const pkgById = new Map(seed.packages.map((p) => [p.id, p]));
    parsed.packages = parsed.packages.map((p) => pkgById.get(p.id) || p);
    for (const sp of seed.packages) {
      if (!parsed.packages.some((p) => p.id === sp.id)) {
        parsed.packages.push(sp);
      }
    }
    const matById = new Map(seed.materials.map((m) => [m.id, m]));
    parsed.materials = parsed.materials.map((m) => matById.get(m.id) || m);
    for (const sm of seed.materials) {
      if (!parsed.materials.some((m) => m.id === sm.id)) {
        parsed.materials.push(sm);
      }
    }
    const qById = new Map(seed.questions.map((q) => [q.id, q]));
    parsed.questions = parsed.questions.map((q) => qById.get(q.id) || q);
    for (const sq of seed.questions) {
      if (!parsed.questions.some((q) => q.id === sq.id)) {
        parsed.questions.push(sq);
      }
    }
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(parsed, null, 2), "utf8");
  }
  return parsed;
}

function writeLocalStore(store: LocalStore): void {
  const dir = path.dirname(LOCAL_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

function mapMysqlUser(row: RowDataPacket): User {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    password_hash: String(row.password_hash),
    role: row.role === "admin" ? "admin" : "student",
    school: String(row.school || ""),
    grade: String(row.grade || ""),
    subscription_status:
      row.subscription_status === "active" ? "active" : "free",
    subscription_plan: row.subscription_plan
      ? String(row.subscription_plan)
      : null,
    subscription_expires_at: row.subscription_expires_at
      ? new Date(row.subscription_expires_at).toISOString()
      : null,
    created_at: new Date(row.created_at).toISOString(),
  };
}

export async function getStorageMode(): Promise<"mysql" | "local"> {
  const pool = await tryInitMysql();
  return pool ? "mysql" : "local";
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
      [normalized]
    );
    return rows[0] ? mapMysqlUser(rows[0]) : null;
  }
  const store = readLocalStore();
  return (
    store.users.find((u) => u.email.toLowerCase() === normalized) || null
  );
}

export async function findUserById(id: number): Promise<User | null> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] ? mapMysqlUser(rows[0]) : null;
  }
  const store = readLocalStore();
  return store.users.find((u) => u.id === id) || null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password_hash: string;
  school: string;
  grade: string;
}): Promise<SafeUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const pool = await tryInitMysql();
  if (pool) {
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (name, email, password_hash, role, school, grade, subscription_status)
       VALUES (?, ?, ?, 'student', ?, ?, 'free')`,
      [
        input.name.trim(),
        normalizedEmail,
        input.password_hash,
        input.school.trim(),
        input.grade.trim(),
      ]
    );
    const created = await findUserById(res.insertId);
    return toSafeUser(created!);
  }

  const store = readLocalStore();
  const nextId =
    store.users.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const newUser: User = {
    id: nextId,
    name: input.name.trim(),
    email: normalizedEmail,
    password_hash: input.password_hash,
    role: "student",
    school: input.school.trim(),
    grade: input.grade.trim(),
    subscription_status: "free",
    subscription_plan: null,
    subscription_expires_at: null,
    created_at: new Date().toISOString(),
  };
  store.users.push(newUser);
  writeLocalStore(store);
  return toSafeUser(newUser);
}

export async function listRedeemCodes(): Promise<RedeemCode[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM redeem_codes ORDER BY id DESC"
    );
    return rows.map((r) => ({
      id: Number(r.id),
      code: String(r.code),
      plan_name: String(r.plan_name),
      description: String(r.description),
      duration_days: Number(r.duration_days),
      quota: Number(r.quota),
      used_count: Number(r.used_count),
      is_active: Boolean(r.is_active),
      created_at: new Date(r.created_at).toISOString(),
    }));
  }
  const store = readLocalStore();
  return [...store.redeemCodes].sort((a, b) => b.id - a.id);
}

export async function listUserRedemptions(
  userId: number
): Promise<UserRedemption[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ur.*, rc.description AS code_description
       FROM user_redemptions ur
       LEFT JOIN redeem_codes rc ON rc.id = ur.redeem_code_id
       WHERE ur.user_id = ?
       ORDER BY ur.redeemed_at DESC`,
      [userId]
    );
    return rows.map((r) => ({
      id: Number(r.id),
      user_id: Number(r.user_id),
      redeem_code_id: Number(r.redeem_code_id),
      code: String(r.code),
      plan_name: String(r.plan_name),
      description: String(r.code_description || ""),
      redeemed_at: new Date(r.redeemed_at).toISOString(),
      expires_at: new Date(r.expires_at).toISOString(),
    }));
  }
  const store = readLocalStore();
  const codeDescMap = new Map(
    store.redeemCodes.map((c) => [c.id, c.description])
  );
  return store.userRedemptions
    .filter((r) => r.user_id === userId)
    .map((r) => ({
      ...r,
      description: r.description || codeDescMap.get(r.redeem_code_id) || "",
    }))
    .sort(
      (a, b) =>
        new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime()
    );
}

export async function redeemCodeForUser(
  userId: number,
  rawCode: string
): Promise<
  | { ok: true; user: SafeUser; redemption: UserRedemption }
  | { ok: false; error: string }
> {
  const normalizedCode = rawCode.trim().toUpperCase();
  if (!normalizedCode) {
    return { ok: false, error: "Masukkan kode redeem terlebih dahulu." };
  }

  const pool = await tryInitMysql();
  if (pool) {
    const [codeRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM redeem_codes WHERE UPPER(code) = ? LIMIT 1",
      [normalizedCode]
    );
    const codeRow = codeRows[0];
    if (!codeRow) {
      return { ok: false, error: "Kode redeem tidak ditemukan." };
    }
    if (!codeRow.is_active) {
      return { ok: false, error: "Kode redeem sudah dinonaktifkan." };
    }
    if (Number(codeRow.used_count) >= Number(codeRow.quota)) {
      return { ok: false, error: "Kuota kode redeem sudah habis." };
    }

    const [alreadyRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM user_redemptions WHERE user_id = ? AND redeem_code_id = ? LIMIT 1",
      [userId, codeRow.id]
    );
    if (alreadyRows.length > 0) {
      return {
        ok: false,
        error: "Anda sudah pernah menggunakan kode redeem ini.",
      };
    }

    const user = await findUserById(userId);
    if (!user) return { ok: false, error: "Pengguna tidak ditemukan." };

    const baseDate =
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at).getTime() > Date.now()
        ? new Date(user.subscription_expires_at).getTime()
        : Date.now();
    const expiresAt = new Date(
      baseDate + Number(codeRow.duration_days) * 24 * 60 * 60 * 1000
    ).toISOString();

    const [updateRes] = await pool.query<ResultSetHeader>(
      "UPDATE redeem_codes SET used_count = used_count + 1 WHERE id = ? AND is_active = 1 AND used_count < quota",
      [codeRow.id]
    );
    if (updateRes.affectedRows === 0) {
      return {
        ok: false,
        error: "Kuota kode redeem sudah habis atau kode telah dinonaktifkan.",
      };
    }
    await pool.query(
      `UPDATE users SET subscription_status = 'active', subscription_plan = ?, subscription_expires_at = ? WHERE id = ?`,
      [codeRow.plan_name, toMysqlDatetime(expiresAt), userId]
    );
    const [insertRes] = await pool.query<ResultSetHeader>(
      `INSERT INTO user_redemptions (user_id, redeem_code_id, code, plan_name, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        codeRow.id,
        codeRow.code,
        codeRow.plan_name,
        toMysqlDatetime(expiresAt),
      ]
    );

    const updatedUser = await findUserById(userId);
    return {
      ok: true,
      user: toSafeUser(updatedUser!),
      redemption: {
        id: insertRes.insertId,
        user_id: userId,
        redeem_code_id: Number(codeRow.id),
        code: String(codeRow.code),
        plan_name: String(codeRow.plan_name),
        description: String(codeRow.description || ""),
        redeemed_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
    };
  }

  const store = readLocalStore();
  const codeObj = store.redeemCodes.find(
    (c) => c.code.toUpperCase() === normalizedCode
  );
  if (!codeObj) {
    return { ok: false, error: "Kode redeem tidak ditemukan." };
  }
  if (!codeObj.is_active) {
    return { ok: false, error: "Kode redeem sudah dinonaktifkan." };
  }
  if (codeObj.used_count >= codeObj.quota) {
    return { ok: false, error: "Kuota kode redeem sudah habis." };
  }

  const duplicate = store.userRedemptions.find(
    (r) => r.user_id === userId && r.redeem_code_id === codeObj.id
  );
  if (duplicate) {
    return {
      ok: false,
      error: "Anda sudah pernah menggunakan kode redeem ini.",
    };
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) return { ok: false, error: "Pengguna tidak ditemukan." };

  const baseDate =
    user.subscription_expires_at &&
    new Date(user.subscription_expires_at).getTime() > Date.now()
      ? new Date(user.subscription_expires_at).getTime()
      : Date.now();
  const expiresAt = new Date(
    baseDate + codeObj.duration_days * 24 * 60 * 60 * 1000
  ).toISOString();

  codeObj.used_count += 1;
  user.subscription_status = "active";
  user.subscription_plan = codeObj.plan_name;
  user.subscription_expires_at = expiresAt;

  const redemption: UserRedemption = {
    id:
      store.userRedemptions.reduce((max, item) => Math.max(max, item.id), 0) +
      1,
    user_id: userId,
    redeem_code_id: codeObj.id,
    code: codeObj.code,
    plan_name: codeObj.plan_name,
    redeemed_at: new Date().toISOString(),
    expires_at: expiresAt,
  };
  store.userRedemptions.push(redemption);
  writeLocalStore(store);

  return { ok: true, user: toSafeUser(user), redemption };
}

export async function createRedeemCode(input: {
  code: string;
  plan_name: string;
  description: string;
  duration_days: number;
  quota: number;
}): Promise<{ ok: true; item: RedeemCode } | { ok: false; error: string }> {
  const normalized = input.code.trim().toUpperCase();
  if (!normalized || !input.plan_name.trim()) {
    return { ok: false, error: "Kode dan nama paket wajib diisi." };
  }

  const pool = await tryInitMysql();
  if (pool) {
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM redeem_codes WHERE UPPER(code) = ? LIMIT 1",
      [normalized]
    );
    if (existing.length > 0) {
      return { ok: false, error: "Kode redeem tersebut sudah terdaftar." };
    }
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO redeem_codes (code, plan_name, description, duration_days, quota, used_count, is_active)
       VALUES (?, ?, ?, ?, ?, 0, 1)`,
      [
        normalized,
        input.plan_name.trim(),
        input.description.trim() || "Voucher aktivasi resmi Liniswara",
        input.duration_days,
        input.quota,
      ]
    );
    return {
      ok: true,
      item: {
        id: res.insertId,
        code: normalized,
        plan_name: input.plan_name.trim(),
        description:
          input.description.trim() || "Voucher aktivasi resmi Liniswara",
        duration_days: input.duration_days,
        quota: input.quota,
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    };
  }

  const store = readLocalStore();
  if (store.redeemCodes.some((c) => c.code.toUpperCase() === normalized)) {
    return { ok: false, error: "Kode redeem tersebut sudah terdaftar." };
  }
  const item: RedeemCode = {
    id: store.redeemCodes.reduce((m, c) => Math.max(m, c.id), 0) + 1,
    code: normalized,
    plan_name: input.plan_name.trim(),
    description:
      input.description.trim() || "Voucher aktivasi resmi Liniswara",
    duration_days: input.duration_days,
    quota: input.quota,
    used_count: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  store.redeemCodes.push(item);
  writeLocalStore(store);
  return { ok: true, item };
}

export async function toggleRedeemCodeStatus(
  id: number,
  isActive: boolean
): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query("UPDATE redeem_codes SET is_active = ? WHERE id = ?", [
      isActive ? 1 : 0,
      id,
    ]);
    return;
  }
  const store = readLocalStore();
  const target = store.redeemCodes.find((c) => c.id === id);
  if (target) {
    target.is_active = isActive;
    writeLocalStore(store);
  }
}

export async function updateRedeemCode(input: {
  id: number;
  code: string;
  plan_name: string;
  description: string;
  duration_days: number;
  quota: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = input.code.trim().toUpperCase();
  if (!normalized || !input.plan_name.trim()) {
    return { ok: false, error: "Kode dan nama paket wajib diisi." };
  }
  const pool = await tryInitMysql();
  if (pool) {
    const [dup] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM redeem_codes WHERE UPPER(code) = ? AND id <> ? LIMIT 1",
      [normalized, input.id]
    );
    if (dup.length > 0) {
      return { ok: false, error: "Kode redeem sudah digunakan entri lain." };
    }
    await pool.query(
      `UPDATE redeem_codes SET code = ?, plan_name = ?, description = ?, duration_days = ?, quota = ? WHERE id = ?`,
      [
        normalized,
        input.plan_name.trim(),
        input.description.trim() || "Voucher aktivasi resmi Liniswara",
        input.duration_days,
        input.quota,
        input.id,
      ]
    );
    return { ok: true };
  }
  const store = readLocalStore();
  if (
    store.redeemCodes.some(
      (c) => c.code.toUpperCase() === normalized && c.id !== input.id
    )
  ) {
    return { ok: false, error: "Kode redeem sudah digunakan entri lain." };
  }
  const target = store.redeemCodes.find((c) => c.id === input.id);
  if (target) {
    target.code = normalized;
    target.plan_name = input.plan_name.trim();
    target.description =
      input.description.trim() || "Voucher aktivasi resmi Liniswara";
    target.duration_days = input.duration_days;
    target.quota = input.quota;
    writeLocalStore(store);
  }
  return { ok: true };
}

export async function deleteRedeemCode(id: number): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query("DELETE FROM redeem_codes WHERE id = ?", [id]);
    return;
  }
  const store = readLocalStore();
  store.redeemCodes = store.redeemCodes.filter((c) => c.id !== id);
  writeLocalStore(store);
}

export async function listVideoMaterials(): Promise<VideoMaterial[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM video_materials ORDER BY order_num ASC, id ASC"
    );
    return rows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      category: String(r.category),
      subject: String(r.subject),
      grade_level: String(r.grade_level),
      youtube_id: String(r.youtube_id),
      duration: String(r.duration),
      summary: String(r.summary),
      book_reference: String(r.book_reference),
      is_premium: Boolean(r.is_premium),
      order_num: Number(r.order_num),
    }));
  }
  const store = readLocalStore();
  return [...store.materials].sort((a, b) => a.order_num - b.order_num);
}

export async function createVideoMaterial(input: {
  title: string;
  category: string;
  subject: string;
  grade_level: string;
  youtube_id: string;
  duration: string;
  summary: string;
  book_reference: string;
  is_premium: boolean;
}): Promise<VideoMaterial> {
  const cleanYoutube = extractYoutubeId(input.youtube_id);
  const pool = await tryInitMysql();
  if (pool) {
    const [cntRows] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(order_num), 0) AS max_order FROM video_materials"
    );
    const nextOrder = Number(cntRows[0]?.max_order || 0) + 1;
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO video_materials (title, category, subject, grade_level, youtube_id, duration, summary, book_reference, is_premium, order_num)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title.trim(),
        input.category.trim(),
        input.subject.trim(),
        input.grade_level.trim(),
        cleanYoutube,
        input.duration.trim() || "15:00",
        input.summary.trim(),
        input.book_reference.trim() || "Buku Terbitan Liniswara",
        input.is_premium ? 1 : 0,
        nextOrder,
      ]
    );
    return {
      id: res.insertId,
      title: input.title.trim(),
      category: input.category.trim(),
      subject: input.subject.trim(),
      grade_level: input.grade_level.trim(),
      youtube_id: cleanYoutube,
      duration: input.duration.trim() || "15:00",
      summary: input.summary.trim(),
      book_reference: input.book_reference.trim() || "Buku Terbitan Liniswara",
      is_premium: input.is_premium,
      order_num: nextOrder,
    };
  }

  const store = readLocalStore();
  const nextId = store.materials.reduce((m, v) => Math.max(m, v.id), 0) + 1;
  const nextOrder =
    store.materials.reduce((m, v) => Math.max(m, v.order_num), 0) + 1;
  const item: VideoMaterial = {
    id: nextId,
    title: input.title.trim(),
    category: input.category.trim(),
    subject: input.subject.trim(),
    grade_level: input.grade_level.trim(),
    youtube_id: cleanYoutube,
    duration: input.duration.trim() || "15:00",
    summary: input.summary.trim(),
    book_reference: input.book_reference.trim() || "Buku Terbitan Liniswara",
    is_premium: input.is_premium,
    order_num: nextOrder,
  };
  store.materials.push(item);
  writeLocalStore(store);
  return item;
}

export async function updateVideoMaterial(input: {
  id: number;
  title: string;
  category: string;
  subject: string;
  grade_level: string;
  youtube_id: string;
  duration: string;
  summary: string;
  book_reference: string;
  is_premium: boolean;
}): Promise<void> {
  const cleanYoutube = extractYoutubeId(input.youtube_id);
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query(
      `UPDATE video_materials SET title = ?, category = ?, subject = ?, grade_level = ?, youtube_id = ?, duration = ?, summary = ?, book_reference = ?, is_premium = ? WHERE id = ?`,
      [
        input.title.trim(),
        input.category.trim(),
        input.subject.trim(),
        input.grade_level.trim(),
        cleanYoutube,
        input.duration.trim() || "15:00",
        input.summary.trim(),
        input.book_reference.trim() || "Buku Terbitan Liniswara",
        input.is_premium ? 1 : 0,
        input.id,
      ]
    );
    return;
  }
  const store = readLocalStore();
  const target = store.materials.find((m) => m.id === input.id);
  if (target) {
    target.title = input.title.trim();
    target.category = input.category.trim();
    target.subject = input.subject.trim();
    target.grade_level = input.grade_level.trim();
    target.youtube_id = cleanYoutube;
    target.duration = input.duration.trim() || "15:00";
    target.summary = input.summary.trim();
    target.book_reference =
      input.book_reference.trim() || "Buku Terbitan Liniswara";
    target.is_premium = input.is_premium;
    writeLocalStore(store);
  }
}

export async function deleteVideoMaterial(id: number): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query("DELETE FROM video_materials WHERE id = ?", [id]);
    return;
  }
  const store = readLocalStore();
  store.materials = store.materials.filter((m) => m.id !== id);
  writeLocalStore(store);
}

function extractYoutubeId(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? match[1] : trimmed;
}

export async function listCompletedMaterialIds(
  userId: number
): Promise<number[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT material_id FROM user_material_progress WHERE user_id = ?",
      [userId]
    );
    return rows.map((r) => Number(r.material_id));
  }
  const store = readLocalStore();
  return store.materialProgress
    .filter((p) => p.user_id === userId)
    .map((p) => p.material_id);
}

export async function toggleMaterialCompleted(
  userId: number,
  materialId: number
): Promise<boolean> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM user_material_progress WHERE user_id = ? AND material_id = ? LIMIT 1",
      [userId, materialId]
    );
    if (rows.length > 0) {
      await pool.query(
        "DELETE FROM user_material_progress WHERE user_id = ? AND material_id = ?",
        [userId, materialId]
      );
      return false;
    }
    await pool.query(
      "INSERT INTO user_material_progress (user_id, material_id) VALUES (?, ?)",
      [userId, materialId]
    );
    return true;
  }

  const store = readLocalStore();
  const idx = store.materialProgress.findIndex(
    (p) => p.user_id === userId && p.material_id === materialId
  );
  if (idx >= 0) {
    store.materialProgress.splice(idx, 1);
    writeLocalStore(store);
    return false;
  }
  store.materialProgress.push({
    id: store.materialProgress.reduce((m, p) => Math.max(m, p.id), 0) + 1,
    user_id: userId,
    material_id: materialId,
    completed_at: new Date().toISOString(),
  });
  writeLocalStore(store);
  return true;
}

export async function listTryoutPackages(): Promise<TryoutPackage[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_packages ORDER BY id ASC"
    );
    return rows.map((r) => ({
      id: Number(r.id),
      slug: String(r.slug),
      title: String(r.title),
      level: (String(r.level || "SMA/MA") as EducationLevel),
      subject: String(r.subject),
      description: String(r.description),
      duration_minutes: Number(r.duration_minutes),
      question_count: Number(r.question_count),
      is_premium: Boolean(r.is_premium),
    }));
  }
  const store = readLocalStore();
  return [...store.packages].sort((a, b) => a.id - b.id);
}

export async function getTryoutPackageById(
  packageId: number
): Promise<TryoutPackage | null> {
  const packages = await listTryoutPackages();
  return packages.find((p) => p.id === packageId) || null;
}

function buildPackageSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return `${base || "paket-tryout"}-${Date.now().toString(36).slice(-4)}`;
}

export async function createTryoutPackage(input: {
  title: string;
  level: EducationLevel;
  subject: string;
  description: string;
  duration_minutes: number;
  is_premium: boolean;
}): Promise<TryoutPackage> {
  const slug = buildPackageSlug(input.title);
  const duration = Math.max(5, Number(input.duration_minutes || 30));
  const desc =
    input.description.trim() ||
    "Paket simulasi tryout Liniswara dengan format soal pilihan ganda kompleks 3 pernyataan Benar/Salah.";
  const pool = await tryInitMysql();
  if (pool) {
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO tryout_packages (slug, title, level, subject, description, duration_minutes, question_count, is_premium)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        slug,
        input.title.trim(),
        input.level,
        input.subject.trim() || input.level,
        desc,
        duration,
        input.is_premium ? 1 : 0,
      ]
    );
    return {
      id: res.insertId,
      slug,
      title: input.title.trim(),
      level: input.level,
      subject: input.subject.trim() || input.level,
      description: desc,
      duration_minutes: duration,
      question_count: 0,
      is_premium: input.is_premium,
    };
  }

  const store = readLocalStore();
  const nextId = store.packages.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const item: TryoutPackage = {
    id: nextId,
    slug,
    title: input.title.trim(),
    level: input.level,
    subject: input.subject.trim() || input.level,
    description: desc,
    duration_minutes: duration,
    question_count: 0,
    is_premium: input.is_premium,
  };
  store.packages.push(item);
  writeLocalStore(store);
  return item;
}

export async function updateTryoutPackage(input: {
  id: number;
  title: string;
  level: EducationLevel;
  subject: string;
  description: string;
  duration_minutes: number;
  is_premium: boolean;
}): Promise<void> {
  const duration = Math.max(5, Number(input.duration_minutes || 30));
  const desc =
    input.description.trim() ||
    "Paket simulasi tryout Liniswara dengan format soal pilihan ganda kompleks 3 pernyataan Benar/Salah.";
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query(
      `UPDATE tryout_packages SET title = ?, level = ?, subject = ?, description = ?, duration_minutes = ?, is_premium = ? WHERE id = ?`,
      [
        input.title.trim(),
        input.level,
        input.subject.trim() || input.level,
        desc,
        duration,
        input.is_premium ? 1 : 0,
        input.id,
      ]
    );
    return;
  }

  const store = readLocalStore();
  const target = store.packages.find((p) => p.id === input.id);
  if (target) {
    target.title = input.title.trim();
    target.level = input.level;
    target.subject = input.subject.trim() || input.level;
    target.description = desc;
    target.duration_minutes = duration;
    target.is_premium = input.is_premium;
    writeLocalStore(store);
  }
}

export async function deleteTryoutPackage(id: number): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query("DELETE FROM tryout_packages WHERE id = ?", [id]);
    return;
  }
  const store = readLocalStore();
  store.packages = store.packages.filter((p) => p.id !== id);
  store.questions = store.questions.filter((q) => q.package_id !== id);
  store.attempts = store.attempts.filter((a) => a.package_id !== id);
  writeLocalStore(store);
}

export async function listTryoutQuestions(
  packageId: number
): Promise<TryoutQuestion[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_questions WHERE package_id = ? ORDER BY question_number ASC",
      [packageId]
    );
    return rows.map((r) => ({
      id: Number(r.id),
      package_id: Number(r.package_id),
      question_number: Number(r.question_number),
      topic: String(r.topic),
      stimulus: String(r.stimulus),
      statement_1: String(r.statement_1),
      answer_1: Boolean(r.answer_1),
      statement_2: String(r.statement_2),
      answer_2: Boolean(r.answer_2),
      statement_3: String(r.statement_3),
      answer_3: Boolean(r.answer_3),
      explanation: String(r.explanation),
    }));
  }
  const store = readLocalStore();
  return store.questions
    .filter((q) => q.package_id === packageId)
    .sort((a, b) => a.question_number - b.question_number);
}

export async function createTryoutQuestion(input: {
  package_id: number;
  topic: string;
  stimulus: string;
  statement_1: string;
  answer_1: boolean;
  statement_2: string;
  answer_2: boolean;
  statement_3: string;
  answer_3: boolean;
  explanation: string;
}): Promise<TryoutQuestion> {
  const pool = await tryInitMysql();
  if (pool) {
    const [numRows] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(question_number), 0) AS max_num FROM tryout_questions WHERE package_id = ?",
      [input.package_id]
    );
    const nextNum = Number(numRows[0]?.max_num || 0) + 1;
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO tryout_questions (package_id, question_number, topic, stimulus, statement_1, answer_1, statement_2, answer_2, statement_3, answer_3, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.package_id,
        nextNum,
        input.topic.trim(),
        input.stimulus.trim(),
        input.statement_1.trim(),
        input.answer_1 ? 1 : 0,
        input.statement_2.trim(),
        input.answer_2 ? 1 : 0,
        input.statement_3.trim(),
        input.answer_3 ? 1 : 0,
        input.explanation.trim(),
      ]
    );
    await pool.query(
      "UPDATE tryout_packages SET question_count = ? WHERE id = ?",
      [nextNum, input.package_id]
    );
    return {
      id: res.insertId,
      package_id: input.package_id,
      question_number: nextNum,
      topic: input.topic.trim(),
      stimulus: input.stimulus.trim(),
      statement_1: input.statement_1.trim(),
      answer_1: input.answer_1,
      statement_2: input.statement_2.trim(),
      answer_2: input.answer_2,
      statement_3: input.statement_3.trim(),
      answer_3: input.answer_3,
      explanation: input.explanation.trim(),
    };
  }

  const store = readLocalStore();
  const nextId = store.questions.reduce((m, q) => Math.max(m, q.id), 0) + 1;
  const pkgQs = store.questions.filter((q) => q.package_id === input.package_id);
  const nextNum =
    pkgQs.reduce((m, q) => Math.max(m, q.question_number), 0) + 1;

  const newQ: TryoutQuestion = {
    id: nextId,
    package_id: input.package_id,
    question_number: nextNum,
    topic: input.topic.trim(),
    stimulus: input.stimulus.trim(),
    statement_1: input.statement_1.trim(),
    answer_1: input.answer_1,
    statement_2: input.statement_2.trim(),
    answer_2: input.answer_2,
    statement_3: input.statement_3.trim(),
    answer_3: input.answer_3,
    explanation: input.explanation.trim(),
  };
  store.questions.push(newQ);
  const targetPkg = store.packages.find((p) => p.id === input.package_id);
  if (targetPkg) targetPkg.question_count = nextNum;
  writeLocalStore(store);
  return newQ;
}

export async function updateTryoutQuestion(input: {
  id: number;
  package_id: number;
  topic: string;
  stimulus: string;
  statement_1: string;
  answer_1: boolean;
  statement_2: string;
  answer_2: boolean;
  statement_3: string;
  answer_3: boolean;
  explanation: string;
}): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query(
      `UPDATE tryout_questions SET topic = ?, stimulus = ?, statement_1 = ?, answer_1 = ?, statement_2 = ?, answer_2 = ?, statement_3 = ?, answer_3 = ?, explanation = ? WHERE id = ?`,
      [
        input.topic.trim(),
        input.stimulus.trim(),
        input.statement_1.trim(),
        input.answer_1 ? 1 : 0,
        input.statement_2.trim(),
        input.answer_2 ? 1 : 0,
        input.statement_3.trim(),
        input.answer_3 ? 1 : 0,
        input.explanation.trim(),
        input.id,
      ]
    );
    return;
  }
  const store = readLocalStore();
  const target = store.questions.find((q) => q.id === input.id);
  if (target) {
    target.topic = input.topic.trim();
    target.stimulus = input.stimulus.trim();
    target.statement_1 = input.statement_1.trim();
    target.answer_1 = input.answer_1;
    target.statement_2 = input.statement_2.trim();
    target.answer_2 = input.answer_2;
    target.statement_3 = input.statement_3.trim();
    target.answer_3 = input.answer_3;
    target.explanation = input.explanation.trim();
    writeLocalStore(store);
  }
}

export async function deleteTryoutQuestion(
  id: number,
  packageId: number
): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query("DELETE FROM tryout_questions WHERE id = ?", [id]);
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM tryout_questions WHERE package_id = ? ORDER BY question_number ASC, id ASC",
      [packageId]
    );
    for (let i = 0; i < rows.length; i++) {
      await pool.query(
        "UPDATE tryout_questions SET question_number = ? WHERE id = ?",
        [i + 1, rows[i].id]
      );
    }
    await pool.query(
      "UPDATE tryout_packages SET question_count = ? WHERE id = ?",
      [rows.length, packageId]
    );
    return;
  }
  const store = readLocalStore();
  store.questions = store.questions.filter((q) => q.id !== id);
  const pkgQs = store.questions
    .filter((q) => q.package_id === packageId)
    .sort((a, b) => a.question_number - b.question_number);
  pkgQs.forEach((q, idx) => {
    q.question_number = idx + 1;
  });
  const targetPkg = store.packages.find((p) => p.id === packageId);
  if (targetPkg) targetPkg.question_count = pkgQs.length;
  writeLocalStore(store);
}

export function toPublicQuestions(
  questions: TryoutQuestion[]
): PublicTryoutQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    package_id: q.package_id,
    question_number: q.question_number,
    topic: q.topic,
    stimulus: q.stimulus,
    statement_1: q.statement_1,
    statement_2: q.statement_2,
    statement_3: q.statement_3,
  }));
}

export async function saveTryoutAttempt(input: {
  userId: number;
  packageId: number;
  answers: QuestionUserAnswer[];
  durationSeconds: number;
}): Promise<{
  attempt: TryoutAttempt;
  review: Array<{
    question: TryoutQuestion;
    userAnswers: [boolean | null, boolean | null, boolean | null];
    correctCount: number;
  }>;
}> {
  const questions = await listTryoutQuestions(input.packageId);
  const answerMap = new Map<
    number,
    [boolean | null, boolean | null, boolean | null]
  >();
  for (const a of input.answers) {
    answerMap.set(a.questionId, a.answers);
  }

  let correctStatements = 0;
  let perfectQuestions = 0;
  const totalStatements = questions.length * 3;

  const review = questions.map((q) => {
    const userAns = answerMap.get(q.id) || [null, null, null];
    const keys: [boolean, boolean, boolean] = [
      q.answer_1,
      q.answer_2,
      q.answer_3,
    ];
    let qCorrect = 0;
    for (let i = 0; i < 3; i++) {
      if (userAns[i] === keys[i]) {
        qCorrect += 1;
        correctStatements += 1;
      }
    }
    if (qCorrect === 3) perfectQuestions += 1;
    return {
      question: q,
      userAnswers: userAns,
      correctCount: qCorrect,
    };
  });

  const score =
    totalStatements > 0
      ? Math.round((correctStatements / totalStatements) * 10000) / 100
      : 0;
  const answersJson = JSON.stringify(input.answers);

  const pool = await tryInitMysql();
  if (pool) {
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO tryout_attempts (user_id, package_id, score, correct_statements, total_statements, perfect_questions, answers_json, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        input.packageId,
        score,
        correctStatements,
        totalStatements,
        perfectQuestions,
        answersJson,
        input.durationSeconds,
      ]
    );
    return {
      attempt: {
        id: res.insertId,
        user_id: input.userId,
        package_id: input.packageId,
        score,
        correct_statements: correctStatements,
        total_statements: totalStatements,
        perfect_questions: perfectQuestions,
        answers_json: answersJson,
        duration_seconds: input.durationSeconds,
        created_at: new Date().toISOString(),
      },
      review,
    };
  }

  const store = readLocalStore();
  const attempt: TryoutAttempt = {
    id: store.attempts.reduce((m, a) => Math.max(m, a.id), 0) + 1,
    user_id: input.userId,
    package_id: input.packageId,
    score,
    correct_statements: correctStatements,
    total_statements: totalStatements,
    perfect_questions: perfectQuestions,
    answers_json: answersJson,
    duration_seconds: input.durationSeconds,
    created_at: new Date().toISOString(),
  };
  store.attempts.push(attempt);
  writeLocalStore(store);

  return { attempt, review };
}

function mapMysqlTryoutSession(r: RowDataPacket): TryoutSession {
  let answers: Record<
    number,
    [StatementAnswer, StatementAnswer, StatementAnswer]
  > = {};
  let flagged: Record<number, boolean> = {};
  try {
    answers = JSON.parse(String(r.answers_json || "{}"));
  } catch {
    answers = {};
  }
  try {
    flagged = JSON.parse(String(r.flagged_json || "{}"));
  } catch {
    flagged = {};
  }
  return {
    id: Number(r.id),
    user_id: Number(r.user_id),
    package_id: Number(r.package_id),
    started_at_ms: Number(r.started_at_ms),
    ends_at_ms: Number(r.ends_at_ms),
    total_seconds: Number(r.total_seconds),
    current_index: Number(r.current_index || 0),
    answers,
    flagged,
    updated_at: r.updated_at
      ? new Date(r.updated_at).toISOString()
      : new Date().toISOString(),
  };
}

export async function getTryoutSession(
  userId: number,
  packageId: number
): Promise<TryoutSession | null> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_sessions WHERE user_id = ? AND package_id = ? LIMIT 1",
      [userId, packageId]
    );
    return rows[0] ? mapMysqlTryoutSession(rows[0]) : null;
  }
  const store = readLocalStore();
  const list = store.tryoutSessions || [];
  return (
    list.find((s) => s.user_id === userId && s.package_id === packageId) || null
  );
}

export async function listUserTryoutSessions(
  userId: number
): Promise<TryoutSession[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_sessions WHERE user_id = ?",
      [userId]
    );
    return rows.map(mapMysqlTryoutSession);
  }
  const store = readLocalStore();
  return (store.tryoutSessions || []).filter((s) => s.user_id === userId);
}

export async function startOrResumeTryoutSession(
  userId: number,
  packageId: number,
  durationMinutes: number
): Promise<TryoutSession> {
  const now = Date.now();
  const totalSeconds = Math.max(60, durationMinutes * 60);
  const existing = await getTryoutSession(userId, packageId);
  if (existing && existing.ends_at_ms > now) {
    return existing;
  }

  const endsAtMs = now + totalSeconds * 1000;
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query(
      `INSERT INTO tryout_sessions (user_id, package_id, started_at_ms, ends_at_ms, total_seconds, current_index, answers_json, flagged_json)
       VALUES (?, ?, ?, ?, ?, 0, '{}', '{}')
       ON DUPLICATE KEY UPDATE started_at_ms = VALUES(started_at_ms), ends_at_ms = VALUES(ends_at_ms), total_seconds = VALUES(total_seconds), current_index = 0, answers_json = '{}', flagged_json = '{}'`,
      [userId, packageId, now, endsAtMs, totalSeconds]
    );
    const created = await getTryoutSession(userId, packageId);
    if (created) return created;
  }

  const store = readLocalStore();
  if (!store.tryoutSessions) store.tryoutSessions = [];
  store.tryoutSessions = store.tryoutSessions.filter(
    (s) => !(s.user_id === userId && s.package_id === packageId)
  );
  const session: TryoutSession = {
    id: store.tryoutSessions.reduce((m, s) => Math.max(m, s.id), 0) + 1,
    user_id: userId,
    package_id: packageId,
    started_at_ms: now,
    ends_at_ms: endsAtMs,
    total_seconds: totalSeconds,
    current_index: 0,
    answers: {},
    flagged: {},
    updated_at: new Date(now).toISOString(),
  };
  store.tryoutSessions.push(session);
  writeLocalStore(store);
  return session;
}

export async function saveTryoutSessionProgress(
  userId: number,
  packageId: number,
  input: {
    currentIndex: number;
    answers: Record<
      number,
      [StatementAnswer, StatementAnswer, StatementAnswer]
    >;
    flagged: Record<number, boolean>;
  }
): Promise<boolean> {
  const existing = await getTryoutSession(userId, packageId);
  if (!existing) return false;
  // Izinkan grace period 60 detik pasca deadline untuk final flush sebelum auto-submit
  if (Date.now() > existing.ends_at_ms + 60_000) return false;

  const safeIndex = Math.max(0, Math.floor(Number(input.currentIndex) || 0));
  const answersJson = JSON.stringify(input.answers || {});
  const flaggedJson = JSON.stringify(input.flagged || {});

  const pool = await tryInitMysql();
  if (pool) {
    await pool.query(
      `UPDATE tryout_sessions SET current_index = ?, answers_json = ?, flagged_json = ? WHERE user_id = ? AND package_id = ?`,
      [safeIndex, answersJson, flaggedJson, userId, packageId]
    );
    return true;
  }

  const store = readLocalStore();
  const list = store.tryoutSessions || [];
  const target = list.find(
    (s) => s.user_id === userId && s.package_id === packageId
  );
  if (!target) return false;
  target.current_index = safeIndex;
  target.answers = input.answers || {};
  target.flagged = input.flagged || {};
  target.updated_at = new Date().toISOString();
  writeLocalStore(store);
  return true;
}

export async function deleteTryoutSession(
  userId: number,
  packageId: number
): Promise<void> {
  const pool = await tryInitMysql();
  if (pool) {
    await pool.query(
      "DELETE FROM tryout_sessions WHERE user_id = ? AND package_id = ?",
      [userId, packageId]
    );
    return;
  }
  const store = readLocalStore();
  if (!store.tryoutSessions) return;
  store.tryoutSessions = store.tryoutSessions.filter(
    (s) => !(s.user_id === userId && s.package_id === packageId)
  );
  writeLocalStore(store);
}

export async function listUserAttempts(
  userId: number
): Promise<Array<TryoutAttempt & { package_title: string }>> {
  const packages = await listTryoutPackages();
  const pkgMap = new Map(packages.map((p) => [p.id, p.title]));

  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_attempts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows.map((r) => ({
      id: Number(r.id),
      user_id: Number(r.user_id),
      package_id: Number(r.package_id),
      score: Number(r.score),
      correct_statements: Number(r.correct_statements),
      total_statements: Number(r.total_statements),
      perfect_questions: Number(r.perfect_questions),
      answers_json: String(r.answers_json),
      duration_seconds: Number(r.duration_seconds),
      created_at: new Date(r.created_at).toISOString(),
      package_title: pkgMap.get(Number(r.package_id)) || "Simulasi Tryout",
    }));
  }

  const store = readLocalStore();
  return store.attempts
    .filter((a) => a.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((a) => ({
      ...a,
      package_title: pkgMap.get(a.package_id) || "Simulasi Tryout",
    }));
}

export async function getTryoutAttemptReviewById(
  attemptId: number,
  userId: number,
  isAdmin: boolean
): Promise<{
  attempt: TryoutAttempt;
  review: Array<{
    question: TryoutQuestion;
    userAnswers: [boolean | null, boolean | null, boolean | null];
    correctCount: number;
  }>;
} | null> {
  let attempt: TryoutAttempt | null = null;
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_attempts WHERE id = ? LIMIT 1",
      [attemptId]
    );
    if (rows[0]) {
      const r = rows[0];
      attempt = {
        id: Number(r.id),
        user_id: Number(r.user_id),
        package_id: Number(r.package_id),
        score: Number(r.score),
        correct_statements: Number(r.correct_statements),
        total_statements: Number(r.total_statements),
        perfect_questions: Number(r.perfect_questions),
        answers_json: String(r.answers_json),
        duration_seconds: Number(r.duration_seconds),
        created_at: new Date(r.created_at).toISOString(),
      };
    }
  } else {
    const store = readLocalStore();
    attempt = store.attempts.find((a) => a.id === attemptId) || null;
  }

  if (!attempt) return null;
  if (!isAdmin && attempt.user_id !== userId) return null;

  let parsedAnswers: QuestionUserAnswer[] = [];
  try {
    parsedAnswers = JSON.parse(attempt.answers_json) as QuestionUserAnswer[];
  } catch {
    parsedAnswers = [];
  }

  const questions = await listTryoutQuestions(attempt.package_id);
  const answerMap = new Map<
    number,
    [boolean | null, boolean | null, boolean | null]
  >();
  for (const a of parsedAnswers) {
    answerMap.set(a.questionId, a.answers);
  }

  const review = questions.map((q) => {
    const userAns = answerMap.get(q.id) || [null, null, null];
    const keys: [boolean, boolean, boolean] = [
      q.answer_1,
      q.answer_2,
      q.answer_3,
    ];
    let qCorrect = 0;
    for (let i = 0; i < 3; i++) {
      if (userAns[i] === keys[i]) qCorrect += 1;
    }
    return {
      question: q,
      userAnswers: userAns,
      correctCount: qCorrect,
    };
  });

  return { attempt, review };
}

export async function listAllAttemptsForAdmin(): Promise<
  Array<
    TryoutAttempt & {
      user_name: string;
      user_email: string;
      user_school: string;
      user_grade: string;
      package_title: string;
      package_level: string;
    }
  >
> {
  const [packages, users] = await Promise.all([
    listTryoutPackages(),
    listAllUsersSafe(),
  ]);
  const pkgMap = new Map(packages.map((p) => [p.id, p]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  let rows: TryoutAttempt[] = [];
  const pool = await tryInitMysql();
  if (pool) {
    const [dbRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM tryout_attempts ORDER BY created_at DESC"
    );
    rows = dbRows.map((r) => ({
      id: Number(r.id),
      user_id: Number(r.user_id),
      package_id: Number(r.package_id),
      score: Number(r.score),
      correct_statements: Number(r.correct_statements),
      total_statements: Number(r.total_statements),
      perfect_questions: Number(r.perfect_questions),
      answers_json: String(r.answers_json),
      duration_seconds: Number(r.duration_seconds),
      created_at: new Date(r.created_at).toISOString(),
    }));
  } else {
    const store = readLocalStore();
    rows = [...store.attempts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return rows.map((a) => {
    const u = userMap.get(a.user_id);
    const pkg = pkgMap.get(a.package_id);
    return {
      ...a,
      user_name: u?.name || "Peserta",
      user_email: u?.email || "-",
      user_school: u?.school || "-",
      user_grade: u?.grade || "-",
      package_title: pkg?.title || "Simulasi Tryout",
      package_level: pkg?.level || "-",
    };
  });
}

export const ALL_EDUCATION_LEVELS: EducationLevel[] = [
  "SD/MI",
  "SMP/MTs",
  "SMA/MA",
  "SMK/MAK",
];

/**
 * Menentukan jenjang yang dibuka oleh suatu kode redeem / nama paket.
 * Kode khusus jenjang (mis. LINISWARA-SMP2026) hanya membuka jenjang terkait,
 * sedangkan kode program MGMP / Semua Jenjang membuka keempat jenjang.
 */
export function extractTargetLevels(
  code: string,
  planName: string,
  fallbackText = ""
): EducationLevel[] {
  const combined = `${code} ${planName} ${fallbackText}`.toUpperCase();
  if (combined.includes("SEMUA JENJANG") || combined.includes("SEMUA PAKET")) {
    return [...ALL_EDUCATION_LEVELS];
  }

  const matched = new Set<EducationLevel>();
  if (combined.includes("SD/MI") || /(^|[^A-Z])SD([^A-Z]|$)/.test(combined)) {
    matched.add("SD/MI");
  }
  if (
    combined.includes("SMP/MTS") ||
    /(^|[^A-Z])SMP([^A-Z]|$)/.test(combined)
  ) {
    matched.add("SMP/MTs");
  }
  if (
    combined.includes("SMA/MA") ||
    /(^|[^A-Z])SMA([^A-Z]|$)/.test(combined) ||
    combined.includes("TKA2025")
  ) {
    matched.add("SMA/MA");
  }
  if (
    combined.includes("SMK/MAK") ||
    /(^|[^A-Z])SMK([^A-Z]|$)/.test(combined)
  ) {
    matched.add("SMK/MAK");
  }

  if (matched.size > 0) {
    return ALL_EDUCATION_LEVELS.filter((lvl) => matched.has(lvl));
  }

  if (combined.includes("MGMP")) {
    return [...ALL_EDUCATION_LEVELS];
  }

  return [...ALL_EDUCATION_LEVELS];
}

function extractClassNumbers(text: string): Set<number> {
  const nums = new Set<number>();
  const upper = text.toUpperCase();

  // Tangkap rentang: "Kelas 1-3", "Kelas 1–6", "Kelas 10-12"
  const rangeRegex =
    /KELAS\s*(\d{1,2})\s*(?:[–\-]|S\/D|SAMPAI)\s*(\d{1,2})/g;
  let match: RegExpExecArray | null;
  while ((match = rangeRegex.exec(upper)) !== null) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start >= 1 && end <= 12 && start <= end) {
      for (let i = start; i <= end; i++) nums.add(i);
    }
  }

  // Tangkap kelas tunggal: "Kelas 1", "Kelas 9", "Kelas 12" (tanpa diikuti tanda rentang)
  const singleRegex = /KELAS\s*(\d{1,2})(?!\s*(?:[–\-]|S\/D|SAMPAI))/g;
  while ((match = singleRegex.exec(upper)) !== null) {
    const n = Number(match[1]);
    if (n >= 1 && n <= 12) nums.add(n);
  }

  // Dukungan label fase kurikulum bila kelas angka tidak ditulis
  if (nums.size === 0) {
    if (upper.includes("FASE A")) [1, 2].forEach((n) => nums.add(n));
    if (upper.includes("FASE B")) [3, 4].forEach((n) => nums.add(n));
    if (upper.includes("FASE C")) [5, 6].forEach((n) => nums.add(n));
    if (upper.includes("FASE D")) [7, 8, 9].forEach((n) => nums.add(n));
  }

  return nums;
}

function extractMajors(text: string): Set<string> {
  const majors = new Set<string>();
  const upper = text.toUpperCase();
  if (/\bMIPA\b|SAINTEK/.test(upper)) majors.add("MIPA");
  if (/\bIPS\b|SOSHUM/.test(upper)) majors.add("IPS");
  if (/TEKNOLOGI|\bTJKT\b|\bRPL\b|OTOMOTIF/.test(upper)) {
    majors.add("TEKNOLOGI");
  }
  if (/BISNIS|PARIWISATA|AKUNTANSI|PERHOTELAN|KULINER|PEMASARAN/.test(upper)) {
    majors.add("BISNIS");
  }
  return majors;
}

export function parseCustomBundleTargets(text: string): {
  isCustomBundle: boolean;
  materialIds: number[];
  packageIds: number[];
} {
  const match = text.match(/\[BUNDLE:V=([0-9,]*);P=([0-9,]*)\]/i);
  if (!match) {
    return { isCustomBundle: false, materialIds: [], packageIds: [] };
  }
  const parseNums = (raw: string) =>
    raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
  return {
    isCustomBundle: true,
    materialIds: parseNums(match[1] || ""),
    packageIds: parseNums(match[2] || ""),
  };
}

export function stripCustomBundleTag(text: string): string {
  return text.replace(/\s*\[BUNDLE:V=[0-9,]*;P=[0-9,]*\]/gi, "").trim();
}

export function formatCustomBundleDescription(
  baseDesc: string,
  materialIds: number[],
  packageIds: number[]
): string {
  const cleanBase = stripCustomBundleTag(baseDesc) || "Voucher Bundle Kustom";
  const tag = `[BUNDLE:V=${materialIds.join(",")};P=${packageIds.join(",")}]`;
  const maxBase = Math.max(20, 250 - tag.length - 1);
  return `${cleanBase.slice(0, maxBase)} ${tag}`.trim();
}

export function extractScopeLabel(
  code: string,
  planName: string,
  description = ""
): string {
  const bundle = parseCustomBundleTargets(description);
  if (bundle.isCustomBundle) {
    const parts: string[] = [];
    if (bundle.materialIds.length > 0) {
      parts.push(`${bundle.materialIds.length} Video`);
    }
    if (bundle.packageIds.length > 0) {
      parts.push(`${bundle.packageIds.length} Paket Tryout`);
    }
    return parts.length > 0
      ? `Bundle Kustom (${parts.join(" & ")})`
      : "Bundle Kustom";
  }

  const levels = extractTargetLevels(code, planName);
  if (levels.length === 4) {
    return "Semua Jenjang (SD–SMK)";
  }
  const lvlLabel = levels.join(", ");
  const classes = Array.from(extractClassNumbers(planName)).sort(
    (a, b) => a - b
  );
  const majors = Array.from(extractMajors(planName));
  const parts = [lvlLabel];
  if (classes.length === 1) {
    parts.push(`Kelas ${classes[0]}`);
  } else if (classes.length > 1) {
    parts.push(`Kelas ${classes[0]}–${classes[classes.length - 1]}`);
  }
  if (majors.length === 1) {
    parts.push(majors[0]);
  }
  return parts.join(" • ");
}

function doesPlanUnlockContent(
  code: string,
  planName: string,
  itemLevel: string,
  itemScopeText: string,
  fallbackGrade = ""
): boolean {
  const levels = extractTargetLevels(code, planName, fallbackGrade);
  if (itemLevel !== "Semua Jenjang" && !levels.includes(itemLevel as EducationLevel)) {
    return false;
  }

  const upperPlan = planName.toUpperCase();
  const isWholeLevel =
    upperPlan.includes("SEMUA JENJANG") ||
    upperPlan.includes("SELURUH KELAS") ||
    upperPlan.includes("SEMUA KELAS") ||
    upperPlan.includes("SEMUA JURUSAN");

  if (!isWholeLevel) {
    const codeClasses = extractClassNumbers(planName);
    const itemClasses = extractClassNumbers(itemScopeText);
    if (codeClasses.size > 0 && itemClasses.size > 0) {
      let hasClassOverlap = false;
      codeClasses.forEach((c) => {
        if (itemClasses.has(c)) hasClassOverlap = true;
      });
      if (!hasClassOverlap) return false;
    }

    const codeMajors = extractMajors(planName);
    const itemMajors = extractMajors(itemScopeText);
    if (codeMajors.size > 0 && itemMajors.size > 0) {
      let hasMajorOverlap = false;
      codeMajors.forEach((m) => {
        if (itemMajors.has(m)) hasMajorOverlap = true;
      });
      if (!hasMajorOverlap) return false;
    }
  }

  return true;
}

/**
 * Mengembalikan daftar jenjang yang aktif terbuka untuk user saat ini
 * berdasarkan riwayat kode redeem yang belum kedaluwarsa.
 */
export async function getUserUnlockedLevels(
  user: SafeUser
): Promise<EducationLevel[]> {
  if (user.role === "admin") {
    return [...ALL_EDUCATION_LEVELS];
  }

  const unlocked = new Set<EducationLevel>();
  const now = Date.now();
  const redemptions = await listUserRedemptions(user.id);

  for (const r of redemptions) {
    if (!r.expires_at || new Date(r.expires_at).getTime() > now) {
      for (const lvl of extractTargetLevels(r.code, r.plan_name)) {
        unlocked.add(lvl);
      }
    }
  }

  if (unlocked.size === 0 && isSubscriptionActive(user)) {
    for (const lvl of extractTargetLevels(
      "",
      user.subscription_plan || "",
      user.grade
    )) {
      unlocked.add(lvl);
    }
  }

  return ALL_EDUCATION_LEVELS.filter((lvl) => unlocked.has(lvl));
}

export async function getUserActiveRedemptions(user: SafeUser): Promise<{
  redemptions: UserRedemption[];
  unlockedLevels: EducationLevel[];
  scopeLabels: string[];
}> {
  if (user.role === "admin") {
    return {
      redemptions: [],
      unlockedLevels: [...ALL_EDUCATION_LEVELS],
      scopeLabels: ["Semua Jenjang (Administrator Redaksi)"],
    };
  }

  const now = Date.now();
  const allRedemptions = await listUserRedemptions(user.id);
  const activeRedemptions = allRedemptions.filter(
    (r) => !r.expires_at || new Date(r.expires_at).getTime() > now
  );

  const levelSet = new Set<EducationLevel>();
  const labelSet = new Set<string>();

  for (const r of activeRedemptions) {
    const bundle = parseCustomBundleTargets(r.description || "");
    if (!bundle.isCustomBundle) {
      for (const lvl of extractTargetLevels(r.code, r.plan_name)) {
        levelSet.add(lvl);
      }
    }
    labelSet.add(extractScopeLabel(r.code, r.plan_name, r.description || ""));
  }

  if (activeRedemptions.length === 0 && isSubscriptionActive(user)) {
    const planText = user.subscription_plan || user.grade;
    for (const lvl of extractTargetLevels("", planText, user.grade)) {
      levelSet.add(lvl);
    }
    labelSet.add(extractScopeLabel("", planText));
  }

  return {
    redemptions: activeRedemptions,
    unlockedLevels: ALL_EDUCATION_LEVELS.filter((lvl) => levelSet.has(lvl)),
    scopeLabels: Array.from(labelSet),
  };
}

export function checkContentUnlockedWithState(
  user: SafeUser,
  activeRedemptions: UserRedemption[],
  itemLevel: string,
  itemScopeText: string,
  itemType?: "material" | "package",
  itemId?: number
): boolean {
  if (user.role === "admin") return true;

  for (const r of activeRedemptions) {
    const bundle = parseCustomBundleTargets(r.description || "");
    if (bundle.isCustomBundle) {
      if (itemType === "material" && itemId && bundle.materialIds.includes(itemId)) {
        return true;
      }
      if (itemType === "package" && itemId && bundle.packageIds.includes(itemId)) {
        return true;
      }
      continue;
    }

    if (doesPlanUnlockContent(r.code, r.plan_name, itemLevel, itemScopeText)) {
      return true;
    }
  }

  if (activeRedemptions.length === 0 && isSubscriptionActive(user)) {
    return doesPlanUnlockContent(
      "",
      user.subscription_plan || "",
      itemLevel,
      itemScopeText,
      user.grade
    );
  }

  return false;
}

export async function canUserAccessLevelContent(
  user: SafeUser,
  itemLevel: string,
  itemScopeText: string,
  itemType?: "material" | "package",
  itemId?: number
): Promise<boolean> {
  const { redemptions } = await getUserActiveRedemptions(user);
  return checkContentUnlockedWithState(
    user,
    redemptions,
    itemLevel,
    itemScopeText,
    itemType,
    itemId
  );
}

export async function listAllUsersSafe(): Promise<SafeUser[]> {
  const pool = await tryInitMysql();
  if (pool) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users ORDER BY id DESC"
    );
    return rows.map((r) => toSafeUser(mapMysqlUser(r)));
  }
  const store = readLocalStore();
  return [...store.users]
    .sort((a, b) => b.id - a.id)
    .map((u) => toSafeUser(u));
}

export async function getAdminStats(): Promise<{
  totalUsers: number;
  activeSubscribers: number;
  totalMaterials: number;
  totalPackages: number;
  totalQuestions: number;
  totalAttempts: number;
  storageMode: "mysql" | "local";
}> {
  const mode = await getStorageMode();
  const pool = await tryInitMysql();
  if (pool) {
    const [uRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) AS active_cnt FROM users"
    );
    const [mRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM video_materials"
    );
    const [pRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM tryout_packages"
    );
    const [qRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM tryout_questions"
    );
    const [aRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM tryout_attempts"
    );
    return {
      totalUsers: Number(uRows[0]?.total || 0),
      activeSubscribers: Number(uRows[0]?.active_cnt || 0),
      totalMaterials: Number(mRows[0]?.cnt || 0),
      totalPackages: Number(pRows[0]?.cnt || 0),
      totalQuestions: Number(qRows[0]?.cnt || 0),
      totalAttempts: Number(aRows[0]?.cnt || 0),
      storageMode: mode,
    };
  }

  const store = readLocalStore();
  return {
    totalUsers: store.users.length,
    activeSubscribers: store.users.filter(
      (u) => u.subscription_status === "active"
    ).length,
    totalMaterials: store.materials.length,
    totalPackages: store.packages.length,
    totalQuestions: store.questions.length,
    totalAttempts: store.attempts.length,
    storageMode: mode,
  };
}
