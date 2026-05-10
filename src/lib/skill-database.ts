/**
 * Skill & Technology Database
 * Used by job-match.ts to extract keywords from job postings.
 *
 * Each entry is lowercase; matching is case-insensitive.
 */

export const SKILL_DB: Record<string, string[]> = {
  // ── Programming Languages ──────────────────────────────────
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'c', 'go',
    'golang', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r',
    'matlab', 'dart', 'elixir', 'haskell', 'lua', 'perl', 'bash', 'shell',
    'powershell', 'objective-c', 'groovy', 'clojure', 'f#', 'vba',
  ],

  // ── Frontend ───────────────────────────────────────────────
  frontend: [
    'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'vuejs', 'angular',
    'next.js', 'nextjs', 'nuxt', 'nuxt.js', 'svelte', 'sveltekit',
    'remix', 'gatsby', 'html', 'css', 'sass', 'scss', 'less',
    'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui',
    'chakra ui', 'ant design', 'storybook', 'redux', 'zustand',
    'mobx', 'recoil', 'jotai', 'graphql', 'apollo', 'webpack',
    'vite', 'parcel', 'rollup', 'babel', 'jest', 'cypress', 'playwright',
    'testing-library', 'vitest', 'three.js', 'webgl', 'd3.js',
  ],

  // ── Backend ────────────────────────────────────────────────
  backend: [
    'node.js', 'nodejs', 'express', 'express.js', 'fastify', 'koa',
    'nestjs', 'nest.js', 'django', 'flask', 'fastapi', 'sqlalchemy',
    'rails', 'ruby on rails', 'spring', 'spring boot', 'springboot',
    'laravel', 'symfony', 'aspnet', 'asp.net', '.net', 'dotnet',
    'gin', 'fiber', 'echo', 'actix', 'axum', 'phoenix', 'sinatra',
    'grpc', 'rest', 'restful', 'graphql', 'websocket', 'microservices',
    'soap', 'oauth', 'jwt', 'api',
  ],

  // ── Databases ──────────────────────────────────────────────
  databases: [
    'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'mssql',
    'sql server', 'oracle', 'mongodb', 'mongoose', 'redis', 'memcached',
    'elasticsearch', 'opensearch', 'cassandra', 'dynamodb', 'firestore',
    'supabase', 'planetscale', 'cockroachdb', 'neo4j', 'influxdb',
    'clickhouse', 'snowflake', 'bigquery', 'sql', 'nosql', 'prisma',
    'sequelize', 'typeorm', 'drizzle',
  ],

  // ── Cloud & DevOps ─────────────────────────────────────────
  devops: [
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
    'docker', 'kubernetes', 'k8s', 'helm', 'terraform', 'ansible',
    'puppet', 'chef', 'vagrant', 'ci/cd', 'cicd', 'jenkins', 'gitlab ci',
    'github actions', 'circleci', 'travis ci', 'argocd', 'flux',
    'nginx', 'apache', 'caddy', 'linux', 'ubuntu', 'debian', 'centos',
    'bash scripting', 'prometheus', 'grafana', 'elk', 'datadog',
    'new relic', 'sentry', 'cloudflare', 'vercel', 'netlify',
    'heroku', 'digitalocean', 'lambda', 's3', 'ec2', 'rds', 'vpc',
    'load balancer', 'cdn', 'serverless',
  ],

  // ── Mobile ─────────────────────────────────────────────────
  mobile: [
    'ios', 'android', 'react native', 'flutter', 'dart', 'swiftui',
    'jetpack compose', 'xamarin', 'ionic', 'capacitor', 'expo',
    'xcode', 'android studio', 'firebase',
  ],

  // ── Data / ML / AI ─────────────────────────────────────────
  data: [
    'machine learning', 'deep learning', 'ai', 'artificial intelligence',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
    'pandas', 'numpy', 'matplotlib', 'seaborn', 'opencv', 'nlp',
    'computer vision', 'llm', 'langchain', 'hugging face', 'transformers',
    'spark', 'hadoop', 'airflow', 'dbt', 'tableau', 'power bi',
    'looker', 'data science', 'data engineering', 'etl', 'pipeline',
    'statistics', 'regression', 'classification', 'neural network',
  ],

  // ── Tools & Platforms ──────────────────────────────────────
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
    'notion', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'linear', 'asana', 'trello', 'slack', 'vs code', 'intellij',
    'vim', 'postman', 'insomnia', 'swagger', 'openapi', 'unix',
    'macos', 'windows', 'wsl', 'npm', 'yarn', 'pnpm', 'pip',
    'poetry', 'cargo', 'maven', 'gradle', 'webpack', 'sonarqube',
  ],

  // ── Methodologies ─────────────────────────────────────────
  methods: [
    'agile', 'scrum', 'kanban', 'tdd', 'bdd', 'ddd', 'oop',
    'functional programming', 'clean code', 'solid', 'design patterns',
    'microservices', 'monorepo', 'pair programming', 'code review',
    'unit testing', 'integration testing', 'e2e testing', 'performance',
    'security', 'seo', 'accessibility', 'a11y', 'i18n',
    'devops', 'sre', 'platform engineering', 'devsecops',
  ],

  // ── Soft Skills (TR + EN) ──────────────────────────────────
  soft: [
    // EN
    'leadership', 'communication', 'teamwork', 'problem solving',
    'analytical', 'critical thinking', 'adaptability', 'creativity',
    'project management', 'time management', 'collaboration',
    'mentoring', 'coaching', 'presentation', 'negotiation',
    'customer focus', 'stakeholder management', 'cross-functional',
    // TR
    'liderlik', 'iletişim', 'takım çalışması', 'problem çözme',
    'analitik düşünce', 'eleştirel düşünme', 'adaptasyon',
    'yaratıcılık', 'proje yönetimi', 'zaman yönetimi',
    'mentorluk', 'sunum', 'müzakere',
  ],
}

/** Flat list of all skills for fast lookup */
export const ALL_SKILLS: string[] = Object.values(SKILL_DB).flat()

/** Category label per skill (for display) */
export const SKILL_CATEGORY: Record<string, string> = {}
for (const [cat, skills] of Object.entries(SKILL_DB)) {
  for (const skill of skills) {
    SKILL_CATEGORY[skill] = cat
  }
}
