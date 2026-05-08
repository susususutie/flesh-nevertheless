import { defineConfig } from "vite-plus";
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [react()],
});
