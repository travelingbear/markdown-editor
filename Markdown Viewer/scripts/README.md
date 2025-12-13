# Build Scripts

## Monaco Editor Optimization

### `build-monaco.cjs`

Optimizes Monaco Editor by copying only essential files for markdown editing.

**Usage:**
```bash
npm run optimize:monaco
```

**What it does:**
- Reduces Monaco bundle from 13MB to 4.1MB (68% reduction)
- Keeps only markdown language support
- Removes 80+ unused language files
- Creates automatic backup (`vs.backup`)

**When to run:**
- After `npm install` (first time)
- After updating `monaco-editor` package
- If Monaco files are missing or corrupted

**Rollback:**
```bash
cd src/vendor
rm -rf vs
mv vs.backup vs
```
