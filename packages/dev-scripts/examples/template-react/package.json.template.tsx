import type { Project } from "../util";

const template = (project: Project) => ({
  name: "@blocknote/example-" + project.slug,
  private: true,
  version: "0.10.0",
  scripts: {
    start: "vite",
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview",
    lint: "eslint src --max-warnings 0",
  },
  dependencies: {
    "@blocknote/core": "^0.10.0",
    "@blocknote/react": "^0.10.0",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
  },
  devDependencies: {
    "@types/react": "^18.0.25",
    "@types/react-dom": "^18.0.9",
    "@vitejs/plugin-react": "^4.0.4",
    eslint: "^8.10.0",
    vite: "^4.4.8",
  },
  eslintConfig: {
    extends: ["../.eslintrc.js"],
  },
});

export default template;