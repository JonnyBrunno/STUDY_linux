import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/mysql2';
import { topics, quizQuestions } from './drizzle/schema.js';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the database URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port || '3306', 10),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
};

console.log(`Connecting to database: ${config.database} at ${config.host}:${config.port}`);

// Read parsed RHCSA guide
const parsedData = JSON.parse(fs.readFileSync('/tmp/rhcsa_parsed.json', 'utf-8'));

// Quiz questions data
const quizQuestionsData = [
  { num: 1, title: "Definir hostname, máscara, IP, gateway e servername", desc: "Configurar rede e hostname usando nmcli e hostnamectl", difficulty: "medium" },
  { num: 2, title: "Configurar repositórios yum chamado list.repo", desc: "Criar arquivo de repositório em /etc/yum.repos.d/", difficulty: "easy" },
  { num: 3, title: "Instalar Apache, configurar porta 82 e firewall", desc: "Instalar Apache, habilitar systemd, alterar porta, configurar SELinux e firewall", difficulty: "hard" },
  { num: 4, title: "Criação de usuários e grupos", desc: "Criar usuários harry, natasha e sarah com grupos apropriados", difficulty: "medium" },
  { num: 5, title: "Criar diretório /common/admin com permissões", desc: "Configurar diretório com permissões de grupo e SGID", difficulty: "hard" },
  { num: 6, title: "Configurar Autofs", desc: "Configurar mapa direto de autofs para NFS", difficulty: "hard" },
  { num: 7, title: "Utilizar crontab", desc: "Agendar tarefas com crontab e negar acesso", difficulty: "medium" },
  { num: 8, title: "Configurar permissões ACL", desc: "Configurar ACL no arquivo /var/tmp/fstab", difficulty: "hard" },
  { num: 9, title: "Alterar o NFP", desc: "Alterar Network File Provider", difficulty: "easy" },
  { num: 10, title: "Localizar e copiar arquivos", desc: "Localizar arquivos > 4MB em /etc e copiar", difficulty: "medium" },
  { num: 11, title: "Criar usuário, backup e permissões", desc: "Criar usuário com UID, fazer backup, configurar umask", difficulty: "medium" },
  { num: 12, title: "Expiração de senha e sudo", desc: "Configurar política de expiração e privilégios sudo", difficulty: "medium" },
  { num: 13, title: "Criar script bash mysearch", desc: "Criar script para localizar arquivos < 1M", difficulty: "medium" },
  { num: 14, title: "Resetar senha do root", desc: "Resetar senha do root para 'redhat'", difficulty: "easy" },
  { num: 15, title: "Criar partição swap e volumes lógicos", desc: "Criar swap, LV1, VG2 e volumes lógicos", difficulty: "hard" },
  { num: 16, title: "Reconstruir volume lógico", desc: "Estender volume lógico em /mnt/database", difficulty: "hard" },
  { num: 17, title: "Configurar perfil tuned", desc: "Configurar perfil tuned recomendado", difficulty: "easy" },
  { num: 18, title: "Validar e alterar modo SELinux", desc: "Alternar entre enforcing, permissive e disabled", difficulty: "medium" },
  { num: 19, title: "Gerenciar booleanas SELinux", desc: "Listar e habilitar booleana específica", difficulty: "medium" },
  { num: 20, title: "Configurações especiais (grupos, ACL, SGID)", desc: "Configurar grupos, usuários, ACL e SGID", difficulty: "hard" },
  { num: 21, title: "Criar usuários production1-4", desc: "Criar múltiplos usuários com loop", difficulty: "medium" },
  { num: 22, title: "Gerenciar logs e filtrar conteúdo", desc: "Apagar arquivos antigos e filtrar logs", difficulty: "hard" },
  { num: 23, title: "Autenticação SSH com chaves", desc: "Configurar login SSH sem senha", difficulty: "hard" },
  { num: 24, title: "SELinux Boolean para NFS", desc: "Configurar booleana SELinux para NFS com SSH", difficulty: "hard" },
  { num: 25, title: "Zipar conteúdo do diretório", desc: "Criar arquivo zip excluindo diretórios ocultos", difficulty: "medium" },
  { num: 26, title: "Gerenciar contêineres com Podman", desc: "Baixar, executar, configurar e gerenciar contêineres", difficulty: "hard" },
];

async function seedDatabase() {
  let connection;
  try {
    // Create connection pool
    connection = await mysql.createConnection(config);

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
      await connection.end();
    }
  }
}

seedDatabase();
