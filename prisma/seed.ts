import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERS = [
  { name: "Priya Sharma", email: "priya@example.com", bio: "Third-year CS student who loves web dev and teaching others. Currently exploring machine learning.", university: "IIT Delhi", major: "Computer Science" },
  { name: "Rahul Mehta", email: "rahul@example.com", bio: "Music producer and guitar enthusiast. Also studying business analytics on the side.", university: "NIT Surat", major: "Business Analytics" },
  { name: "Ananya Patel", email: "ananya@example.com", bio: "Design-obsessed UI/UX student. I sketch interfaces for fun and teach Figma workshops.", university: "NIFT Mumbai", major: "Interaction Design" },
  { name: "Arjun Reddy", email: "arjun@example.com", bio: "Full-stack developer turned data science nerd. Love helping people debug their code.", university: "BITS Pilani", major: "Data Science" },
  { name: "Sneha Gupta", email: "sneha@example.com", bio: "Fluent in 4 languages. Passionate about linguistics, cultural exchange, and photography.", university: "JNU Delhi", major: "Linguistics" },
  { name: "Karthik Nair", email: "karthik@example.com", bio: "Math tutor by day, chess player by night. Currently working on competitive programming.", university: "IIT Madras", major: "Mathematics" },
  { name: "Meera Iyer", email: "meera@example.com", bio: "Environmental science student with a knack for public speaking and debate.", university: "IISC Bangalore", major: "Environmental Science" },
  { name: "Vikram Singh", email: "vikram@example.com", bio: "Aspiring game developer. I build Unity games and teach C# to beginners.", university: "Manipal University", major: "Game Design" },
  { name: "Divya Krishnan", email: "divya@example.com", bio: "Pre-med student who also writes poetry. Looking to learn digital art and animation.", university: "AIIMS Delhi", major: "Medicine" },
  { name: "Aditya Joshi", email: "aditya@example.com", bio: "Robotics engineer and Arduino tinkerer. Happy to teach electronics and embedded systems.", university: "VIT Vellore", major: "Electronics Engineering" },
];

const SKILLS = [
  { name: "Python", category: "Programming" },
  { name: "React", category: "Programming" },
  { name: "JavaScript", category: "Programming" },
  { name: "TypeScript", category: "Programming" },
  { name: "Machine Learning", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "C#", category: "Programming" },
  { name: "SQL", category: "Programming" },
  { name: "Figma", category: "Design" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Adobe Photoshop", category: "Design" },
  { name: "Digital Art", category: "Design" },
  { name: "Guitar", category: "Music" },
  { name: "Piano", category: "Music" },
  { name: "Music Production", category: "Music" },
  { name: "Spanish", category: "Languages" },
  { name: "French", category: "Languages" },
  { name: "Hindi", category: "Languages" },
  { name: "Japanese", category: "Languages" },
  { name: "Calculus", category: "Math" },
  { name: "Linear Algebra", category: "Math" },
  { name: "Statistics", category: "Math" },
  { name: "Public Speaking", category: "Business" },
  { name: "Business Analytics", category: "Business" },
  { name: "Photography", category: "Design" },
  { name: "Robotics", category: "Science" },
  { name: "Arduino", category: "Science" },
  { name: "Unity Game Dev", category: "Programming" },
  { name: "Competitive Programming", category: "Programming" },
  { name: "Creative Writing", category: "Languages" },
];

// Who teaches what, who learns what
const USER_SKILLS: { userIndex: number; skillName: string; type: "TEACH" | "LEARN"; level: string }[] = [
  // Priya
  { userIndex: 0, skillName: "Python", type: "TEACH", level: "Expert" },
  { userIndex: 0, skillName: "React", type: "TEACH", level: "Intermediate" },
  { userIndex: 0, skillName: "Machine Learning", type: "TEACH", level: "Intermediate" },
  { userIndex: 0, skillName: "Guitar", type: "LEARN", level: "Beginner" },
  { userIndex: 0, skillName: "UI/UX Design", type: "LEARN", level: "Beginner" },
  // Rahul
  { userIndex: 1, skillName: "Guitar", type: "TEACH", level: "Expert" },
  { userIndex: 1, skillName: "Music Production", type: "TEACH", level: "Intermediate" },
  { userIndex: 1, skillName: "Business Analytics", type: "TEACH", level: "Intermediate" },
  { userIndex: 1, skillName: "Python", type: "LEARN", level: "Beginner" },
  { userIndex: 1, skillName: "JavaScript", type: "LEARN", level: "Beginner" },
  // Ananya
  { userIndex: 2, skillName: "Figma", type: "TEACH", level: "Expert" },
  { userIndex: 2, skillName: "UI/UX Design", type: "TEACH", level: "Expert" },
  { userIndex: 2, skillName: "Adobe Photoshop", type: "TEACH", level: "Intermediate" },
  { userIndex: 2, skillName: "React", type: "LEARN", level: "Beginner" },
  { userIndex: 2, skillName: "TypeScript", type: "LEARN", level: "Beginner" },
  // Arjun
  { userIndex: 3, skillName: "JavaScript", type: "TEACH", level: "Expert" },
  { userIndex: 3, skillName: "TypeScript", type: "TEACH", level: "Expert" },
  { userIndex: 3, skillName: "SQL", type: "TEACH", level: "Intermediate" },
  { userIndex: 3, skillName: "Python", type: "TEACH", level: "Expert" },
  { userIndex: 3, skillName: "Statistics", type: "LEARN", level: "Beginner" },
  { userIndex: 3, skillName: "Machine Learning", type: "LEARN", level: "Intermediate" },
  // Sneha
  { userIndex: 4, skillName: "French", type: "TEACH", level: "Expert" },
  { userIndex: 4, skillName: "Spanish", type: "TEACH", level: "Intermediate" },
  { userIndex: 4, skillName: "Hindi", type: "TEACH", level: "Expert" },
  { userIndex: 4, skillName: "Photography", type: "TEACH", level: "Intermediate" },
  { userIndex: 4, skillName: "Digital Art", type: "LEARN", level: "Beginner" },
  { userIndex: 4, skillName: "Piano", type: "LEARN", level: "Beginner" },
  // Karthik
  { userIndex: 5, skillName: "Calculus", type: "TEACH", level: "Expert" },
  { userIndex: 5, skillName: "Linear Algebra", type: "TEACH", level: "Expert" },
  { userIndex: 5, skillName: "Statistics", type: "TEACH", level: "Expert" },
  { userIndex: 5, skillName: "Competitive Programming", type: "TEACH", level: "Intermediate" },
  { userIndex: 5, skillName: "Guitar", type: "LEARN", level: "Beginner" },
  { userIndex: 5, skillName: "Japanese", type: "LEARN", level: "Beginner" },
  // Meera
  { userIndex: 6, skillName: "Public Speaking", type: "TEACH", level: "Expert" },
  { userIndex: 6, skillName: "Creative Writing", type: "TEACH", level: "Intermediate" },
  { userIndex: 6, skillName: "Python", type: "LEARN", level: "Beginner" },
  { userIndex: 6, skillName: "Photography", type: "LEARN", level: "Beginner" },
  // Vikram
  { userIndex: 7, skillName: "Unity Game Dev", type: "TEACH", level: "Expert" },
  { userIndex: 7, skillName: "C#", type: "TEACH", level: "Expert" },
  { userIndex: 7, skillName: "C++", type: "TEACH", level: "Intermediate" },
  { userIndex: 7, skillName: "UI/UX Design", type: "LEARN", level: "Beginner" },
  { userIndex: 7, skillName: "Music Production", type: "LEARN", level: "Beginner" },
  // Divya
  { userIndex: 8, skillName: "Creative Writing", type: "TEACH", level: "Expert" },
  { userIndex: 8, skillName: "Public Speaking", type: "TEACH", level: "Intermediate" },
  { userIndex: 8, skillName: "Digital Art", type: "LEARN", level: "Beginner" },
  { userIndex: 8, skillName: "Figma", type: "LEARN", level: "Beginner" },
  // Aditya
  { userIndex: 9, skillName: "Robotics", type: "TEACH", level: "Expert" },
  { userIndex: 9, skillName: "Arduino", type: "TEACH", level: "Expert" },
  { userIndex: 9, skillName: "C++", type: "TEACH", level: "Expert" },
  { userIndex: 9, skillName: "Python", type: "LEARN", level: "Intermediate" },
  { userIndex: 9, skillName: "Machine Learning", type: "LEARN", level: "Beginner" },
];

async function main() {
  console.log("Seeding database...\n");

  const password = await bcrypt.hash("password123", 10);

  // 1. Create skills
  console.log("Creating skills...");
  const skillMap = new Map<string, string>();
  for (const s of SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, category: s.category },
    });
    skillMap.set(s.name, skill.id);
  }
  console.log(`  Created ${skillMap.size} skills`);

  // 2. Create users
  console.log("Creating users...");
  const userIds: string[] = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: password },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: password,
        bio: u.bio,
        university: u.university,
        major: u.major,
        credits: Math.floor(Math.random() * 20) + 5,
      },
    });
    userIds.push(user.id);
  }
  console.log(`  Created ${userIds.length} users (password: password123)`);

  // 3. Create user skills
  console.log("Creating user skills...");
  let skillCount = 0;
  for (const us of USER_SKILLS) {
    const userId = userIds[us.userIndex];
    const skillId = skillMap.get(us.skillName);
    if (!userId || !skillId) continue;
    try {
      await prisma.userSkill.create({
        data: { userId, skillId, type: us.type, level: us.level },
      });
      skillCount++;
    } catch {
      // Already exists
    }
  }
  console.log(`  Created ${skillCount} user-skill links`);

  // 4. Create sessions between users
  console.log("Creating sessions...");
  const sessionPairs = [
    { teacher: 0, learner: 1, skill: "Python", status: "COMPLETED" },
    { teacher: 1, learner: 0, skill: "Guitar", status: "COMPLETED" },
    { teacher: 2, learner: 3, skill: "UI/UX Design", status: "COMPLETED" },
    { teacher: 3, learner: 2, skill: "TypeScript", status: "SCHEDULED" },
    { teacher: 5, learner: 3, skill: "Statistics", status: "COMPLETED" },
    { teacher: 4, learner: 6, skill: "French", status: "SCHEDULED" },
    { teacher: 7, learner: 8, skill: "Unity Game Dev", status: "PENDING" },
    { teacher: 9, learner: 7, skill: "Arduino", status: "COMPLETED" },
    { teacher: 0, learner: 6, skill: "Python", status: "SCHEDULED" },
    { teacher: 5, learner: 9, skill: "Calculus", status: "COMPLETED" },
    { teacher: 6, learner: 8, skill: "Public Speaking", status: "COMPLETED" },
    { teacher: 4, learner: 1, skill: "Spanish", status: "PENDING" },
  ];
  for (const sp of sessionPairs) {
    const skillId = skillMap.get(sp.skill);
    if (!skillId) continue;
    await prisma.session.create({
      data: {
        teacherId: userIds[sp.teacher],
        learnerId: userIds[sp.learner],
        skillId,
        status: sp.status,
        scheduledAt: sp.status !== "PENDING" ? new Date(Date.now() + Math.random() * 7 * 86400000) : null,
      },
    });
  }
  console.log(`  Created ${sessionPairs.length} sessions`);

  // 5. Create certificates
  console.log("Creating certificates...");
  const certs = [
    { userIdx: 0, skill: "Python", title: "Advanced Python Development", issuer: "Coursera", verified: true },
    { userIdx: 0, skill: "React", title: "React Developer Certification", issuer: "Meta", verified: true },
    { userIdx: 2, skill: "Figma", title: "Figma UI Design Pro", issuer: "Figma Academy", verified: true },
    { userIdx: 3, skill: "JavaScript", title: "JavaScript Algorithms & DS", issuer: "freeCodeCamp", verified: true },
    { userIdx: 3, skill: "TypeScript", title: "TypeScript Expert", issuer: "Microsoft", verified: false },
    { userIdx: 5, skill: "Calculus", title: "MIT Calculus Certification", issuer: "MIT OpenCourseWare", verified: true },
    { userIdx: 7, skill: "Unity Game Dev", title: "Unity Certified Developer", issuer: "Unity Technologies", verified: true },
    { userIdx: 9, skill: "Robotics", title: "Robotics Fundamentals", issuer: "edX / MIT", verified: true },
    { userIdx: 4, skill: "French", title: "DELF B2 French", issuer: "Alliance Française", verified: true },
    { userIdx: 6, skill: "Public Speaking", title: "Toastmasters CC", issuer: "Toastmasters International", verified: false },
  ];
  for (const c of certs) {
    const skillId = skillMap.get(c.skill);
    if (!skillId) continue;
    await prisma.certificate.create({
      data: {
        userId: userIds[c.userIdx],
        skillId,
        title: c.title,
        issuer: c.issuer,
        verified: c.verified,
      },
    });
  }
  console.log(`  Created ${certs.length} certificates`);

  // 6. Create messages between users
  console.log("Creating messages...");
  const convos = [
    {
      between: [0, 1],
      messages: [
        { from: 0, text: "Hey Rahul! I saw you want to learn Python. I can help!" },
        { from: 1, text: "That would be great! I've been wanting to learn for a while." },
        { from: 0, text: "How about we swap? You teach me guitar and I teach you Python?" },
        { from: 1, text: "Perfect! When are you free this week?" },
        { from: 0, text: "I'm free on Tuesday and Thursday evenings. Works for you?" },
        { from: 1, text: "Thursday evening works! Let's do it at 6pm." },
      ],
    },
    {
      between: [2, 3],
      messages: [
        { from: 2, text: "Hi Arjun! I'd love to learn TypeScript from you." },
        { from: 3, text: "Happy to help! I see you teach Figma — I've been wanting to learn that." },
        { from: 2, text: "Perfect swap! I can show you all the Figma tricks." },
        { from: 3, text: "Let's schedule a session this weekend?" },
      ],
    },
    {
      between: [4, 6],
      messages: [
        { from: 4, text: "Hi Meera! Would you like to practice French conversation?" },
        { from: 6, text: "Oui! That would be amazing. I've always wanted to learn French." },
        { from: 4, text: "Great! In exchange, could you help me with public speaking tips?" },
        { from: 6, text: "Of course! I do debate coaching too. Let's set up a swap session." },
      ],
    },
    {
      between: [7, 9],
      messages: [
        { from: 9, text: "Hey Vikram! I noticed you're into game dev. Want to learn Arduino?" },
        { from: 7, text: "Absolutely! I've been thinking about hardware for game controllers." },
        { from: 9, text: "That's a cool use case. Happy to teach you the basics." },
      ],
    },
  ];
  let msgCount = 0;
  for (const convo of convos) {
    for (let i = 0; i < convo.messages.length; i++) {
      const msg = convo.messages[i];
      await prisma.message.create({
        data: {
          senderId: userIds[msg.from],
          receiverId: userIds[convo.between.find((id) => id !== msg.from)!],
          content: msg.text,
          read: i < convo.messages.length - 1,
          createdAt: new Date(Date.now() - (convo.messages.length - i) * 3600000),
        },
      });
      msgCount++;
    }
  }
  console.log(`  Created ${msgCount} messages`);

  // 7. Create notifications
  console.log("Creating notifications...");
  const notifs = [
    { userIdx: 0, type: "SESSION_REQUEST", content: "Rahul Mehta wants to swap Guitar for Python" },
    { userIdx: 0, type: "MESSAGE", content: "New message from Rahul Mehta" },
    { userIdx: 0, type: "CERTIFICATE_VERIFIED", content: "Your Python certification has been verified!" },
    { userIdx: 1, type: "SESSION_REQUEST", content: "Priya Sharma accepted your swap request" },
    { userIdx: 2, type: "MESSAGE", content: "New message from Arjun Reddy" },
    { userIdx: 3, type: "SESSION_REQUEST", content: "Ananya Patel wants to swap Figma for TypeScript" },
    { userIdx: 5, type: "CERTIFICATE_VERIFIED", content: "Your Calculus certification has been verified!" },
    { userIdx: 6, type: "SESSION_REQUEST", content: "Sneha Gupta wants to teach you French" },
    { userIdx: 7, type: "MESSAGE", content: "New message from Aditya Joshi about Arduino" },
    { userIdx: 9, type: "SESSION_REQUEST", content: "Vikram Singh wants to learn Arduino from you" },
  ];
  for (const n of notifs) {
    await prisma.notification.create({
      data: {
        userId: userIds[n.userIdx],
        type: n.type,
        content: n.content,
        read: Math.random() > 0.5,
      },
    });
  }
  console.log(`  Created ${notifs.length} notifications`);

  console.log("\nSeed complete!");
  console.log("All users have password: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
