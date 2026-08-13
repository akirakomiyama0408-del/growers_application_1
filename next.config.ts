import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // CSV/Excelでの顧客一括登録・写真アップロードのため上限を引き上げ
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
