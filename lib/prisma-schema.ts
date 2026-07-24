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

function findClosingDelimiter(
  source: string,
  start: number,
  open: string,
  close: string
): number {
  let depth = 0;
  let quote = "";
  for (let index = start; index < source.length; index++) {
    const character = source[index];
    if (quote) {
      if (character === "\\" && index + 1 < source.length) {
        index++;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === open) {
      depth++;
    } else if (character === close && --depth === 0) {
      return index;
    }
  }
  throw new Error("Invalid Prisma schema: unclosed delimiter");
}

function findBlockEnd(source: string, openBrace: number): number {
  return findClosingDelimiter(source, openBrace, "{", "}");
}

function stripLineComment(line: string): string {
  let quote = "";
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (quote) {
      if (character === "\\" && index + 1 < line.length) {
        index++;
      } else if (character === quote) {
        quote = "";
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "/" && line[index + 1] === "/") {
      return line.slice(0, index);
    }
  }
  return line;
}

function normalizeAttributeArgs(args: string): string {
  let normalized = "";
  let quote = "";
  for (let index = 0; index < args.length; index++) {
    const character = args[index];
    if (quote) {
      normalized += character;
      if (character === "\\" && index + 1 < args.length) {
        normalized += args[++index];
      } else if (character === quote) {
        quote = "";
      }
    } else if (character === '"' || character === "'") {
      quote = character;
      normalized += character;
    } else if (!/\s/.test(character)) {
      normalized += character;
    }
  }
  return normalized;
}

function parseAttribute(source: string, start: number): [string, number] {
  const match = /^@([A-Za-z_]\w*)/.exec(source.slice(start));
  if (!match) throw new Error("Invalid Prisma schema field attribute");

  const name = match[1];
  let index = start + match[0].length;
  let args = "";
  if (source[index] === "(") {
    const end = findClosingDelimiter(source, index, "(", ")");
    args = source.slice(index + 1, end);
    index = end + 1;
  }

  if (name === "id" || name === "unique") {
    if (args) throw new Error(`Invalid Prisma field attribute: @${name}`);
    return [name, index];
  }
  if (name === "default") {
    if (!args) throw new Error("Invalid Prisma field attribute: @default");
    return [`default(${normalizeAttributeArgs(args)})`, index];
  }
  if (name === "relation")
    return [
      args ? `relation(${normalizeAttributeArgs(args)})` : "relation",
      index,
    ];
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
    .map((line) => stripLineComment(line).trim())
    .filter(Boolean)
    .map(parseField);
  return { name, fields };
}

function parseEnum(name: string, body: string): PrismaEnumAst {
  const values = body
    .split("\n")
    .map((line) => stripLineComment(line).trim())
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
