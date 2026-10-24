// Minimal ESM resolve hook: lets Node run the TypeScript modules in lib/ directly
// by resolving extensionless relative imports to their .ts source file.
export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // fall through to the normal resolution
    }
  }
  return nextResolve(specifier, context);
}
