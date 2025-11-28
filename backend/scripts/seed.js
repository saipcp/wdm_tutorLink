import pool from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create admin user
    const adminId = uuidv4();
    const adminPassword = await hashPassword("password");
    await pool.execute(
      `INSERT INTO users (id, firstName, lastName, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [adminId, "Admin", "User", "admin@tutorlink.com", adminPassword, "admin"]
    );
    console.log("✅ Created admin user");

    // Create sample subjects
    const subjects = [
      { id: uuidv4(), name: "Mathematics" },
      { id: uuidv4(), name: "Physics" },
      { id: uuidv4(), name: "Chemistry" },
      { id: uuidv4(), name: "Biology" },
      { id: uuidv4(), name: "Computer Science" },
      { id: uuidv4(), name: "English" },
      { id: uuidv4(), name: "History" },
    ];

    for (const subject of subjects) {
      await pool.execute(
        "INSERT INTO subjects (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=name",
        [subject.id, subject.name]
      );

      // Add topics for each subject
      const topics = {
        Mathematics: [
          "Basic Algebra",
          "Geometry",
          "Calculus",
          "Statistics",
          "Trigonometry",
        ],
        Physics: [
          "Mechanics",
          "Thermodynamics",
          "Electricity",
          "Quantum Physics",
          "Optics",
        ],
        Chemistry: [
          "Atomic Structure",
          "Chemical Bonds",
          "Organic Chemistry",
          "Biochemistry",
          "Physical Chemistry",
        ],
        Biology: [
          "Cell Biology",
          "Genetics",
          "Ecology",
          "Human Anatomy",
          "Microbiology",
        ],
        "Computer Science": [
          "Programming Basics",
          "Data Structures",
          "Algorithms",
          "Web Development",
          "Database Design",
        ],
        English: [
          "Grammar",
          "Literature",
          "Writing",
          "Reading Comprehension",
          "Vocabulary",
        ],
        History: [
          "World History",
          "American History",
          "European History",
          "Ancient History",
          "Modern History",
        ],
      };

      const subjectTopics = topics[subject.name] || [];
      for (const topicName of subjectTopics) {
        await pool.execute(
          "INSERT INTO topics (id, subjectId, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=name",
          [uuidv4(), subject.id, topicName]
        );
      }
    }
    console.log("✅ Created subjects and topics");

    // Create sample tutor
    const tutorUserId = uuidv4();
    const tutorPassword = await hashPassword("password");
    await pool.execute(
      `INSERT INTO users (id, firstName, lastName, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [
        tutorUserId,
        "John",
        "Tutor",
        "tutor@tutorlink.com",
        tutorPassword,
        "tutor",
      ]
    );

    const tutorProfileId = uuidv4();
    await pool.execute(
      `INSERT INTO tutor_profiles (id, userId, bio, rating, hourlyRate, experience)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [
        tutorProfileId,
        tutorUserId,
        "Experienced tutor with 5+ years of teaching Mathematics and Physics.",
        4.5,
        30.0,
        5,
      ]
    );

    // Add tutor subjects
    const mathSubject = subjects.find((s) => s.name === "Mathematics");
    const physicsSubject = subjects.find((s) => s.name === "Physics");
    if (mathSubject) {
      await pool.execute(
        "INSERT INTO tutor_subjects (tutorId, subjectId) VALUES (?, ?) ON DUPLICATE KEY UPDATE tutorId=tutorId",
        [tutorProfileId, mathSubject.id]
      );
    }
    if (physicsSubject) {
      await pool.execute(
        "INSERT INTO tutor_subjects (tutorId, subjectId) VALUES (?, ?) ON DUPLICATE KEY UPDATE tutorId=tutorId",
        [tutorProfileId, physicsSubject.id]
      );
    }

    // Add tutor languages
    await pool.execute(
      "INSERT INTO tutor_languages (tutorId, language) VALUES (?, ?) ON DUPLICATE KEY UPDATE tutorId=tutorId",
      [tutorProfileId, "English"]
    );

    console.log("✅ Created sample tutor");

    // Create sample student
    const studentUserId = uuidv4();
    const studentPassword = await hashPassword("password");
    await pool.execute(
      `INSERT INTO users (id, firstName, lastName, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [
        studentUserId,
        "Jane",
        "Student",
        "student@tutorlink.com",
        studentPassword,
        "student",
      ]
    );

    const studentProfileId = uuidv4();
    await pool.execute(
      `INSERT INTO student_profiles (id, userId, grade, school, preferences)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [
        studentProfileId,
        studentUserId,
        "12th Grade",
        "High School",
        JSON.stringify({
          subjects: ["Mathematics", "Physics"],
          learningStyle: ["visual", "hands-on"],
          goals: ["Improve grades", "Prepare for exams"],
        }),
      ]
    );
    console.log("✅ Created sample student");

    // Insert default settings for AI and Security so admin pages have sensible defaults
    const defaultAI = {
      tutorbotEnabled: true,
      planGeneratorEnabled: true,
      matchingEnabled: true,
      model: "gpt-4",
    };

    const defaultSecurity = {
      requireEmailVerification: true,
      sessionTimeoutMinutes: 60,
      passwordComplexity: "moderate",
      enable2FA: false,
    };

    await pool.execute(
      "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
      ["ai", JSON.stringify(defaultAI)]
    );

    await pool.execute(
      "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
      ["security", JSON.stringify(defaultSecurity)]
    );

    console.log("✅ Inserted default settings for AI and Security");

    console.log("✅ Database seeding completed successfully");
    console.log("\n📝 Demo accounts:");
    console.log("Admin: admin@tutorlink.com / password");
    console.log("Tutor: tutor@tutorlink.com / password");
    console.log("Student: student@tutorlink.com / password");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
