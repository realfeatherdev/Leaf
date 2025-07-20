import { isVec3 } from "../../lib/prismarinedb";
import { TimeIntervals } from "../dailyRewards";

export function vec3ToChunkCoordinates(vec3) {
    if (!isVec3(vec3)) return { x: 0, z: 0 };
    return {
        x: Math.floor(vec3.x / 16),
        z: Math.floor(vec3.z / 16),
    };
}

export function XZToChunkCoordinates(x, z) {
    return vec3ToChunkCoordinates({ x, y: 0, z });
}

export function getDistanceXZ(p1, p2) {
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dz * dz);
}

export function getSurroundingChunkCoords(x, z) {
    let coords = {};
    coords.push({ x: x - 1, z });
    coords.push({ x: x + 1, z });
    coords.push({ x, z: z - 1 });
    coords.push({ x, z: z + 1 });
    return coords;
}

/**
 * Calculates an activity score (0.0 - 99.9) based on:
 * - Weighted statistics over 3 days
 * - Influence from nearby scores based on distance
 *
 * @param {Object} config - Configuration object
 * @param {Object.<string, number[]>} config.stats - Object of stat arrays (each with 3 numbers, 1 per day)
 * @param {Object.<string, number>} config.weights - Weights for each stat (higher = more important)
 * @param {Array<{x: number, z: number, score: number}>} config.nearbyScores - Other scores with positions
 * @param {{x: number, z: number}} config.position - Current XZ position
 * @param {Object} config.influence - Influence settings
 * @param {number} config.influence.maxDistance - Max distance to be influenced by a nearby score
 * @param {number} config.influence.falloffRate - How fast influence drops with distance
 * @param {number} config.influence.influenceStrength - Between 0 and 1, how much nearby scores affect final result
 *
 * @returns {number} Activity score between 0.0 and 99.9 (rounded to 1 decimal place)
 */
export function getActivityScore({
    stats,
    weights,
    nearbyScores,
    position,
    influence,
}) {
    let totalWeight = 0;
    let statScore = 0;

    for (const [key, days] of Object.entries(stats)) {
        const weight = weights[key] ?? 1;
        const avg = days.reduce((a, b) => a + b, 0) / days.length;
        statScore += avg * weight;
        totalWeight += weight;
    }

    let baseScore = statScore / totalWeight || 0;
    baseScore = Math.min(baseScore, 99);

    let totalInfluence = 0;
    let weightedScore = 0;

    for (const other of nearbyScores) {
        const dx = other.x - position.x;
        const dz = other.z - position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > influence.maxDistance) continue;
        if (other.score <= baseScore) continue;

        const falloff = Math.exp(-dist * influence.falloffRate); // exponential falloff
        const influenceAmount = falloff * influence.influenceStrength;

        weightedScore += other.score * influenceAmount;
        totalInfluence += influenceAmount;
    }

    const influenceScore =
        totalInfluence > 0 ? weightedScore / totalInfluence : 0;

    const finalScore =
        totalInfluence > 0
          ? baseScore * (1 - influence.influenceStrength) + influenceScore * influence.influenceStrength
            : baseScore;
    

    return Math.round(Math.min(finalScore, 99.9) * 10) / 10;
}

export let trackerInterval = new TimeIntervals(129600000);