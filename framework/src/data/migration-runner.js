import { fail } from "../errors.js";

function normalizeMigrations(migrations = []) {
    if (!Array.isArray(migrations)) {
        fail("S016", "migrations must be an array.", { context: "data.migrations.normalize" });
    }

    const map = new Map();

    for (const entry of migrations) {
        let version;
        let up;

        if (typeof entry === "function") {
            version = Number(entry.version);
            up = entry;
        } else if (entry && typeof entry === "object") {
            version = Number(entry.version);
            up = entry.up;
        }

        if (!Number.isInteger(version) || version < 1 || typeof up !== "function") {
            fail("S016", "Each migration must provide { version: number >= 1, up: function }.", {
                context: "data.migrations.normalize"
            });
        }

        if (map.has(version)) {
            fail("S016", `Duplicate migration version ${version} detected.`, {
                context: "data.migrations.normalize",
                version
            });
        }

        map.set(version, up);
    }

    return map;
}

export class MigrationRunner {
    constructor({ migrations = [] } = {}) {
        this.migrations = normalizeMigrations(migrations);
    }

    async run(currentVersion, targetVersion, context = {}) {
        const fromVersion = Number(currentVersion) || 0;
        const toVersion = Number(targetVersion) || 0;

        if (!Number.isInteger(fromVersion) || fromVersion < 0) {
            fail("S016", "currentVersion must be an integer >= 0.", {
                context: "data.migrations.run"
            });
        }

        if (!Number.isInteger(toVersion) || toVersion < 0) {
            fail("S016", "targetVersion must be an integer >= 0.", {
                context: "data.migrations.run"
            });
        }

        if (toVersion < fromVersion) {
            fail("S016", "targetVersion cannot be less than currentVersion.", {
                context: "data.migrations.run",
                fromVersion,
                toVersion
            });
        }

        const applied = [];

        for (let version = fromVersion + 1; version <= toVersion; version++) {
            const migration = this.migrations.get(version);
            if (!migration) {
                continue;
            }

            await migration({
                ...context,
                version,
                fromVersion,
                toVersion
            });
            applied.push(version);
        }

        return {
            fromVersion,
            toVersion,
            applied
        };
    }
}
