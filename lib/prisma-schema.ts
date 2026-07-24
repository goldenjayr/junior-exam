export type PrismaFieldAst = {
  name: string;
  type: string;
  attributes: string[];
};

export type PrismaModelAst = {
  name: string;
  fields: PrismaFieldAst[];
};

export type PrismaEnumAst = {
  name: string;
  values: string[];
};

export type PrismaSchemaAst = {
  enums: PrismaEnumAst[];
  models: PrismaModelAst[];
};

function findBlockEnd(source: string, openBrace: number): number {
  let depth = 0;
  for (let index = openBrace; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}" && --depth === 0) return index;
  }
  throw new Error("Invalid Prisma schema: unclosed block");
}

function parseAttribute(source: string, start: number): [string, number] {
  const match = /^@([A-Za-z_]\w*)/.exec(source.slice(start));
  if (!match) throw new Error("Invalid Prisma schema field attribute");

  const name = match[1];
  let index = start + match[0].length;
  let args = "";
  if (source[index] === "(") {
    const end = findBlockEnd(source.replaceAll("(", "{").replaceAll(")", "}"), index);
    args = source.slice(index + 1, end);
    index = end + 1;
  }

  if (name === "id" || name === "unique") {
    if (args) throw new Error(`Invalid Prisma field attribute: @${name}`);
    return [name, index];
  }
  if (name === "default") {
    if (!args) throw new Error("Invalid Prisma field attribute: @default");
    return [`default(${args})`, index];
  }
  if (name === "relation") return ["relation", index];
  throw new Error(`Unsupported Prisma field attribute: @${name}`);
}

function parseField(line: string): PrismaFieldAst {
  const match = /^([A-Za-z_]\w*)\s+([A-Za-z_]\w*(?:\[\]|\?)?)(.*)$/.exec(line);
  if (!match) throw new Error(`Invalid Prisma schema field: ${line}`);

  const [, name, type, suffix] = match;
  const attributes: string[] = [];
  let index = 0;
  while (index < suffix.length) {
    while (/\s/.test(suffix[index] ?? "")) index++;
    if (index === suffix.length) break;
    if (suffix[index] !== "@")
      throw new Error(`Invalid Prisma schema field: ${line}`);
    const [attribute, nextIndex] = parseAttribute(suffix, index);
    attributes.push(attribute);
    index = nextIndex;
  }

  return { name, type, attributes };
}

function parseModel(name: string, body: string): PrismaModelAst {
  const fields = body
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean)
    .map(parseField);
  return { name, fields };
}

function parseEnum(name: string, body: string): PrismaEnumAst {
  const values = body
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean);
  if (values.some((value) => !/^[A-Za-z_]\w*$/.test(value)))
    throw new Error(`Invalid Prisma enum value in ${name}`);
  return { name, values };
}

export function parsePrismaSchema(source: string): PrismaSchemaAst {
  const enums: PrismaEnumAst[] = [];
  const models: PrismaModelAst[] = [];
  const declaration = /\b(model|enum|generator|datasource)\s+([A-Za-z_]\w*)\s*\{/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = declaration.exec(source))) {
    const before = source.slice(cursor, match.index).replace(/\/\/.*$/gm, "").trim();
    if (before) throw new Error(`Unsupported Prisma schema syntax: ${before}`);

    const bodyStart = declaration.lastIndex;
    const bodyEnd = findBlockEnd(source, bodyStart - 1);
    const [, kind, name] = match;
    const body = source.slice(bodyStart, bodyEnd);
    if (kind === "model") models.push(parseModel(name, body));
    if (kind === "enum") enums.push(parseEnum(name, body));
    cursor = bodyEnd + 1;
    declaration.lastIndex = cursor;
  }

  const trailing = source.slice(cursor).replace(/\/\/.*$/gm, "").trim();
  if (trailing) throw new Error(`Unsupported Prisma schema syntax: ${trailing}`);
  return { enums, models };
}

export function schemaContains(
  actual: PrismaSchemaAst,
  expected: PrismaSchemaAst
): boolean {
  return (
    expected.enums.every((expectedEnum) => {
      const actualEnum = actual.enums.find(
        (candidate) => candidate.name === expectedEnum.name
      );
      return (
        actualEnum !== undefined &&
        expectedEnum.values.every((value) => actualEnum.values.includes(value))
      );
    }) &&
    expected.models.every((expectedModel) => {
      const actualModel = actual.models.find(
        (candidate) => candidate.name === expectedModel.name
      );
      return (
        actualModel !== undefined &&
        expectedModel.fields.every((expectedField) => {
          const actualField = actualModel.fields.find(
            (candidate) => candidate.name === expectedField.name
          );
          return (
            actualField !== undefined &&
            actualField.type === expectedField.type &&
            expectedField.attributes.every((attribute) =>
              actualField.attributes.includes(attribute)
            )
          );
        })
      );
    })
  );
}
