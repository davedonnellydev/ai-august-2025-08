# Project 08 #AIAugustAppADay: Fake News Detector

![Last Commit](https://img.shields.io/github/last-commit/davedonnellydev/ai-august-2025-08)

**📆 Date**: 12/Aug/2025  
**🎯 Project Objective**: Paste a news article, get an AI’s “fake or not” prediction with justification.  
**🚀 Features**: Paste article; AI checks reliability, returns verdict/explanation. Includes sources for justification.  
**🛠️ Tech used**: Next.js, TypeScript, OpenAI API  
**▶️ Live Demo**: *[https://your-demo-url.com](https://your-demo-url.com)*  
*(Link will be added after deployment)*  

## 🗒️ Summary
**Lessons learned**  
*A little summary of learnings*  

**Blockers**  
*Note any blockers here*  

**Final thoughts**  
*Any final thoughts here*  


This project has been built as part of my AI August App-A-Day Challenge. You can read more information on the full project here: [https://github.com/davedonnellydev/ai-august-2025-challenge](https://github.com/davedonnellydev/ai-august-2025-challenge).  

## 🧪 Testing

![CI](https://github.com/davedonnellydev/ai-august-2025-08/actions/workflows/npm_test.yml/badge.svg)  
*Note: Test suite runs automatically with each push/merge.*  

## Quick Start

1. **Clone and install:**
   ```bash
   git clone https://github.com/davedonnellydev/ai-august-2025-08.git
   cd ai-august-2025-08
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key_here
```

### Key Configuration Files

- `next.config.mjs` – Next.js config with bundle analyzer
- `tsconfig.json` – TypeScript config with path aliases (`@/*`)
- `theme.ts` – Mantine theme customization
- `eslint.config.mjs` – ESLint rules (Mantine + TS)
- `jest.config.cjs` – Jest testing config
- `.nvmrc` – Node.js version

### Path Aliases

```ts
import { Component } from '@/components/Component'; // instead of '../../../components/Component'
```

## 📦 Available Scripts
### Build and dev scripts

- `npm run dev` – start dev server
- `npm run build` – bundle application for production
- `npm run analyze` – analyze production bundle

### Testing scripts

- `npm run typecheck` – checks TypeScript types
- `npm run lint` – runs ESLint
- `npm run prettier:check` – checks files with Prettier
- `npm run jest` – runs jest tests
- `npm run jest:watch` – starts jest watch
- `npm test` – runs `prettier:check`, `lint`, `typecheck` and `jest`

### Other scripts

- `npm run storybook` – starts Storybook
- `npm run storybook:build` – builds Storybook to `storybook-static`
- `npm run prettier:write` – formats files with Prettier


## 📜 License
![GitHub License](https://img.shields.io/github/license/davedonnellydev/ai-august-2025-08)  
This project is licensed under the MIT License.  
