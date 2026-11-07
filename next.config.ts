import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function config(phase: string): NextConfig {
  return {
    // Keep production builds from overwriting a running development server.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    output: 'export',
    devIndicators: false,
    images: { unoptimized: true },
  };
}
