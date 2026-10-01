import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import plugin from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import child_process from "child_process";
import { env } from "process";


// ==========================================================
// VITE CONFIGURATION
// ==========================================================

export default defineConfig(({ command }) => {

    // ==========================================================
    // LOCAL DEVELOPMENT ONLY
    // ==========================================================

    let httpsConfig = undefined;
    let target = "https://localhost:7254";

    if (command === "serve") {

        const baseFolder =
            env.APPDATA !== undefined && env.APPDATA !== ""
                ? `${env.APPDATA}/ASP.NET/https`
                : `${env.HOME}/.aspnet/https`;

        const certificateName = "hiringprojectnew.client";

        const certFilePath = path.join(
            baseFolder,
            `${certificateName}.pem`
        );

        const keyFilePath = path.join(
            baseFolder,
            `${certificateName}.key`
        );


        // ==========================================================
        // CREATE CERTIFICATE FOLDER
        // ==========================================================

        if (!fs.existsSync(baseFolder)) {
            fs.mkdirSync(baseFolder, {
                recursive: true
            });
        }


        // ==========================================================
        // CREATE LOCAL HTTPS CERTIFICATE
        // ==========================================================

        if (
            !fs.existsSync(certFilePath) ||
            !fs.existsSync(keyFilePath)
        ) {

            const result = child_process.spawnSync(
                "dotnet",
                [
                    "dev-certs",
                    "https",
                    "--export-path",
                    certFilePath,
                    "--format",
                    "Pem",
                    "--no-password",
                ],
                {
                    stdio: "inherit",
                }
            );

            if (result.status !== 0) {
                throw new Error(
                    "Could not create local HTTPS certificate."
                );
            }
        }


        // ==========================================================
        // ASP.NET CORE BACKEND TARGET
        // ==========================================================

        target =
            env.ASPNETCORE_HTTPS_PORT
                ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
                : env.ASPNETCORE_URLS
                    ? env.ASPNETCORE_URLS.split(";")[0]
                    : "https://localhost:7254";


        // ==========================================================
        // VITE LOCAL HTTPS
        // ==========================================================

        httpsConfig = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };
    }


    // ==========================================================
    // VITE CONFIG
    // ==========================================================

    return {

        plugins: [
            plugin()
        ],


        // ==========================================================
        // PATH ALIAS
        // ==========================================================

        resolve: {
            alias: {
                "@": fileURLToPath(
                    new URL("./src", import.meta.url)
                )
            }
        },


        // ==========================================================
        // DEVELOPMENT SERVER
        // ==========================================================

        server: {

            proxy: {
                "^/weatherforecast": {
                    target,
                    secure: false
                }
            },

            port: parseInt(
                env.DEV_SERVER_PORT || "53027"
            ),

            // HTTPS is used ONLY during local development.
            // Vercel production builds will not use this.
            https: httpsConfig
        }
    };
});