import * as glob from "glob";
import * as fs from "node:fs";
import * as path from "node:path";
import prettier from "prettier";
import React from "react";
import ReactDOM from "react-dom/server";
import { Project, getExampleProjects, groupProjects } from "./util";

const dir = path.parse(import.meta.url.replace("file://", "")).dir;

async function writeTemplate(project: Project, templateFile: string) {
  const template = await import(templateFile);
  const ret = await template.default(project);

  const targetFilePath = path.join(
    "../../",
    project.pathFromRoot,
    path.basename(templateFile).replace(".template.tsx", "")
  );

  let stringOutput: string | undefined = undefined;
  if (React.isValidElement(ret)) {
    stringOutput = ReactDOM.renderToString(ret);

    const prettierConfig = await prettier.resolveConfig(targetFilePath);
    stringOutput = prettier.format(stringOutput, {
      ...prettierConfig,
      parser: "html",
    }) as string;
  } else if (typeof ret === "string") {
    stringOutput = ret;
  } else if (typeof ret === "object") {
    stringOutput = JSON.stringify(ret, undefined, 2);
  } else {
    throw new Error("unsupported template");
  }

  fs.writeFileSync(targetFilePath, stringOutput);

  try {
    // fs.unlinkSync(targetFilePath);
  } catch (e) {}
  console.log("written", targetFilePath);
}

async function generateCodeForExample(project: Project) {
  const templates = glob.sync(
    path.resolve(dir, "./template-react/*.template.tsx")
  );

  for (const template of templates) {
    await writeTemplate(project, template);
  }
}

async function generateExamplesData(projects: Project[]) {
  const target = path.resolve(dir, "../../../playground/src/examples.gen.tsx");

  const groups = groupProjects(projects);

  const examples = Object.entries(groups).map(([group, projects]) => {
    return {
      group,
      projects,
    };
  });

  const code = `// generated by dev-scripts/examples/gen.ts
  export const examples = ${JSON.stringify(examples, undefined, 2)};`;

  fs.writeFileSync(target, code);
}

const projects = getExampleProjects();

for (const project of projects) {
  console.log("generating code for example", project);
  await generateCodeForExample(project);
}

await generateExamplesData(
  projects.filter((p) => p.config?.playground === true)
);