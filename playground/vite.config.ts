import { defineConfig, type UserConfig } from 'vite-plus';
import { qwikVite } from '@builder.io/qwik/optimizer';

const config: UserConfig = defineConfig({
	plugins: [qwikVite({ csr: true })],
});

export default config;
