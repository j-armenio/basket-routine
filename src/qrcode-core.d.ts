// `@types/qrcode` types the package's entry, which in React Native resolves to its browser build
// (canvas). The QR code is drawn with SVG from the matrix alone, so only the core is imported.
declare module 'qrcode/lib/core/qrcode' {
  export { create } from 'qrcode';
}
