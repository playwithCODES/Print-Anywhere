const nextConfig = {
  output: "export",
  trailingSlash: true,

  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "./"
      : undefined,
};

export default nextConfig;