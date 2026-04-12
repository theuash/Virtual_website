import { build } from 'vite';

(async () => {
  try {
    await build();
  } catch (e) {
    console.error("VITE BUILD ERROR DETAILS:");
    console.error(e);
    if (e.errors) {
       console.error("SUB ERRORS:", JSON.stringify(e.errors, null, 2));
    }
  }
})();
