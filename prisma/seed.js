const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed for Strict Attend Flow...");

  // Clear existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.period.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studentSettings.deleteMany();
  await prisma.gamificationBadge.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  console.log("🧹 Cleaned database tables.");

  // Password hashes
  const adminPasswordHash = await bcrypt.hash("adminPassword123!", 12);
  const teacherPasswordHash = await bcrypt.hash("teacherPassword123!", 12);
  const studentPasswordHash = await bcrypt.hash("studentPassword123!", 12);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Arvind Mehta (Director)",
      email: "admin@portal.edu",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`👤 Admin created: ${adminUser.email}`);

  // 2. Create 3 Classes
  const classA = await prisma.class.create({
    data: {
      name: "BCA-3A",
      section: "A",
      department: "Computer Applications",
      semester: 3,
    },
  });

  const classB = await prisma.class.create({
    data: {
      name: "BCA-3B",
      section: "B",
      department: "Computer Applications",
      semester: 3,
    },
  });

  const classMCA = await prisma.class.create({
    data: {
      name: "MCA-1A",
      section: "A",
      department: "Computer Science",
      semester: 1,
    },
  });
  console.log("🏫 3 Classes created (BCA-3A, BCA-3B, MCA-1A).");

  // 3. Create 8 Periods
  const periodsData = [
    { periodNo: 1, startTime: "09:00", endTime: "09:45" },
    { periodNo: 2, startTime: "09:45", endTime: "10:30" },
    { periodNo: 3, startTime: "10:45", endTime: "11:30" },
    { periodNo: 4, startTime: "11:30", endTime: "12:15" },
    { periodNo: 5, startTime: "13:00", endTime: "13:45" },
    { periodNo: 6, startTime: "13:45", endTime: "14:30" },
    { periodNo: 7, startTime: "14:45", endTime: "15:30" },
    { periodNo: 8, startTime: "15:30", endTime: "16:15" },
  ];

  for (const p of periodsData) {
    await prisma.period.create({ data: p });
  }
  console.log("⏰ 8 Standard periods created (P1 to P8).");

  // 4. Create 5 Teachers
  const teacherConfigs = [
    {
      name: "Prof. Rajesh Sharma",
      email: "rajesh.sharma@portal.edu",
      employeeId: "EMP-101",
      dept: "Computer Science",
    },
    {
      name: "Dr. Ananya Roy",
      email: "ananya.roy@portal.edu",
      employeeId: "EMP-102",
      dept: "Information Technology",
    },
    {
      name: "Prof. Vikram Malhotra",
      email: "vikram.malhotra@portal.edu",
      employeeId: "EMP-103",
      dept: "Computer Applications",
    },
    {
      name: "Dr. Sunita Deshmukh",
      email: "sunita.deshmukh@portal.edu",
      employeeId: "EMP-104",
      dept: "Mathematics & AI",
    },
    {
      name: "Prof. Amit Verma",
      email: "amit.verma@portal.edu",
      employeeId: "EMP-105",
      dept: "Software Engineering",
    },
  ];

  const teachers = [];
  for (const tc of teacherConfigs) {
    const user = await prisma.user.create({
      data: {
        name: tc.name,
        email: tc.email,
        passwordHash: teacherPasswordHash,
        role: "TEACHER",
        teacher: {
          create: {
            employeeId: tc.employeeId,
            department: tc.dept,
          },
        },
      },
      include: { teacher: true },
    });
    teachers.push(user.teacher);
  }
  console.log(`👨‍🏫 5 Teachers created with credentials.`);

  // 5. Create 10 Subjects
  const subjectsData = [
    {
      name: "Database Management Systems",
      code: "BCA-301",
      classId: classA.id,
      teacherId: teachers[0].id,
      totalPlannedLectures: 45,
    },
    {
      name: "Data Structures & Algorithms",
      code: "BCA-302",
      classId: classA.id,
      teacherId: teachers[1].id,
      totalPlannedLectures: 45,
    },
    {
      name: "Operating Systems",
      code: "BCA-303",
      classId: classA.id,
      teacherId: teachers[2].id,
      totalPlannedLectures: 40,
    },
    {
      name: "Web Technologies",
      code: "BCA-304",
      classId: classA.id,
      teacherId: teachers[4].id,
      totalPlannedLectures: 40,
    },
    {
      name: "Computer Networks",
      code: "BCA-305",
      classId: classB.id,
      teacherId: teachers[0].id,
      totalPlannedLectures: 45,
    },
    {
      name: "Software Engineering",
      code: "BCA-306",
      classId: classB.id,
      teacherId: teachers[1].id,
      totalPlannedLectures: 42,
    },
    {
      name: "Java Programming",
      code: "BCA-307",
      classId: classB.id,
      teacherId: teachers[4].id,
      totalPlannedLectures: 45,
    },
    {
      name: "Advanced DBMS & Cloud",
      code: "MCA-101",
      classId: classMCA.id,
      teacherId: teachers[0].id,
      totalPlannedLectures: 48,
    },
    {
      name: "Machine Learning Foundations",
      code: "MCA-102",
      classId: classMCA.id,
      teacherId: teachers[3].id,
      totalPlannedLectures: 48,
    },
    {
      name: "Distributed Systems",
      code: "MCA-103",
      classId: classMCA.id,
      teacherId: teachers[2].id,
      totalPlannedLectures: 45,
    },
  ];

  const subjects = [];
  for (const s of subjectsData) {
    const created = await prisma.subject.create({ data: s });
    subjects.push(created);
  }
  console.log("📚 10 Subjects created and assigned to teachers & classes.");

  // 6. Create 50 Students (25 in BCA-3A, 15 in BCA-3B, 10 in MCA-1A)
  const studentNames = [
    // BCA-3A (25)
    "Rahul Verma", "Priya Sharma", "Aman Gupta", "Sneha Patel", "Rohan Mehta",
    "Anjali Singh", "Karan Johar", "Pooja Reddy", "Deepak Chopra", "Neha Nair",
    "Vikas Rao", "Divya Joshi", "Siddharth Das", "Meera Sen", "Arjun Kapoor",
    "Kavita Iyer", "Aditya Roy", "Simran Kaur", "Nikhil Bhat", "Tanvi Dave",
    "Gaurav Pandey", "Shruti Shinde", "Harsh Vardhan", "Ritu Agrawal", "Manish Saxena",
    // BCA-3B (15)
    "Varun Dhawan", "Alia Roy", "Ranbir Kapoor", "Kriti Sanon", "Kartik Aaryan",
    "Kiara Advani", "Ayushmann Bose", "Bhumi Pednekar", "Rajkummar Rao", "Radhika Apte",
    "Vicky Kaushal", "Katrina Seth", "Shahid Kapoor", "Mira Rajput", "Ishaan Khatter",
    // MCA-1A (10)
    "Sameer Kulkarni", "Pallavi Rane", "Abhinav Tiwari", "Bhavna Deshmukh", "Chirag Shah",
    "Farhan Akhtar", "Gayatri Devi", "Hemant Soren", "Isha Ambani", "Jayesh Parmar"
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i];
    let classId = classA.id;
    let section = "A";
    let rollPrefix = "BCA3A";
    let rollNum = (i + 1).toString().padStart(3, "0");

    if (i >= 25 && i < 40) {
      classId = classB.id;
      section = "B";
      rollPrefix = "BCA3B";
      rollNum = (i - 24).toString().padStart(3, "0");
    } else if (i >= 40) {
      classId = classMCA.id;
      section = "A";
      rollPrefix = "MCA1A";
      rollNum = (i - 39).toString().padStart(3, "0");
    }

    const email = i === 0 ? "student.rahul@portal.edu" : `student.${name.toLowerCase().replace(/\s+/g, ".")}@portal.edu`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        student: {
          create: {
            rollNo: `${rollPrefix}-${rollNum}`,
            classId,
            section,
            parentEmail: i === 0 ? "parent.rahul@example.com" : null,
            goalPercent: 85.0,
          },
        },
      },
      include: { student: true },
    });
    students.push(user.student);
  }
  console.log(`🎓 50 Students created across classes. Demo student: student.rahul@portal.edu`);

  // Rahul's Gamification, Settings, and Notifications
  const rahul = students[0];
  await prisma.streak.create({
    data: {
      studentId: rahul.id,
      currentStreak: 12,
      longestStreak: 14,
      lastMarkedAt: new Date(),
    },
  });

  await prisma.gamificationBadge.createMany({
    data: [
      { studentId: rahul.id, badgeType: "EARLY_BIRD" },
      { studentId: rahul.id, badgeType: "NEVER_LATE" },
      { studentId: rahul.id, badgeType: "STREAK_10" },
      { studentId: rahul.id, badgeType: "PERFECT_MONTH" },
    ],
  });

  await prisma.studentSettings.create({
    data: {
      studentId: rahul.id,
      language: "en",
      notificationsEnabled: true,
      parentEmailEnabled: true,
      goalPercent: 85.0,
      studyPlannerEnabled: true,
    },
  });

  const rahulUser = await prisma.user.findUnique({ where: { email: "student.rahul@portal.edu" } });
  if (rahulUser) {
    await prisma.notification.createMany({
      data: [
        {
          userId: rahulUser.id,
          type: "SCHEDULE",
          title: "Tomorrow's Schedule: DBMS at 10:45",
          message: "Database Management Systems with Prof. Rajesh Sharma in Room 204.",
          actionUrl: "/student/calendar",
        },
        {
          userId: rahulUser.id,
          type: "LEAVE_STATUS",
          title: "Leave Request Approved",
          message: "Your leave request for university symposium participation was approved by Prof. Rajesh Sharma.",
          actionUrl: "/student/leave",
          read: true,
        },
      ],
    });

    // Sample Approved Leave
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    await prisma.leaveRequest.create({
      data: {
        studentId: rahul.id,
        dateFrom: twoWeeksAgo,
        dateTo: twoWeeksAgo,
        subjectIds: [subjects[0].id],
        reason: "Participating in Inter-College Hackathon representing institute",
        status: "APPROVED",
        reviewedBy: "Prof. Rajesh Sharma",
        reviewedAt: twoWeeksAgo,
        reviewNote: "Approved. Academic duty exemption granted.",
      },
    });

    // Sample Pending Leave
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    await prisma.leaveRequest.create({
      data: {
        studentId: rahul.id,
        dateFrom: nextWeek,
        dateTo: nextWeek,
        subjectIds: [subjects[1].id],
        reason: "Family medical appointment and checkup",
        status: "PENDING",
      },
    });
  }

  // 7. Create Timetable Slots for Teacher 0 (Prof. Rajesh Sharma - Mon to Sat)
  const rajeshSlots = [
    { dayOfWeek: 1, periodNo: 1, classId: classA.id, subjectId: subjects[0].id, room: "Room 204" },
    { dayOfWeek: 1, periodNo: 3, classId: classMCA.id, subjectId: subjects[7].id, room: "Room 301" },
    { dayOfWeek: 2, periodNo: 2, classId: classB.id, subjectId: subjects[4].id, room: "Room 205" },
    { dayOfWeek: 2, periodNo: 4, classId: classA.id, subjectId: subjects[0].id, room: "Room 204" },
    { dayOfWeek: 3, periodNo: 1, classId: classA.id, subjectId: subjects[0].id, room: "Room 204" },
    { dayOfWeek: 3, periodNo: 5, classId: classMCA.id, subjectId: subjects[7].id, room: "Lab 1" },
    { dayOfWeek: 4, periodNo: 3, classId: classA.id, subjectId: subjects[0].id, room: "Room 204" },
    { dayOfWeek: 4, periodNo: 6, classId: classB.id, subjectId: subjects[4].id, room: "Room 205" },
    { dayOfWeek: 5, periodNo: 2, classId: classA.id, subjectId: subjects[0].id, room: "Room 204" },
    { dayOfWeek: 5, periodNo: 4, classId: classMCA.id, subjectId: subjects[7].id, room: "Room 301" },
    { dayOfWeek: 6, periodNo: 1, classId: classB.id, subjectId: subjects[4].id, room: "Lab 2" },
  ];

  for (const slot of rajeshSlots) {
    await prisma.timetableSlot.create({
      data: {
        teacherId: teachers[0].id,
        classId: slot.classId,
        subjectId: slot.subjectId,
        dayOfWeek: slot.dayOfWeek,
        periodNo: slot.periodNo,
        room: slot.room,
        isActive: true,
      },
    });
  }

  // Create Timetable Slots for Teacher 1 (Dr. Ananya Roy)
  const ananyaSlots = [
    { dayOfWeek: 1, periodNo: 2, classId: classA.id, subjectId: subjects[1].id, room: "Room 204" },
    { dayOfWeek: 2, periodNo: 1, classId: classA.id, subjectId: subjects[1].id, room: "Room 204" },
    { dayOfWeek: 3, periodNo: 3, classId: classA.id, subjectId: subjects[1].id, room: "Room 204" },
    { dayOfWeek: 4, periodNo: 2, classId: classB.id, subjectId: subjects[5].id, room: "Room 205" },
    { dayOfWeek: 5, periodNo: 1, classId: classA.id, subjectId: subjects[1].id, room: "Room 204" },
  ];

  for (const slot of ananyaSlots) {
    await prisma.timetableSlot.create({
      data: {
        teacherId: teachers[1].id,
        classId: slot.classId,
        subjectId: slot.subjectId,
        dayOfWeek: slot.dayOfWeek,
        periodNo: slot.periodNo,
        room: slot.room,
        isActive: true,
      },
    });
  }
  console.log("📅 Timetable slots created for teachers.");

  // 8. Generate 1 Month Attendance History
  console.log("⏳ Generating 1 month of realistic attendance sessions...");
  const bcaAStudents = students.slice(0, 25);
  const now = new Date();

  let sessionsCreatedCount = 0;
  for (let daysAgo = 30; daysAgo >= 1; daysAgo--) {
    const sessionDate = new Date();
    sessionDate.setDate(now.getDate() - daysAgo);

    if (sessionDate.getDay() === 0) continue; // Skip Sundays

    const dayOfWeek = sessionDate.getDay();
    const matchingSlots = rajeshSlots.filter((s) => s.dayOfWeek === dayOfWeek && s.classId === classA.id);

    for (const slot of matchingSlots) {
      const p = periodsData.find((pd) => pd.periodNo === slot.periodNo) || periodsData[0];
      const dateOnly = new Date(sessionDate.toISOString().split("T")[0]);

      const session = await prisma.attendanceSession.create({
        data: {
          subjectId: slot.subjectId,
          teacherId: teachers[0].id,
          classId: classA.id,
          date: dateOnly,
          periodNo: slot.periodNo,
          startTime: p.startTime,
          endTime: p.endTime,
          status: "SUBMITTED",
          submittedAt: new Date(sessionDate.getTime() + 45 * 60 * 1000),
          createdAt: sessionDate,
        },
      });

      for (let sIdx = 0; sIdx < bcaAStudents.length; sIdx++) {
        const stud = bcaAStudents[sIdx];
        let status = "PRESENT";

        if (sIdx >= 20 && sIdx <= 22) {
          const rand = Math.random();
          status = rand > 0.45 ? "ABSENT" : rand > 0.35 ? "LATE" : "PRESENT";
        } else {
          const rand = Math.random();
          status = rand > 0.88 ? "ABSENT" : rand > 0.82 ? "LATE" : "PRESENT";
        }

        await prisma.attendanceRecord.create({
          data: {
            sessionId: session.id,
            studentId: stud.id,
            status,
            markedBy: "TEACHER",
            markedAt: sessionDate,
          },
        });
      }

      sessionsCreatedCount++;
    }
  }
  console.log(`✅ ${sessionsCreatedCount} historical attendance sessions created with records.`);

  // 9. Create 1 currently OPEN session for BCA-3A (Period 3 today)
  const todayStr = now.toISOString().split("T")[0];
  const todayDate = new Date(todayStr);

  const openSession = await prisma.attendanceSession.create({
    data: {
      subjectId: subjects[0].id, // DBMS
      teacherId: teachers[0].id,
      classId: classA.id,
      date: todayDate,
      periodNo: 3,
      startTime: "10:45",
      endTime: "11:30",
      status: "OPEN",
      qrCode: "4921",
      qrToken: "initial-qr-token-demo",
      geoLat: 28.6139,
      geoLng: 77.2090,
    },
  });

  for (const stud of bcaAStudents) {
    await prisma.attendanceRecord.create({
      data: {
        sessionId: openSession.id,
        studentId: stud.id,
        status: "ABSENT",
        markedBy: "TEACHER",
      },
    });
  }
  console.log(`🔴 Live OPEN session created for BCA-3A Period 3 today (Session ID: ${openSession.id}, Code: 4921)`);

  // 10. Audit log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      role: "ADMIN",
      action: "SYSTEM_INITIALIZED",
      entityType: "System",
      entityId: "SYSTEM_ROOT",
      afterJson: JSON.stringify({ version: "1.0.0", seededAt: new Date().toISOString() }),
      ip: "127.0.0.1",
    },
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
