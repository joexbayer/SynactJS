import { PLANT_CATALOG, PLANT_REFERENCE, getPlantById, listPlantFilters } from "./plant-catalog.js";

function normalizeSearch(input) {
    return String(input || "").trim().toLowerCase();
}

function includesTerm(value, term) {
    if (!term) return true;
    return String(value || "").toLowerCase().includes(term);
}

export class PlantContextService {
    constructor({ catalog = PLANT_CATALOG, reference = PLANT_REFERENCE } = {}) {
        this.catalog = Array.isArray(catalog) ? catalog.slice() : [];
        this.reference = reference || {};
        this.catalogById = new Map(this.catalog.map((plant) => [plant.id, plant]));
    }

    getReference() {
        return this.reference;
    }

    getFilterOptions() {
        return listPlantFilters();
    }

    getPlantById(plantId) {
        if (this.catalogById.has(plantId)) {
            return this.catalogById.get(plantId);
        }
        return getPlantById(plantId);
    }

    listCatalog({ search = "", filters = {} } = {}) {
        const term = normalizeSearch(search);

        return this.catalog.filter((plant) => {
            if (!plant) return false;

            if (filters.light && filters.light !== "all" && plant.light !== filters.light) {
                return false;
            }

            if (filters.difficulty && filters.difficulty !== "all" && plant.difficulty !== filters.difficulty) {
                return false;
            }

            if (filters.petSafety && filters.petSafety !== "all" && plant.petSafety !== filters.petSafety) {
                return false;
            }

            if (!term) {
                return true;
            }

            return includesTerm(plant.commonName, term)
                || includesTerm(plant.latinName, term)
                || includesTerm(plant.summary, term)
                || includesTerm(plant.description, term)
                || includesTerm(plant.light, term)
                || includesTerm(plant.water, term)
                || includesTerm(plant.difficulty, term)
                || includesTerm(plant.petSafety, term);
        });
    }

    getDayPartTip(dayPart) {
        return this.reference?.dayParts?.[dayPart]
            || this.reference?.dayParts?.morning
            || "Check your plants and log what changed today.";
    }

    getWateringGuide(cadenceKey) {
        return this.reference?.wateringGuide?.[cadenceKey] || "Observe soil moisture before watering.";
    }

    enrichMyPlantRecord(record) {
        if (!record) return null;

        const catalogPlantId = record?.payload?.catalogPlantId;
        const catalogPlant = catalogPlantId ? this.getPlantById(catalogPlantId) : null;

        return {
            ...record,
            catalogPlant
        };
    }
}
