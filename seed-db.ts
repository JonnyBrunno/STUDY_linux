import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import { topics, quizQuestions } from './drizzle/schema';
import mysql from 'mysql2/promise';


// Load environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the database URL
const url = new URL(DATABASE_URL);
const config: any = {
  host: url.hostname,
  port: parseInt(url.port || '4000', 10),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
};

console.log(`Connecting to database: ${config.database} at ${config.host}:${config.port}`);

// Read parsed RHCSA guide
const parsedData = JSON.parse(fs.readFileSync('/tmp/rhcsa_parsed.json', 'utf-8'));

// Quiz questions data
const quizQuestionsData = [
  { num: 1, title: "Definir hostname, máscara, IP, gateway e servername", desc: "Configurar rede e hostname usando nmcli e hostnamectl", difficulty: "medium" as const },
  { num: 2, title: "Configurar repositórios yum chamado list.repo", desc: "Criar arquivo de repositório em /etc/yum.repos.d/", difficulty: "easy" as const },
  { num: 3, title: "Instalar Apache, configurar porta 82 e firewall", desc: "Instalar Apache, habilitar systemd, alterar porta, configurar SELinux e firewall", difficulty: "hard" as const },
  { num: 4, title: "Criação de usuários e grupos", desc: "Criar usuários harry, natasha e sarah com grupos apropriados", difficulty: "medium" as const },
  { num: 5, title: "Criar diretório /common/admin com permissões", desc: "Configurar diretório com permissões de grupo e SGID", difficulty: "hard" as const },
  { num: 6, title: "Configurar Autofs", desc: "Configurar mapa direto de autofs para NFS", difficulty: "hard" as const },
  { num: 7, title: "Utilizar crontab", desc: "Agendar tarefas com crontab e negar acesso", difficulty: "medium" as const },
  { num: 8, title: "Configurar permissões ACL", desc: "Configurar ACL no arquivo /var/tmp/fstab", difficulty: "hard" as const },
  { num: 9, title: "Alterar o NFP", desc: "Alterar Network File Provider", difficulty: "easy" as const },
  { num: 10, title: "Localizar e copiar arquivos", desc: "Localizar arquivos > 4MB em /etc e copiar", difficulty: "medium" as const },
  { num: 11, title: "Criar usuário, backup e permissões", desc: "Criar usuário com UID, fazer backup, configurar umask", difficulty: "medium" as const },
  { num: 12, title: "Expiração de senha e sudo", desc: "Configurar política de expiração e privilégios sudo", difficulty: "medium" as const },
  { num: 13, title: "Criar script bash mysearch", desc: "Criar script para localizar arquivos < 1M", difficulty: "medium" as const },
  { num: 14, title: "Resetar senha do root", desc: "Resetar senha do root para 'redhat'", difficulty: "easy" as const },
  { num: 15, title: "Criar partição swap e volumes lógicos", desc: "Criar swap, LV1, VG2 e volumes lógicos", difficulty: "hard" as const },
  { num: 16, title: "Reconstruir volume lógico", desc: "Estender volume lógico em /mnt/database", difficulty: "hard" as const },
  { num: 17, title: "Configurar perfil tuned", desc: "Configurar perfil tuned recomendado", difficulty: "easy" as const },
  { num: 18, title: "Validar e alterar modo SELinux", desc: "Alternar entre enforcing, permissive e disabled", difficulty: "medium" as const },
  { num: 19, title: "Gerenciar booleanas SELinux", desc: "Listar e habilitar booleana específica", difficulty: "medium" as const },
  { num: 20, title: "Configurações especiais (grupos, ACL, SGID)", desc: "Configurar grupos, usuários, ACL e SGID", difficulty: "hard" as const },
  { num: 21, title: "Criar usuários production1-4", desc: "Criar múltiplos usuários com loop", difficulty: "medium" as const },
  { num: 22, title: "Gerenciar logs e filtrar conteúdo", desc: "Apagar arquivos antigos e filtrar logs", difficulty: "hard" as const },
  { num: 23, title: "Autenticação SSH com chaves", desc: "Configurar login SSH sem senha", difficulty: "hard" as const },
  { num: 24, title: "SELinux Boolean para NFS", desc: "Configurar booleana SELinux para NFS com SSH", difficulty: "hard" as const },
  { num: 25, title: "Zipar conteúdo do diretório", desc: "Criar arquivo zip excluindo diretórios ocultos", difficulty: "medium" as const },
  { num: 26, title: "Gerenciar contêineres com Podman", desc: "Baixar, executar, configurar e gerenciar contêineres", difficulty: "hard" as const },
];

async function seedDatabase() {
  let connection;
  try {
    // Create connection pool
    connection = await mysql.createConnection({
      ...config,
      ssl: {},
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    // Create drizzle instance
    const db = drizzle(connection);

    console.log('Starting database seeding...');

    // Insert topics
    console.log('Inserting topics...');
    let topicCount = 0;
    for (const section of parsedData.sections) {
      for (const subsection of section.subsections) {
        const content = subsection.content.substring(0, 65000);
        const searchable = content.replace(/[#*`\[\](){}]/g, ' ').replace(/\s+/g, ' ').substring(0, 65000);
        
        await db.insert(topics).values({
          sectionId: section.id,
          subsectionId: subsection.id,
          title: subsection.title,
          content: content,
          searchableText: searchable,
        });
        topicCount++;
      }
    }
    console.log(`✓ Inserted ${topicCount} topics`);

    // Insert quiz questions
    console.log('Inserting quiz questions...');
    for (const q of quizQuestionsData) {
      await db.insert(quizQuestions).values({
        questionNumber: q.num,
        title: q.title,
        description: q.desc,
        expectedAnswer: 'Ver guia de respostas',
        difficulty: q.difficulty,
      });
    }
    console.log(`✓ Inserted ${quizQuestionsData.length} quiz questions`);

    console.log('✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await (connection as any).end();
    }
  }
}

seedDatabase();
