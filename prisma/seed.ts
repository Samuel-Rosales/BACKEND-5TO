import { runSeed } from "./seed/index";

runSeed().catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
});
