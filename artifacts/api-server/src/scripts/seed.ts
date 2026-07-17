import bcrypt from "bcryptjs";
import { db, usersTable, patientsTable, groupsTable, patientGroupsTable, publicationsTable, consultationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if nutritionist already exists
  const existingNutri = await db.select().from(usersTable).where(eq(usersTable.role, "nutricionista"));
  if (existingNutri.length > 0) {
    console.log("⚠️  Nutricionista já existe, pulando seed.");
    process.exit(0);
  }

  // 1. Create nutritionist
  const nutriHash = await bcrypt.hash("100103so", 10);
  const [nutri] = await db.insert(usersTable).values({
    name: "Dra. Sofia",
    email: "maldotesofia@gmail.com",
    passwordHash: nutriHash,
    role: "nutricionista",
    patientId: null,
  }).returning();
  console.log("✅ Nutricionista criada:", nutri.email);

  // 2. Create groups
  const [grupoEmagrecimento, grupoMassa, grupoSaude] = await db.insert(groupsTable).values([
    { name: "Emagrecimento", color: "#2E7D32", description: "Pacientes com objetivo de perda de peso" },
    { name: "Ganho de Massa", color: "#1565C0", description: "Pacientes focados em hipertrofia" },
    { name: "Saúde Geral", color: "#6A1B9A", description: "Manutenção e bem-estar geral" },
  ]).returning();
  console.log("✅ Grupos criados");

  // 3. Create patient users and patients
  const patient1Hash = await bcrypt.hash("paciente123", 10);
  const [user1] = await db.insert(usersTable).values({
    name: "Maria Oliveira",
    email: "maria@email.com",
    passwordHash: patient1Hash,
    role: "paciente",
    patientId: null,
  }).returning();

  const [patient1] = await db.insert(patientsTable).values({
    name: "Maria Oliveira",
    email: "maria@email.com",
    phone: "(11) 99876-5432",
    birthDate: "1990-03-15",
    sex: "feminino",
    userId: user1.id,
  }).returning();

  await db.update(usersTable).set({ patientId: String(patient1.id) }).where(eq(usersTable.id, user1.id));

  const patient2Hash = await bcrypt.hash("paciente123", 10);
  const [user2] = await db.insert(usersTable).values({
    name: "Carlos Mendes",
    email: "carlos@email.com",
    passwordHash: patient2Hash,
    role: "paciente",
    patientId: null,
  }).returning();

  const [patient2] = await db.insert(patientsTable).values({
    name: "Carlos Mendes",
    email: "carlos@email.com",
    phone: "(21) 98765-4321",
    birthDate: "1985-07-22",
    sex: "masculino",
    userId: user2.id,
  }).returning();

  await db.update(usersTable).set({ patientId: String(patient2.id) }).where(eq(usersTable.id, user2.id));

  const patient3Hash = await bcrypt.hash("paciente123", 10);
  const [user3] = await db.insert(usersTable).values({
    name: "Fernanda Costa",
    email: "fernanda@email.com",
    passwordHash: patient3Hash,
    role: "paciente",
    patientId: null,
  }).returning();

  const [patient3] = await db.insert(patientsTable).values({
    name: "Fernanda Costa",
    email: "fernanda@email.com",
    phone: "(31) 97654-3210",
    birthDate: "1995-11-08",
    sex: "feminino",
    userId: user3.id,
  }).returning();

  await db.update(usersTable).set({ patientId: String(patient3.id) }).where(eq(usersTable.id, user3.id));

  console.log("✅ 3 Pacientes criados");

  // 4. Add patients to groups
  await db.insert(patientGroupsTable).values([
    { patientId: patient1.id, groupId: grupoEmagrecimento.id },
    { patientId: patient2.id, groupId: grupoMassa.id },
    { patientId: patient3.id, groupId: grupoSaude.id },
    { patientId: patient3.id, groupId: grupoEmagrecimento.id },
  ]);
  console.log("✅ Membros adicionados aos grupos");

  // 5. Create consultations
  const today = new Date();
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const toDateStr = (d: Date) => d.toISOString().split("T")[0];

  const [consulta1] = await db.insert(consultationsTable).values({
    patientId: patient1.id,
    type: "avaliacao_inicial",
    date: toDateStr(twoMonthsAgo),
    weight: 78.5,
    height: 165,
    bmi: 28.8,
    waistCm: 88,
    hipCm: 100,
    abdomenCm: 90,
    armCm: 32,
    thighCm: 56,
    calfCm: 37,
    notes: "Paciente relata sedentarismo. Objetivo: perda de 10kg em 6 meses.",
  }).returning();

  await db.insert(consultationsTable).values({
    patientId: patient1.id,
    type: "cardapio",
    date: toDateStr(twoMonthsAgo),
    objective: "Déficit calórico moderado para emagrecimento saudável",
    vetKcal: 1600,
    restrictions: "Intolerância à lactose",
    additionalGuidance: "Beber 2L de água por dia. Praticar caminhada 30min/dia.",
  });

  await db.insert(consultationsTable).values({
    patientId: patient1.id,
    type: "reavaliacao",
    date: toDateStr(oneMonthAgo),
    weight: 75.2,
    height: 165,
    bmi: 27.6,
    waistCm: 85,
    hipCm: 97,
    abdomenCm: 87,
    armCm: 31,
    thighCm: 54,
    calfCm: 36,
    evolutionNotes: "Excelente adesão ao plano. Paciente perdeu 3.3kg no primeiro mês.",
    baselineConsultationId: consulta1.id,
  });

  await db.insert(consultationsTable).values({
    patientId: patient2.id,
    type: "avaliacao_inicial",
    date: toDateStr(oneMonthAgo),
    weight: 72,
    height: 178,
    bmi: 22.7,
    waistCm: 78,
    hipCm: 92,
    abdomenCm: 80,
    armCm: 34,
    thighCm: 52,
    calfCm: 36,
    notes: "Atleta amador. Objetivo: ganho de 5kg de massa muscular.",
  });

  console.log("✅ Consultas criadas");

  // 6. Create publications
  await db.insert(publicationsTable).values([
    {
      title: "Guia Completo de Alimentação Anti-inflamatória",
      description: "Descubra como a dieta anti-inflamatória pode transformar sua saúde e bem-estar. Inclui lista de alimentos, receitas práticas e dicas do dia a dia.",
      category: "ebook",
      status: "publicado",
      visibility: "geral",
      publishedAt: new Date(),
    },
    {
      title: "Receita: Bowl de Açaí Proteico",
      description: "Uma versão nutritiva e deliciosa do clássico açaí bowl, com whey protein e frutas da estação. Perfeito para o café da manhã ou pós-treino.",
      category: "receita",
      status: "publicado",
      visibility: "geral",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Como Ler Rótulos de Alimentos",
      description: "Aprenda a decifrar as informações nutricionais nas embalagens e faça escolhas mais inteligentes no supermercado.",
      category: "artigo",
      status: "publicado",
      visibility: "geral",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Aula: Hidratação e Performance",
      description: "Vídeo-aula sobre a importância da hidratação para o desempenho físico e cognitivo. Aprenda quanto e quando beber água.",
      category: "video",
      status: "rascunho",
      visibility: "grupos",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ]);

  console.log("✅ Publicações criadas");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Nutricionista: ana@nutriapp.com / nutri123");
  console.log("   Paciente 1:    maria@email.com / paciente123");
  console.log("   Paciente 2:    carlos@email.com / paciente123");
  console.log("   Paciente 3:    fernanda@email.com / paciente123");
}

seed().catch(console.error).finally(() => process.exit(0));
