import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
export default config;
