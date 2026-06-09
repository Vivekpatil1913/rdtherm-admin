# Static assets (`public/`)

Anything in this folder is served from the site root.
For example `public/logo.png` is available at `/logo.png`.

## Where to paste your logo

Put your logo image directly in this folder and name it **`logo.png`**:

```
D:\rdtherm-admin\public\logo.png
```

- Supported formats: PNG (transparent recommended), SVG, JPG, WEBP.
- Recommended: a square-ish mark, at least 80×80px (e.g. 256×256), transparent background.
- If you use a different name or format (e.g. `logo.svg`), update the
  `LOGO_SRC` constant in `src/components/layout/Logo.tsx`.

The logo appears in the sidebar header and on the login/forgot-password screens.
If `logo.png` is missing, a fallback "R" badge is shown automatically.
```
```
