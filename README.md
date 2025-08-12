# Project 08 #AIAugustAppADay: Fake News Detector

![Last Commit](https://img.shields.io/github/last-commit/davedonnellydev/ai-august-2025-08)

**📆 Date**: 12/Aug/2025  
**🎯 Project Objective**: Paste a news article, get an AI’s “fake or not” prediction with justification.  
**🚀 Features**: Paste article; AI checks reliability, returns verdict/explanation. Includes sources for justification.  
**🛠️ Tech used**: Next.js, TypeScript, OpenAI API  
**▶️ Live Demo**: [https://ai-august-2025-08.netlify.app/](https://ai-august-2025-08.netlify.app/)  

## 🗒️ Summary

Today’s project was an AI-powered fake news detector — a fascinating exercise in breaking down a big challenge into distinct steps. After consulting ChatGPT for an initial approach (which made a lot of sense) and sketching out an initial plan ([ai-august-2025-08.drawio.png](./ai-august-2025-08.drawio.png)), I designed the app to work like this:

1. **Extract article:** The app visits the provided URL via a GET request, pulls the article content, and cleans it up using the `@mozilla/readability` package.
2. **Identify claims:** The cleaned text is sent to the OpenAI API to identify and extract 5–20 claims made in the article.
3. **Gather evidence:** For each claim, the app makes a separate call to collect relevant evidence.
4. **Assess credibility:** Using the claims and gathered evidence, the API assesses the credibility of each claim.
5. **Display results:** The analysis is returned to the front end for the user to review.

Everything came together nicely… until deployment. In testing, the app worked perfectly, but in production on Netlify, it failed. The culprit? Netlify’s 10-second timeout limit on functions. Unfortunately, the three chained OpenAI API calls take longer than that. Possible fixes include splitting each API step into separate calls (which could still risk timeouts), upgrading to Netlify Pro (26-second limit), or both — but that’s work for after August.  

One other curiosity: with the new GPT-5 model, the `temperature` parameter has been removed from the API calls. I’m curious to hear if others know why — and whether there’s now another way to tweak that creative/precision balance.

**Lessons learned**

- Chaining multiple heavy API calls can quickly run into platform timeout limits — plan for this early.
- Splitting processes into smaller calls can make them more resilient, but sometimes platform limits will still force architectural changes.
- Feature changes in AI models (like removing `temperature`) can impact workflows — stay on top of release notes.

**Final thoughts**  
This app has a lot of potential, but to make it production-ready, I’ll need to rethink the API flow and hosting setup. For now, it’s a solid prototype and another great learning experience from this challenge.

This project has been built as part of my AI August App-A-Day Challenge. You can read more information on the full project here: [https://github.com/davedonnellydev/ai-august-2025-challenge](https://github.com/davedonnellydev/ai-august-2025-challenge).

## 🧪 Testing

![CI](https://github.com/davedonnellydev/ai-august-2025-08/actions/workflows/npm_test.yml/badge.svg)  
_Note: Test suite runs automatically with each push/merge._

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
